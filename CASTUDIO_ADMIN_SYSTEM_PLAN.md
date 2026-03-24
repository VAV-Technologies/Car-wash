# CASTUDIO Admin Panel System Plan
## systems.castudio.id

**Document purpose:** This is the complete system specification for the Castudio admin panel. Use this as the source of truth when building all modules. Every database field, view, and business rule is defined here.

---

## 1. System Overview

Castudio operates 3 connected web apps sharing a single Supabase (PostgreSQL) database:

1. **castudio.id** — Customer-facing website. Marketing funnel + booking form. Already built.
2. **systems.castudio.id** — Admin panel (this spec). Full internal operations platform.
3. **track.castudio.id** — Washer/technician panel. Field operations app.

The admin panel has 13 modules built across 4 phases:

- Phase 1 (MVP): Dashboard, Customers CRM, Bookings, Job Tracker, Finance
- Phase 2: Subscriptions, Invoicing, Conversations, Inventory
- Phase 3: Team/Bonus Calculator, Route Planner, Equipment Log
- Phase 4: AI Chatbot, Analytics Engine, Scorecard

---

## 2. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Database | Supabase (PostgreSQL) | Free tier handles Year 1. Built-in auth, RLS, real-time, storage. |
| Backend | Supabase Edge Functions / Next.js API routes | Serverless |
| Frontend (Admin) | Next.js + Tailwind CSS | Recharts for charts, TanStack Table for data tables |
| Frontend (Washer) | Next.js PWA | Installable on phone, offline photo queue |
| Auth | Supabase Auth | Role-based: admin, ops_manager, washer |
| File Storage | Supabase Storage | Before/after photos. Private buckets, signed URLs. |
| Maps | Google Maps Platform | Routes API + Maps JavaScript API |
| Messaging | WhatsApp Business API (360dialog or Twilio) | Auto follow-ups, receipts |
| AI | Claude API (Anthropic) | Chatbot + analytics. Function calling for DB queries. |
| Hosting | Vercel | All 3 subdomains. Auto-deploy from Git. |

Estimated monthly infra cost Year 1: Rp 0-500K (free tiers + WhatsApp API + Claude API).

---

## 3. Data Model — Supabase Tables

### 3.1 customers

```sql
create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique, -- WhatsApp number, primary identifier
  email text,
  address text, -- primary service location
  neighborhood text check (neighborhood in (
    'pondok_indah', 'kemang', 'kebayoran_baru', 'senopati',
    'cilandak', 'pik', 'bsd', 'other'
  )),
  car_model text, -- e.g. "Toyota Alphard"
  plate_number text, -- Nopol
  acquisition_source text check (acquisition_source in (
    'instagram', 'referral', 'guerrilla', 'apartment_partner',
    'walk_in', 'website', 'whatsapp'
  )),
  referred_by uuid references customers(id), -- FK to referring customer
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Computed fields (query-time or materialized):
-- referrals_made: count of customers where referred_by = this.id
-- total_spent: sum of transactions where customer_id = this.id and type = 'revenue'
-- total_services: count of jobs linked via bookings
-- last_service_date: max(completed_at) from jobs via bookings
-- days_since_last_visit: now() - last_service_date
-- segment: computed based on rules below
-- lifetime_value: total_spent
```

Customer segments (computed):
- `new` — first booking within last 30 days
- `standard_only` — all completed jobs are Standard Wash, no upsell conversion
- `mixed` — has booked 2+ different service types
- `subscriber` — has an active subscription
- `vip` — lifetime value > Rp 5,000,000 OR has Elite subscription
- `churned` — no booking in 60+ days, was previously active (had 2+ bookings)

### 3.2 employees

```sql
create table employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  email text,
  base_salary integer not null default 6600000, -- Rp per month
  hire_date date not null,
  status text check (status in ('active', 'on_leave', 'terminated')) default 'active',
  role text check (role in ('washer', 'ops_manager')) default 'washer',
  notes text,
  created_at timestamptz default now()
);
```

### 3.3 bookings

```sql
create table bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  service_type text not null check (service_type in (
    'standard_wash', 'professional', 'elite_wash',
    'interior_detail', 'exterior_detail', 'window_detail',
    'tire_rims', 'full_detail'
  )),
  scheduled_date date not null,
  scheduled_time text, -- 'morning', 'afternoon', or specific time like '10:00'
  washer_id uuid references employees(id),
  status text not null check (status in (
    'requested', 'confirmed', 'en_route', 'in_progress',
    'completed', 'cancelled', 'no_show'
  )) default 'requested',
  location_address text,
  location_lat float,
  location_lng float,
  is_subscription boolean default false, -- true if using a subscription slot
  subscription_id uuid references subscriptions(id),
  source text check (source in (
    'website', 'whatsapp', 'phone', 'walk_in', 'subscription_auto'
  )),
  notes text, -- special instructions from customer
  cancellation_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Booking status flow:
1. `requested` — customer submits via website or WhatsApp
2. `confirmed` — admin confirms and assigns washer
3. `en_route` — washer departs for location (updated from track.castudio.id)
4. `in_progress` — washer starts the job (updated from track.castudio.id)
5. `completed` — washer finishes, uploads photos (auto-creates job record)
6. `cancelled` — customer or admin cancels (log reason)
7. `no_show` — customer not available (washer reports from field)

### 3.4 jobs

```sql
create table jobs (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references bookings(id),
  washer_id uuid not null references employees(id),
  started_at timestamptz,
  completed_at timestamptz,
  actual_duration_min integer, -- computed: completed_at - started_at in minutes
  travel_time_min integer, -- travel time from previous job (for clustering analysis)
  photos_before text[] not null default '{}', -- array of Supabase Storage URLs, minimum 2 required
  photos_after text[] not null default '{}', -- array of Supabase Storage URLs, minimum 2 required
  chemicals_used jsonb, -- e.g. {"car_shampoo_ml": 30, "snow_foam_ml": 50, "apc_ml": 20, ...}
  customer_rating integer check (customer_rating between 1 and 5),
  customer_feedback text,
  washer_notes text, -- condition notes, issues found, upsell opportunities
  upsell_attempted boolean default false,
  upsell_converted boolean default false,
  upsell_to_service text, -- which service was recommended
  created_at timestamptz default now()
);
```

Default chemical usage templates per service type (used to pre-populate chemicals_used JSON):

```json
{
  "standard_wash": {
    "car_shampoo_ml": 30,
    "snow_foam_ml": 50,
    "apc_ml": 20,
    "glass_cleaner_ml": 10,
    "tire_dressing_ml": 10,
    "quick_detailer_ml": 15,
    "microfiber_towels_used": 3,
    "water_liters": 80
  },
  "professional": {
    "car_shampoo_ml": 40,
    "snow_foam_ml": 60,
    "apc_ml": 30,
    "iron_remover_ml": 15,
    "glass_cleaner_ml": 15,
    "tire_dressing_ml": 15,
    "quick_detailer_ml": 20,
    "paint_sealant_ml": 10,
    "microfiber_towels_used": 5,
    "water_liters": 100
  },
  "elite_wash": {
    "car_shampoo_ml": 40,
    "snow_foam_ml": 60,
    "apc_ml": 40,
    "iron_remover_ml": 20,
    "tar_remover_ml": 10,
    "glass_cleaner_ml": 20,
    "glass_coating_ml": 5,
    "tire_dressing_ml": 20,
    "quick_detailer_ml": 25,
    "paint_sealant_ml": 15,
    "microfiber_towels_used": 6,
    "water_liters": 120
  },
  "interior_detail": {
    "apc_ml": 60,
    "leather_conditioner_ml": 15,
    "dashboard_protectant_ml": 20,
    "glass_cleaner_ml": 15,
    "odor_neutralizer_ml": 10,
    "microfiber_towels_used": 8,
    "water_liters": 20
  },
  "exterior_detail": {
    "car_shampoo_ml": 40,
    "snow_foam_ml": 60,
    "apc_ml": 30,
    "iron_remover_ml": 25,
    "tar_remover_ml": 15,
    "clay_bar_g": 20,
    "polishing_compound_ml": 15,
    "paint_sealant_ml": 20,
    "glass_cleaner_ml": 20,
    "glass_coating_ml": 5,
    "tire_dressing_ml": 15,
    "microfiber_towels_used": 8,
    "water_liters": 120
  },
  "window_detail": {
    "glass_cleaner_ml": 40,
    "glass_coating_ml": 10,
    "iron_remover_ml": 10,
    "microfiber_towels_used": 4,
    "water_liters": 15
  },
  "tire_rims": {
    "wheel_cleaner_ml": 30,
    "iron_remover_ml": 15,
    "tire_dressing_ml": 25,
    "apc_ml": 20,
    "microfiber_towels_used": 3,
    "water_liters": 30
  },
  "full_detail": {
    "car_shampoo_ml": 50,
    "snow_foam_ml": 80,
    "apc_ml": 80,
    "iron_remover_ml": 30,
    "tar_remover_ml": 20,
    "clay_bar_g": 30,
    "glass_cleaner_ml": 30,
    "glass_coating_ml": 10,
    "leather_conditioner_ml": 20,
    "dashboard_protectant_ml": 25,
    "tire_dressing_ml": 25,
    "wheel_cleaner_ml": 30,
    "paint_sealant_ml": 25,
    "polishing_compound_ml": 20,
    "quick_detailer_ml": 30,
    "odor_neutralizer_ml": 15,
    "degreaser_ml": 20,
    "microfiber_towels_used": 12,
    "water_liters": 200
  }
}
```

### 3.5 subscriptions

```sql
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  tier text not null check (tier in ('essentials', 'plus', 'elite')),
  start_date date not null,
  renewal_date date not null, -- next renewal (monthly)
  monthly_price integer not null, -- Rp
  washes_allocated integer not null, -- per month
  washes_used_this_month integer default 0,
  status text not null check (status in (
    'active', 'paused', 'cancelled', 'expired'
  )) default 'active',
  cancellation_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Subscription tier definitions:
- `essentials`: Rp 339,000/month, 4 Standard Washes allocated, 2.9% discount vs one-time
- `plus`: Rp 449,000/month, 4 Professional Washes allocated, 10% discount vs one-time
- `elite`: Rp 1,000,000/month, 4 Professional + 2 Elite Washes allocated, 22% discount vs one-time

Churn risk (computed): HIGH if any of:
- No booking in 14+ days while subscription active
- Average customer_rating dropped below 4.0 in last 3 jobs
- washes_used_this_month < 50% of washes_allocated with 10 days left in period

### 3.6 transactions

```sql
create table transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id), -- null for expenses
  job_id uuid references jobs(id), -- null for expenses or subscription payments
  subscription_id uuid references subscriptions(id), -- for subscription revenue
  amount integer not null, -- Rp (positive for revenue, negative for expenses)
  type text not null check (type in ('revenue', 'expense')),
  category text not null,
  -- Revenue categories: 'standard_wash', 'professional', 'elite_wash', 'interior_detail',
  --   'exterior_detail', 'window_detail', 'tire_rims', 'full_detail',
  --   'subscription_essentials', 'subscription_plus', 'subscription_elite', 'referral_discount'
  -- Expense categories: 'salary', 'bpjs', 'vehicle_installment', 'fuel', 'vehicle_maintenance',
  --   'equipment_maintenance', 'chemical_restock', 'parking', 'phone_data', 'vehicle_tax',
  --   'power_charging', 'insurance', 'uniforms', 'marketing', 'misc'
  payment_method text check (payment_method in ('bank_transfer', 'qris')),
  payment_status text not null check (payment_status in (
    'pending', 'confirmed', 'failed', 'refunded'
  )) default 'pending',
  -- Payment flow: all customer payments are via online banking (bank transfer / QRIS).
  -- No cash payments. When a job completes, a transaction is created with payment_status = 'pending'.
  -- Admin must manually confirm payment after verifying it arrived in the bank account.
  -- Only confirmed transactions count toward revenue in P&L and dashboard KPIs.
  payment_confirmed_at timestamptz, -- when admin confirmed the payment
  payment_confirmed_by uuid references employees(id), -- which admin confirmed it (for audit trail)
  payment_proof_url text, -- optional: screenshot of bank transfer confirmation from customer
  description text,
  date date not null default current_date,
  receipt_url text, -- Supabase Storage URL for generated receipt (sent after confirmation)
  is_recurring boolean default false, -- true for auto-generated fixed expenses
  created_at timestamptz default now()
);
```

**Payment confirmation flow:**
1. Job completes on track.castudio.id -> transaction auto-created with payment_status = `pending`
2. Customer pays via online banking (bank transfer or QRIS) -- this happens outside the system
3. Admin checks bank account, finds the matching transfer
4. Admin opens the pending transaction in systems.castudio.id and clicks "Confirm Payment"
5. payment_status changes to `confirmed`, payment_confirmed_at and payment_confirmed_by are set
6. Receipt is auto-generated and sent to customer via WhatsApp
7. Transaction now counts toward revenue in all dashboards, P&L, and KPIs

**Important:** Only `confirmed` transactions are included in revenue calculations. `pending` transactions show separately in the Finance module as "Awaiting Payment Confirmation" so admin can track outstanding payments.

For subscription payments: same flow. On renewal date, a pending transaction is created. Admin confirms when the monthly transfer arrives.

For expenses: payment_status is set to `confirmed` immediately on creation (expenses are outflows, not incoming payments to verify).

Service pricing (Rp):
| Service | Price | Variable Cost | Contribution | Margin |
|---------|-------|--------------|-------------|--------|
| standard_wash | 349,000 | 109,000 | 240,000 | 68.8% |
| professional | 649,000 | 140,000 | 509,000 | 78.4% |
| elite_wash | 949,000 | 227,000 | 722,000 | 76.1% |
| interior_detail | 1,039,000 | 139,000 | 900,000 | 86.6% |
| exterior_detail | 1,039,000 | 268,000 | 771,000 | 74.2% |
| window_detail | 689,000 | 110,000 | 579,000 | 84.1% |
| tire_rims | 289,000 | 124,000 | 165,000 | 57.1% |
| full_detail | 2,799,000 | 573,000 | 2,226,000 | 79.5% |

Monthly fixed costs (auto-recurring expenses):
| Category | Amount (Rp) |
|----------|------------|
| salary | 6,600,000 |
| bpjs | 676,000 |
| vehicle_installment | 2,196,000 |
| fuel | 1,950,000 |
| vehicle_maintenance | 650,000 |
| equipment_maintenance | 400,000 |
| parking | 300,000 |
| phone_data | 200,000 |
| vehicle_tax | 175,000 |
| power_charging | 150,000 |
| insurance | 100,000 |
| uniforms | 75,000 |
| TOTAL | 13,472,000 (rounded to 13,500,000) |

### 3.7 inventory

```sql
create table inventory (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  brand text,
  current_qty float not null, -- in the product's unit
  unit text not null, -- 'ml', 'g', 'pcs', 'L'
  min_threshold float not null, -- reorder alert when current_qty drops below this
  cost_per_unit float, -- Rp per unit (for cost tracking)
  last_restocked_at timestamptz,
  last_restocked_qty float,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Initial inventory items (seed data):
| Product | Brand | Initial Qty | Unit | Min Threshold | Cost/Unit (Rp) |
|---------|-------|------------|------|--------------|----------------|
| Car Shampoo | Meguiar's Gold Class | 1890 | ml | 400 | 168 |
| Snow Foam Concentrate | FECO Konsentrat | 5000 | ml | 1000 | 29 |
| All-Purpose Cleaner | SONAX SX Multistar | 10000 | ml | 2000 | 114 |
| Iron Remover | SONAX Iron+Fallout | 750 | ml | 200 | 373 |
| Tar Remover | Prestone Bug & Tar | 500 | ml | 150 | 180 |
| Clay Bar | Meguiar's Individual | 200 | g | 50 | 1695 |
| Glass Cleaner | SONAX Clear Glass | 750 | ml | 200 | 177 |
| Glass Coating | Meguiar's Perfect Clarity | 118 | ml | 30 | 1653 |
| Leather Conditioner | Meguiar's Gold Class 3-in-1 | 400 | ml | 100 | 648 |
| Dashboard Protectant | Sonax Profiline Plastic | 1000 | ml | 250 | 236 |
| Tire Dressing | Meguiar's Endurance Gel | 473 | ml | 120 | 450 |
| Wheel Cleaner | Meguiar's Ultimate All Wheel | 709 | ml | 180 | 375 |
| Paint Sealant | Meguiar's Hybrid Ceramic | 768 | ml | 200 | 430 |
| Degreaser | SONAX Engine Cold Cleaner | 500 | ml | 150 | 220 |
| Odor Neutralizer | CarPro SO2Pure | 500 | ml | 120 | 400 |
| Quick Detailer | Meguiar's Last Touch | 946 | ml | 250 | 264 |
| Polishing Compound | Meguiar's Ultimate Compound | 473 | ml | 120 | 634 |
| Microfiber Towels | Generic | 32 | pcs | 15 | 31000 |

When a job completes, the chemicals_used JSON is parsed and each product's current_qty is decremented accordingly. If current_qty < min_threshold after deduction, a notification alert is created.

### 3.8 equipment

```sql
create table equipment (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand_model text,
  purchase_date date,
  purchase_price integer, -- Rp
  warranty_expiry date,
  maintenance_interval_days integer, -- e.g. 90 for quarterly
  last_maintenance_at date,
  next_maintenance_at date, -- computed or manually set
  status text check (status in ('operational', 'needs_maintenance', 'out_of_service')) default 'operational',
  usage_cycles integer default 0, -- for power station charge cycles
  max_cycles integer, -- e.g. 4000 for power station
  notes text,
  created_at timestamptz default now()
);
```

Initial equipment seed data:
| Name | Brand/Model | Price (Rp) | Maintenance Interval | Notes |
|------|------------|-----------|---------------------|-------|
| Pressure Washer | Karcher K4 Compact | 5,000,000 | 90 days | Check seals, nozzle wear |
| Portable Power Station | Bluetti Premium 100 V2 | 8,000,000 | 180 days | Track charge cycles, rated 4000+ |
| Water Tank + Pump | 500L + 12V DC | 1,450,000 | 90 days | Check pump, tank seams |
| Wet/Dry Vacuum | Krisbow 20L | 1,259,000 | 60 days | Filter cleaning |
| DA Polisher | HL 8050 DA | 1,500,000 | 60 days | Brush/bearing check |
| Air Compressor | Lakoni Fresco 110 | 1,350,000 | 90 days | Oil-less, check valves |
| Vehicle | (financed) | 85,000,000 | 5000 km or 90 days | Oil, tires, brakes, AC |

### 3.9 conversations

```sql
create table conversations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  direction text not null check (direction in ('inbound', 'outbound')),
  channel text not null check (channel in ('whatsapp', 'phone', 'instagram', 'manual')),
  message_type text check (message_type in (
    'general', 'booking_request', 'follow_up', 'subscription_pitch',
    'complaint', 'referral_ask', 'reengagement', 'receipt'
  )),
  content text, -- message content or summary
  sent_at timestamptz not null default now(),
  follow_up_due_at timestamptz, -- when follow-up should happen
  follow_up_completed boolean default false,
  subscription_pitched boolean default false,
  subscription_pitch_result text check (subscription_pitch_result in (
    'converted', 'declined', 'thinking', null
  )),
  created_at timestamptz default now()
);
```

### 3.10 notifications

```sql
create table notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in (
    'follow_up_due', 'low_inventory', 'churn_risk', 'capacity_warning',
    'cash_flow_warning', 'equipment_maintenance', 'rating_drop',
    'reengagement', 'subscription_renewal', 'general'
  )),
  title text not null,
  body text,
  severity text check (severity in ('info', 'warning', 'critical')) default 'info',
  source_module text, -- which module generated this
  source_id uuid, -- FK to relevant record (customer, subscription, equipment, etc.)
  is_read boolean default false,
  is_dismissed boolean default false,
  created_at timestamptz default now()
);
```

---

## 4. Module Specifications

### 4.1 Dashboard

**Phase:** 1 (MVP)

The first screen after login. Answers "how is my business doing right now?" without navigating to any other module.

**Dashboard cards:**

1. **Services This Month** — Count of completed jobs this month vs worst/base/best target for current month number. Shows progress bar with color coding (green = above base, yellow = between worst and base, red = below worst).

2. **Revenue This Month** — Sum of revenue transactions this month. Compared to scenario targets. Sparkline showing daily revenue trend.

3. **Cash Position** — Current cash balance (cumulative revenue - cumulative expenses - startup costs). Burn rate (avg monthly expenses). Months of runway remaining.

4. **Avg Revenue Per Service** — Total revenue / total completed services this month. Target: Rp 562,000 (wash-heavy weighted average). Alert if below Rp 400,000.

5. **Capacity Utilization** — Completed services / max capacity (65 for 1 employee, 130 for 2). Shows percentage with gauge visual.

6. **Active Subscriptions** — Count by tier (Essentials/Plus/Elite). MRR (Monthly Recurring Revenue) total.

7. **Follow-Up Queue** — Count of overdue follow-ups (24hr post-service, 14-day re-engagement, 30-day churn risk). Clickable to go to CRM follow-up view.

8. **Alerts Feed** — Chronological list of notifications from all modules. Filterable by severity and type.

**Scenario comparison targets by month (from business plan):**

```json
{
  "targets": [
    {"month": 1, "worst_svcs": 15, "base_svcs": 20, "best_svcs": 30, "worst_rev": 5200000, "base_rev": 11230000, "best_rev": 16850000},
    {"month": 2, "worst_svcs": 22, "base_svcs": 28, "best_svcs": 40, "worst_rev": 7700000, "base_rev": 15730000, "best_rev": 22470000},
    {"month": 3, "worst_svcs": 30, "base_svcs": 35, "best_svcs": 50, "worst_rev": 10500000, "base_rev": 19670000, "best_rev": 28100000},
    {"month": 4, "worst_svcs": 38, "base_svcs": 40, "best_svcs": 55, "worst_rev": 13300000, "base_rev": 22470000, "best_rev": 30910000},
    {"month": 5, "worst_svcs": 44, "base_svcs": 45, "best_svcs": 60, "worst_rev": 15400000, "base_rev": 25280000, "best_rev": 33720000},
    {"month": 6, "worst_svcs": 50, "base_svcs": 48, "best_svcs": 62, "worst_rev": 17500000, "base_rev": 26960000, "best_rev": 34840000},
    {"month": 7, "worst_svcs": 55, "base_svcs": 50, "best_svcs": 75, "worst_rev": 19200000, "base_rev": 28100000, "best_rev": 42150000},
    {"month": 8, "worst_svcs": 57, "base_svcs": 52, "best_svcs": 85, "worst_rev": 19900000, "base_rev": 29220000, "best_rev": 47780000},
    {"month": 9, "worst_svcs": 60, "base_svcs": 54, "best_svcs": 95, "worst_rev": 20900000, "base_rev": 30350000, "best_rev": 53370000},
    {"month": 10, "worst_svcs": 63, "base_svcs": 55, "best_svcs": 100, "worst_rev": 22000000, "base_rev": 30910000, "best_rev": 56160000},
    {"month": 11, "worst_svcs": 65, "base_svcs": 56, "best_svcs": 105, "worst_rev": 22700000, "base_rev": 31470000, "best_rev": 58960000},
    {"month": 12, "worst_svcs": 65, "base_svcs": 58, "best_svcs": 110, "worst_rev": 22700000, "base_rev": 32600000, "best_rev": 61780000}
  ]
}
```

The business launched in March 2026. Month 1 = March 2026.

### 4.2 Customers (CRM)

**Phase:** 1 (MVP)

**Views:**

1. **All Customers** — Paginated table with search (name, phone, plate_number) and filters (neighborhood, segment, acquisition_source). Columns: name, phone, neighborhood, total_services, total_spent, last_service_date, segment badge. Sortable by any column.

2. **Customer Profile** — Full detail page:
   - Header: name, phone, email, car model, plate, neighborhood, segment badge, acquisition source
   - Subscription card (if active): tier, usage this month, renewal date
   - Purchase history timeline: all completed jobs in reverse chronological order, each showing service type, date, amount, rating, before/after photo thumbnails
   - Referral info: referred by (link to their profile), referrals made (list of referred customers)
   - Conversation log: recent messages, follow-up status
   - Notes section: freeform editable notes
   - Actions: Create booking, Send WhatsApp message, Pitch subscription, Log conversation

3. **Follow-Up Queue** — Filtered list sorted by urgency:
   - 24hr post-service: Job completed yesterday, no follow-up message logged yet
   - 14-day re-engagement: Last service 14+ days ago, not a subscriber
   - 30-day churn risk: Last service 30+ days ago
   - 60-day win-back: Last service 60+ days ago, had 2+ previous bookings
   - Each row shows: customer name, last service, days since, suggested action, WhatsApp quick-send button

4. **Referral Dashboard** — Total referrals, conversion rate, revenue attributed to referrals, top 10 referrers. Each referral tracks: referrer, referred customer, date, Rp 50,000 discount applied (both sides).

5. **Segment View** — Pie chart of customer segments. Click a segment to see filtered customer list. "Standard Only" segment is the primary upsell target list.

### 4.3 Bookings

**Phase:** 1 (MVP)

**Views:**

1. **Operations Board (Management Calendar)** — This is the primary management-level view for overseeing all operations. A full calendar (weekly and daily modes) that shows every booking across ALL washers in one place. The manager sees the complete picture of who is going where, when, and for which customer.

   **Weekly mode:** Column per washer (or single column if 1 employee). Each booking is a block showing: time slot, customer name, service type, neighborhood, and status color. Empty slots are visible so the manager can see available capacity at a glance. If a day has no bookings for a washer, it shows as open.

   **Daily mode:** Timeline view (7am-7pm) with swim lanes per washer. Each booking block shows:
   - Customer name + car model
   - Service type + estimated duration
   - Location (neighborhood tag + address)
   - Status badge (confirmed / en_route / in_progress / completed)
   - Travel time indicator between consecutive jobs (gray bar between blocks)

   **Key management features on Operations Board:**
   - Click any booking block to expand full details: customer profile link, service history, payment status, washer notes
   - Drag-and-drop to reassign a booking to a different washer or reschedule to a different time/day
   - Color coding by status: gray (requested), blue (confirmed), yellow (en_route), green (in_progress), dark green (completed), red (cancelled/no_show)
   - Capacity indicator per day per washer: shows how many service slots are used vs available (max 2-3 per day depending on service types)
   - Map toggle: switch from calendar to map view showing today's bookings as pins, with route lines between them per washer (color coded by washer if multiple). Shows real-time washer location if en_route or in_progress.
   - Filter by washer, neighborhood, service type, status
   - Day summary footer: total services scheduled, total estimated revenue, capacity utilization %

   This view is what differentiates systems.castudio.id from track.castudio.id. The washer panel shows only THEIR schedule for TODAY. The operations board shows ALL schedules across ALL washers across the FULL week, with the ability to manage, reassign, and optimize.

2. **Today's Schedule** — Simplified view of just today's confirmed bookings across all washers. Ordered by time. Shows: time, customer name, service type, location, assigned washer, estimated travel time from previous job, payment status (pending/confirmed). Quick action buttons: contact customer, view on map, reassign washer.

3. **Booking Queue** — Unconfirmed bookings (status = requested) awaiting admin action. Sorted by scheduled_date ascending (most urgent first). Actions: confirm + assign washer, reject with reason, contact customer. Shows customer's booking history and preferred washer if they have one.

4. **New Booking Form** — Fields: select existing customer or create new, service type, date, time preference, location (with Google Maps autocomplete), assign washer (dropdown showing each washer's availability for the selected date), notes. On save: status = confirmed if washer assigned, otherwise requested. Auto-checks for scheduling conflicts before saving.

5. **Lead Time Monitor** — Average days between booking request and scheduled date. Alert if average exceeds 3 days (this is a scaling trigger from business plan Section 8.2 meaning demand is outpacing capacity). Trend chart showing if lead times are growing (signal to hire).

### 4.4 Job Tracker

**Phase:** 1 (MVP)

Auto-created when a booking status changes to "completed" on track.castudio.id. The washer fills in the data from the washer panel.

**Views:**

1. **Job Feed** — Recent completed jobs in reverse chronological order. Card layout showing: customer name, service type, date, duration, rating (stars), before/after photo thumbnails. Click to expand full details.

2. **Quality Dashboard** — Charts showing:
   - Average rating trend (rolling 7-day and 30-day)
   - Complaints count this month (ratings of 1-2)
   - Upsell attempt rate: % of jobs where upsell_attempted = true
   - Upsell conversion rate: of those attempted, % where upsell_converted = true
   - Service duration analysis: actual vs expected by service type

3. **Photo Gallery** — Grid of all before/after photo pairs. Filterable by service type, date range. Purpose: content pipeline for Instagram marketing.

4. **Time Analysis** — Table showing: service type, expected duration, average actual duration, min, max. Identifies if certain services consistently take longer than expected (training need) or shorter (potential quality concern).

**Validation rules:**
- Job cannot be marked complete without minimum 2 photos_before and 2 photos_after
- chemicals_used JSON must be filled (can use default template, washer adjusts)
- customer_rating is collected via WhatsApp follow-up within 24hrs, updated async

### 4.5 Finance

**Phase:** 1 (MVP)

**Views:**

1. **Payment Confirmation Queue** — The most frequently used view. Shows all transactions with payment_status = `pending`, sorted by date (oldest first). Each row shows: customer name, service type, amount, date, time since job completed. Actions: "Confirm Payment" (sets status to confirmed, records who confirmed and when), "Mark Failed" (payment never arrived), "Contact Customer" (WhatsApp quick-send asking about payment). Badge at top shows total pending amount (Rp) so admin knows how much is outstanding. This is checked against the bank account daily.

2. **Monthly P&L** — Revenue (only from `confirmed` transactions) minus variable costs minus fixed costs. Displayed as a table with comparison columns for worst/base/best scenario targets for the current month. Visual indicator showing which scenario the business is tracking closest to. Pending payments shown separately as "Unconfirmed Revenue" below the P&L so admin can see the full picture.

3. **Revenue Breakdown** — Charts showing confirmed revenue split by:
   - Service type (pie chart): what % is Standard vs Professional vs other
   - One-time vs subscription (donut chart)
   - Neighborhood (bar chart): revenue per area
   - Daily trend (line chart): revenue per day this month

4. **Expense Tracker** — List of all expenses. Auto-recurring entries are pre-populated at month start for fixed costs. Manual entry for variable expenses (fuel fill-ups, chemical restocking, equipment repairs). Each entry: date, category, amount, description, receipt photo (optional).

5. **Cash Flow Projection** — Forward-looking 3-month projection based on: current cash + projected revenue (based on recent trend) - projected expenses (fixed + estimated variable). Red alert if projected to hit Rp 10,000,000 threshold within 30 days (this is the Plan C trigger from the business plan). Includes both confirmed and pending payments with pending shown as a separate "expected" line.

6. **Break-Even Monitor** — Current month's completed services count (with confirmed payment) shown against two break-even lines: 32 services (wash-heavy mixed) and 57 services (standard-only worst case). Visual progress bar.

7. **Service Mix Analysis** — Actual service mix percentages vs the business plan assumption (80% washes with 65% Standard / 35% Professional). Highlights if mix is deviating significantly.

8. **Payment Aging Report** — Transactions where payment_status = `pending` for more than 48 hours. Sorted by age. These are potential bad debts or missed payments that need follow-up. Shows customer name, amount, days pending, last contact attempt.

**Auto-recurring expense generation:**
On the 1st of each month, auto-create transaction records for all fixed costs listed in the fixed costs table above. Mark is_recurring = true, payment_status = `confirmed` (expenses don't need payment confirmation). Admin can adjust amounts if they change.

### 4.6 Subscriptions

**Phase:** 2

**Views:**

1. **Subscriber List** — Table: customer name, tier badge, washes used/allocated this month, renewal date, monthly price, status, churn risk badge. Sortable and filterable.

2. **MRR Dashboard** — Monthly Recurring Revenue total, trend over time, breakdown by tier. Target: 19 Elite subscribers to cover all fixed costs (from business plan). Progress bar toward that goal.

3. **Conversion Funnel** — Funnel visualization:
   - Total one-time customers (last 30 days)
   - Follow-up sent (count)
   - Subscription pitched (count)
   - Converted (count)
   - Conversion rate vs 10% target

4. **Churn Alerts** — Subscribers flagged as high churn risk. Each shows: customer name, tier, reason for flag, suggested retention action (call, offer discount, schedule next wash). Actions: dismiss alert, log action taken.

5. **Renewal Calendar** — Calendar view showing upcoming renewals. 7-day advance warning notification.

### 4.7 Invoicing

**Phase:** 2

Auto-generates an invoice when a job status changes to completed (payment_status = pending). Receipt/confirmation is sent to customer only AFTER admin confirms payment.

**Views:**
1. **Invoice List** — All invoices, filterable by date range, customer, payment method, payment status (pending/confirmed/failed). Shows payment confirmation timestamp and who confirmed.
2. **Monthly Summary** — Exportable report: total confirmed revenue, transaction count, breakdown by payment method. For UMKM quarterly tax reporting. Only includes confirmed payments.

**Actions:**
- Invoice auto-created when job completes (with pending status)
- Receipt sent to customer via WhatsApp ONLY after admin confirms payment (not before)
- Generate PDF receipt for download
- Payment aging flag: if pending > 48 hours, auto-notify admin

### 4.8 Conversations

**Phase:** 2

**Views:**
1. **Message Log** — Thread view per customer. Synced from WhatsApp Business API or manually entered. Shows direction (inbound/outbound), timestamp, message type tag.
2. **Follow-Up Tracker** — List of all follow-up tasks. Created automatically when a job completes (24hr follow-up due). Shows: customer, job date, follow-up due, status (pending/completed/overdue), SLA compliance rate.
3. **Template Library** — Pre-built WhatsApp message templates:
   - Post-service follow-up: "Hi [name], thank you for choosing Castudio! How was your [service_type] today? We'd love your feedback."
   - Subscription pitch: "Hi [name], you've used Castudio [count] times now. Did you know our [tier] subscription saves you [discount]% every month?"
   - Re-engagement (14 day): "Hi [name], it's been a while! Your [car_model] might be ready for another wash. Book your next Castudio visit?"
   - Re-engagement (30 day): "Hi [name], we miss you! Here's 15% off your next wash. Valid for 7 days."
   - Referral ask: "Hi [name], enjoying Castudio? Refer a friend and you both get Rp 50,000 off your next service!"
   - Receipt (sent after payment confirmed): "Hi [name], we've received your payment for today's [service_type]. Amount: Rp [amount]. Thank you!"

### 4.9 Inventory

**Phase:** 2

**Views:**
1. **Stock Levels** — Table: product name, brand, current qty, unit, min threshold, status badge (OK / Low / Critical). Status: OK if current > 2x threshold, Low if current < threshold, Critical if current < 50% of threshold.
2. **Depletion Log** — History of auto-deductions linked to specific jobs. Shows what was used, when, for which job.
3. **Restock History** — Manual entries for when stock was replenished. Date, product, quantity added, cost paid.
4. **Cost Analysis** — Actual chemical cost per service type vs the budgeted variable costs from the business plan (e.g., Standard Wash budgeted at Rp 74K consumables).

**Auto-deduction logic:**
When a job record is created (booking status -> completed), parse the chemicals_used JSON. For each product in the JSON, find the matching inventory item and decrement current_qty. If current_qty < min_threshold after deduction, create a notification (type: low_inventory).

### 4.10 Team & Bonus Calculator

**Phase:** 3

**Views:**
1. **Employee List** — Table: name, phone, hire date, status, jobs this month, bonuses earned this month, total comp this month.
2. **Payslip Generator** — For a given employee and month, auto-calculate:
   - Base salary: Rp 6,600,000
   - Per-service bonuses (calculated from completed jobs):
     - Standard Wash: Rp 20,000 per job
     - Professional: Rp 35,000 per job
     - Elite Wash: Rp 50,000 per job
     - Interior/Exterior Detail: Rp 50,000 per job
     - Window Detailing: Rp 30,000 per job
     - Tire & Rims: Rp 15,000 per job
     - Full Detail: Rp 150,000 per job
   - Quality bonus: Rp 500,000 if 0 complaints AND average rating >= 4.8 for the month
   - Attendance bonus: Rp 300,000 if 0 unexcused absences for the month
   - Total compensation = base + sum of per-service + quality + attendance
   - Target range: Rp 7,900,000 - 8,600,000 at 40-50 services/month

3. **Performance Dashboard** — Per employee: services completed trend, average rating, upsell attempt rate, upsell conversion rate.

### 4.11 Route Planner

**Phase:** 3

Requires Google Maps Platform: Directions API + Maps JavaScript API.

**Views:**
1. **Daily Route Optimizer** — Input: today's confirmed bookings with locations. Output: suggested visit order that minimizes total travel time. Shows map with numbered pins and route lines. Estimated total travel time vs sequential order.

2. **Clustering Heatmap** — Map overlay showing density of all customer locations. Color intensity = number of customers in area. Identifies concentration zones for marketing focus.

3. **Revenue Per Neighborhood** — Map view: each neighborhood shown with total revenue generated, number of services, average revenue per service, and estimated revenue per effective hour (factoring in travel time overhead). Purpose: identify which neighborhoods to double down on and which to drop (Month 3 action item from business plan).

4. **Travel Time Log** — Table: date, from-location, to-location, actual travel time (from washer app), distance. Monthly average travel time trend. Target: reduce from 45 minutes to 20 minutes average through clustering.

5. **Expansion Signals** — When 10+ customers cluster in a new neighborhood not currently targeted, flag as potential expansion zone. Shows: neighborhood name, customer count, estimated monthly revenue potential.

### 4.12 Equipment Log

**Phase:** 3

**Views:**
1. **Equipment Registry** — Table: name, brand/model, purchase date, warranty status, last maintenance, next maintenance due, status badge.
2. **Maintenance Calendar** — Calendar view showing upcoming and overdue maintenance. Click to log maintenance completed.
3. **Power Station Tracker** — Specific view for the Bluetti power station: charge cycle count vs rated 4,000+ cycles, estimated remaining lifespan, daily usage pattern.

### 4.13 AI Chatbot + Analytics + Scorecard

**Phase:** 4

#### AI Chatbot
Built on Claude API with Supabase database access via function calling. The chatbot has read access to all tables and can run aggregate queries.

**Implementation:**
- Frontend: Chat interface in the admin panel sidebar (always accessible)
- Backend: Next.js API route that proxies to Claude API
- System prompt includes: business plan context (service mix assumptions, scenario targets, break-even numbers, strategic priorities), database schema, available query functions
- Function calls available to the AI:
  - query_services(month, filters) — get service counts and revenue
  - query_customers(filters) — get customer data
  - query_inventory() — get current stock levels
  - query_financials(month) — get P&L data
  - query_subscriptions() — get subscription metrics
  - query_capacity() — get utilization data
  - compare_to_scenario(month) — compare actuals to worst/base/best

**Example queries it should handle:**
- "Am I on track for base case this month?"
- "Which neighborhood has the best revenue per hour?"
- "Should I hire employee #2?"
- "What is my actual break-even vs projected?"
- "Show me customers who haven't booked in 30+ days"
- "What's my current service mix?"
- "How much chemical stock do I have left?"
- "What's my upsell conversion rate this month?"
- "Compare my Month 3 actuals to all three scenarios"
- "Which customers should I pitch Elite subscriptions to?"

#### Analytics Engine
Automated trend analysis. Runs as scheduled background jobs or on-demand.

Reports:
1. **Service Mix Trend** — Monthly % of Standard vs Professional vs other. Is the upsell rate improving?
2. **Customer Acquisition Curve** — New customers per month vs scenario projections
3. **Retention Cohort Analysis** — Of customers acquired in Month N, what % returned in Month N+1, N+2, etc.
4. **Revenue Concentration** — % of revenue from top 10 customers. Alert if > 40%
5. **Seasonal Patterns** — Booking patterns by day of week, time of day
6. **Upsell Effectiveness** — When washer attempts upsell, what % converts? By service type?

#### Month-by-Month Scorecard
Auto-populated from the scenario targets in the business plan. Each month shows a comparison table:

| Metric | Worst Target | Base Target | Best Target | Actual | Status |
|--------|-------------|-------------|-------------|--------|--------|
| Services | from targets JSON | from targets JSON | from targets JSON | count(jobs) this month | green/yellow/red |
| Revenue | from targets JSON | from targets JSON | from targets JSON | sum(transactions) this month | green/yellow/red |
| Subscriptions | estimated | estimated | estimated | count(active subscriptions) | green/yellow/red |
| Avg Rev/Service | Rp 349K | Rp 562K | Rp 562K | calculated | green/yellow/red |
| Capacity Util. | calculated | calculated | calculated | calculated | green/yellow/red |

Status logic: green if actual >= base target, yellow if between worst and base, red if below worst.

---

## 5. Cross-Module Features

### 5.1 Notification System

Centralized notification engine. All modules can create notifications. Notifications appear in the Dashboard alerts feed and can optionally trigger WhatsApp messages to admin.

| Alert Type | Source | Condition | Severity |
|-----------|--------|-----------|----------|
| follow_up_due | Jobs + Customers | Job completed 24hrs ago, no follow-up logged | warning |
| low_inventory | Inventory | Any product below min_threshold | warning |
| churn_risk | Subscriptions | Subscriber no booking in 14+ days | warning |
| capacity_warning | Bookings + Employees | Utilization > 85% for 2+ consecutive weeks | critical |
| cash_flow_warning | Finance | Projected cash < Rp 10M in 30 days | critical |
| equipment_maintenance | Equipment | Maintenance overdue or due within 7 days | info |
| rating_drop | Jobs | Avg rating below 4.5 in rolling 7-day window | critical |
| reengagement | Customers | Customer inactive 30 or 60 days | info |
| subscription_renewal | Subscriptions | 7 days before renewal date | info |

### 5.2 Referral System

Built into the CRM. Each customer has a unique referral code (auto-generated, e.g., "CAST-[first 4 chars of name]-[random 4 digits]").

Flow:
1. Existing customer shares their referral code
2. New customer enters code during first booking (field on booking form)
3. System creates customer record with referred_by = referrer's customer_id
4. On first completed job, both get Rp 50,000 discount applied:
   - Referrer: discount on next booking (stored as credit on customer record)
   - New customer: discount on this first booking (applied to transaction amount)
5. Referral dashboard tracks all referrals and attributed revenue

### 5.3 Customer Segmentation

Auto-computed segment field on customer records. Updated on every job completion and subscription change.

| Segment | Rule | Marketing Action |
|---------|------|-----------------|
| new | created_at within last 30 days | 24hr follow-up, referral ask, subscription pitch |
| standard_only | all jobs are standard_wash, no upsell converted, 2+ jobs | Priority upsell target for Professional |
| mixed | has 2+ different service types in history | Subscription pitch candidate |
| subscriber | has active subscription | Retention focus, tier upgrade pitch |
| vip | lifetime value > Rp 5M OR elite subscriber | Premium service, priority scheduling |
| churned | no booking in 60+ days AND had 2+ previous bookings | Win-back campaign (15% discount) |

---

## 6. Access Control (Supabase RLS)

### Role definitions:
- **admin**: Full read/write on all tables
- **ops_manager**: Full read/write except transactions (read-only on financials)
- **washer**: Read own employee record, read assigned bookings, write job records (status, photos, chemicals, notes), read inventory (view only)
- **customer** (future, for customer portal): Read own customer record, own bookings, own subscriptions. Write new booking requests.

### RLS policies (key ones):

```sql
-- Washers can only see their assigned bookings
create policy "Washers see own bookings" on bookings
  for select using (washer_id = auth.uid() or auth.role() in ('admin', 'ops_manager'));

-- Washers can only update jobs they're assigned to
create policy "Washers update own jobs" on jobs
  for update using (washer_id = auth.uid())
  with check (washer_id = auth.uid());

-- Washers can insert jobs for their bookings
create policy "Washers create jobs" on jobs
  for insert with check (washer_id = auth.uid());

-- Only admin can see transactions
create policy "Admin sees transactions" on transactions
  for select using (auth.role() = 'admin');

-- Website can insert customers and bookings (via service role key with limited scope)
-- Implemented via Supabase Edge Function with validation, not direct client insert
```

---

## 7. File Storage Structure (Supabase Storage)

```
castudio-photos/
  jobs/
    {job_id}/
      before_1.jpg
      before_2.jpg
      after_1.jpg
      after_2.jpg
  receipts/
    {transaction_id}/
      receipt.pdf
  equipment/
    {equipment_id}/
      maintenance_{date}.jpg
```

All buckets are private. Access via signed URLs with 1-hour expiry generated server-side.

---

## 8. Deployment

- **Admin panel (systems.castudio.id):** Next.js app deployed on Vercel. Git-based auto-deploy.
- **Washer panel (track.castudio.id):** Next.js PWA deployed on Vercel. Installable on washer's phone.
- **Database:** Supabase cloud (free tier, upgrade to Pro at ~Rp 375K/month when needed).
- **Environment variables:** All API keys (Google Maps, WhatsApp, Claude) stored in Vercel env vars and Supabase secrets. Never exposed client-side.

---

## 9. Build Order (Detailed)

### Phase 1: MVP Core

1. Set up Supabase project: create all tables from Section 3, set up RLS policies, seed initial data
2. Set up Next.js project with Tailwind CSS, Supabase client, auth flow (admin login)
3. Build Customers CRM: list view, profile page, CRUD operations
4. Build Bookings: calendar view, booking form, status management
5. Build Job Tracker: job records, photo upload to Supabase Storage, quality metrics
6. Build Finance: transaction list, auto-recurring expense generation, monthly P&L calculation
7. Build Dashboard: KPI cards pulling from all Phase 1 modules, scenario comparison, alert feed
8. Connect castudio.id booking form to Supabase (create booking + customer records)

### Phase 2: Operations

9. Subscriptions module
10. Invoicing (auto-receipt generation)
11. Conversations (WhatsApp API integration or manual entry)
12. Inventory (stock tracking, auto-deduction on job complete)

### Phase 3: Team & Ops

13. Team/Bonus Calculator
14. Route Planner (Google Maps integration)
15. Equipment Log

### Phase 4: Intelligence

16. AI Chatbot (Claude API integration)
17. Analytics Engine (automated reports)
18. Month-by-Month Scorecard (auto-populated from live data)
