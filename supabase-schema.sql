CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  email text,
  address text,
  neighborhood text check (neighborhood in (
    'pondok_indah', 'kemang', 'kebayoran_baru', 'senopati',
    'cilandak', 'pik', 'bsd', 'other'
  )),
  car_model text,
  plate_number text,
  acquisition_source text check (acquisition_source in (
    'instagram', 'referral', 'guerrilla', 'apartment_partner',
    'walk_in', 'website', 'whatsapp'
  )),
  referred_by uuid references customers(id),
  notes text,
  segment text not null default 'new' check (segment in (
    'new', 'standard_only', 'mixed', 'subscriber', 'vip', 'churned'
  )),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_plate ON customers(plate_number);
CREATE INDEX idx_customers_neighborhood ON customers(neighborhood);
CREATE INDEX idx_customers_segment ON customers(segment);
CREATE INDEX idx_customers_name_trgm ON customers USING gin (name gin_trgm_ops);

CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  email text,
  base_salary integer not null default 6600000,
  hire_date date not null,
  status text check (status in ('active', 'on_leave', 'terminated')) default 'active',
  role text check (role in ('washer', 'ops_manager')) default 'washer',
  notes text,
  created_at timestamptz default now()
);

CREATE TABLE subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  tier text not null check (tier in ('essentials', 'plus', 'elite')),
  start_date date not null,
  renewal_date date not null,
  monthly_price integer not null,
  washes_allocated integer not null,
  washes_used_this_month integer default 0,
  status text not null check (status in (
    'active', 'paused', 'cancelled', 'expired'
  )) default 'active',
  cancellation_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE INDEX idx_subscriptions_customer ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  service_type text not null check (service_type in (
    'standard_wash', 'professional', 'elite_wash',
    'interior_detail', 'exterior_detail', 'window_detail',
    'tire_rims', 'full_detail'
  )),
  scheduled_date date not null,
  scheduled_time text,
  washer_id uuid references employees(id),
  status text not null check (status in (
    'requested', 'confirmed', 'en_route', 'in_progress',
    'completed', 'cancelled', 'no_show'
  )) default 'requested',
  location_address text,
  location_lat float,
  location_lng float,
  is_subscription boolean default false,
  subscription_id uuid references subscriptions(id),
  source text check (source in (
    'website', 'whatsapp', 'phone', 'walk_in', 'subscription_auto'
  )),
  notes text,
  cancellation_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_date ON bookings(scheduled_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_washer ON bookings(washer_id);

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE jobs (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references bookings(id),
  washer_id uuid not null references employees(id),
  started_at timestamptz,
  completed_at timestamptz,
  actual_duration_min integer,
  travel_time_min integer,
  photos_before text[] not null default '{}',
  photos_after text[] not null default '{}',
  chemicals_used jsonb,
  customer_rating integer check (customer_rating between 1 and 5),
  customer_feedback text,
  washer_notes text,
  upsell_attempted boolean default false,
  upsell_converted boolean default false,
  upsell_to_service text,
  created_at timestamptz default now()
);

CREATE INDEX idx_jobs_booking ON jobs(booking_id);
CREATE INDEX idx_jobs_washer ON jobs(washer_id);
CREATE INDEX idx_jobs_completed ON jobs(completed_at);

CREATE TABLE transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  job_id uuid references jobs(id),
  subscription_id uuid references subscriptions(id),
  amount integer not null,
  type text not null check (type in ('revenue', 'expense')),
  category text not null,
  payment_method text check (payment_method in ('bank_transfer', 'qris')),
  payment_status text not null check (payment_status in (
    'pending', 'confirmed', 'failed', 'refunded'
  )) default 'pending',
  payment_confirmed_at timestamptz,
  payment_confirmed_by uuid references employees(id),
  payment_proof_url text,
  description text,
  date date not null default current_date,
  receipt_url text,
  is_recurring boolean default false,
  created_at timestamptz default now()
);

CREATE INDEX idx_transactions_customer ON transactions(customer_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_status ON transactions(payment_status);

CREATE TABLE inventory (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  brand text,
  current_qty float not null,
  unit text not null,
  min_threshold float not null,
  cost_per_unit float,
  last_restocked_at timestamptz,
  last_restocked_qty float,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE TRIGGER trg_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE equipment (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand_model text,
  purchase_date date,
  purchase_price integer,
  warranty_expiry date,
  maintenance_interval_days integer,
  last_maintenance_at date,
  next_maintenance_at date,
  status text check (status in ('operational', 'needs_maintenance', 'out_of_service')) default 'operational',
  usage_cycles integer default 0,
  max_cycles integer,
  notes text,
  created_at timestamptz default now()
);

CREATE TABLE conversations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  direction text not null check (direction in ('inbound', 'outbound')),
  channel text not null check (channel in ('whatsapp', 'phone', 'instagram', 'manual')),
  message_type text check (message_type in (
    'general', 'booking_request', 'follow_up', 'subscription_pitch',
    'complaint', 'referral_ask', 'reengagement', 'receipt'
  )),
  content text,
  sent_at timestamptz not null default now(),
  follow_up_due_at timestamptz,
  follow_up_completed boolean default false,
  subscription_pitched boolean default false,
  subscription_pitch_result text check (subscription_pitch_result in (
    'converted', 'declined', 'thinking'
  )),
  created_at timestamptz default now()
);

CREATE INDEX idx_conversations_customer ON conversations(customer_id);
CREATE INDEX idx_conversations_date ON conversations(created_at);

CREATE TABLE notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in (
    'follow_up_due', 'low_inventory', 'churn_risk', 'capacity_warning',
    'cash_flow_warning', 'equipment_maintenance', 'rating_drop',
    'reengagement', 'subscription_renewal', 'general'
  )),
  title text not null,
  body text,
  severity text check (severity in ('info', 'warning', 'critical')) default 'info',
  source_module text,
  source_id uuid,
  is_read boolean default false,
  is_dismissed boolean default false,
  created_at timestamptz default now()
);

CREATE INDEX idx_notifications_unread ON notifications(is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_date ON notifications(created_at);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access" ON customers FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON employees FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON subscriptions FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON bookings FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON jobs FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON transactions FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON inventory FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON equipment FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON conversations FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated full access" ON notifications FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE OR REPLACE VIEW customer_stats AS
SELECT
  c.*,
  COALESCE(j.total_services, 0) AS total_services,
  COALESCE(t.total_spent, 0) AS total_spent,
  j.last_service_date
FROM customers c
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) AS total_services,
    MAX(jo.completed_at)::DATE AS last_service_date
  FROM jobs jo
  JOIN bookings b ON b.id = jo.booking_id
  WHERE b.customer_id = c.id AND jo.completed_at IS NOT NULL
) j ON true
LEFT JOIN LATERAL (
  SELECT COALESCE(SUM(amount), 0) AS total_spent
  FROM transactions
  WHERE transactions.customer_id = c.id
    AND transactions.type = 'revenue'
    AND transactions.payment_status = 'confirmed'
) t ON true;

CREATE OR REPLACE FUNCTION compute_customer_segment(p_customer_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_has_subscription BOOLEAN;
  v_total_spent BIGINT;
  v_total_services BIGINT;
  v_last_service DATE;
  v_days_since_last INT;
  v_created_days INT;
  v_distinct_types BIGINT;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM subscriptions
    WHERE customer_id = p_customer_id AND status = 'active'
  ) INTO v_has_subscription;

  SELECT COALESCE(SUM(amount), 0), COUNT(*)
  INTO v_total_spent, v_total_services
  FROM transactions
  WHERE customer_id = p_customer_id
    AND type = 'revenue'
    AND payment_status = 'confirmed';

  SELECT MAX(jo.completed_at)::DATE INTO v_last_service
  FROM jobs jo JOIN bookings b ON b.id = jo.booking_id
  WHERE b.customer_id = p_customer_id AND jo.completed_at IS NOT NULL;

  v_days_since_last := EXTRACT(DAY FROM now() - v_last_service)::INT;
  v_created_days := EXTRACT(DAY FROM now() - (SELECT created_at FROM customers WHERE id = p_customer_id))::INT;

  SELECT COUNT(DISTINCT b.service_type) INTO v_distinct_types
  FROM bookings b WHERE b.customer_id = p_customer_id AND b.status = 'completed';

  IF v_created_days <= 30 AND v_total_services <= 1 THEN
    RETURN 'new';
  ELSIF v_days_since_last > 60 AND v_total_services >= 2 THEN
    RETURN 'churned';
  ELSIF v_total_spent > 5000000 OR v_has_subscription THEN
    IF v_total_spent > 5000000 THEN RETURN 'vip'; END IF;
    RETURN 'subscriber';
  ELSIF v_distinct_types >= 2 THEN
    RETURN 'mixed';
  ELSIF v_total_services >= 2 THEN
    RETURN 'standard_only';
  ELSE
    RETURN 'new';
  END IF;
END;
$$ LANGUAGE plpgsql;

INSERT INTO inventory (product_name, brand, current_qty, unit, min_threshold, cost_per_unit) VALUES
  ('Car Shampoo', 'Meguiars Gold Class', 1890, 'ml', 400, 168),
  ('Snow Foam Concentrate', 'FECO Konsentrat', 5000, 'ml', 1000, 29),
  ('All-Purpose Cleaner', 'SONAX SX Multistar', 10000, 'ml', 2000, 114),
  ('Iron Remover', 'SONAX Iron+Fallout', 750, 'ml', 200, 373),
  ('Tar Remover', 'Prestone Bug & Tar', 500, 'ml', 150, 180),
  ('Clay Bar', 'Meguiars Individual', 200, 'g', 50, 1695),
  ('Glass Cleaner', 'SONAX Clear Glass', 750, 'ml', 200, 177),
  ('Glass Coating', 'Meguiars Perfect Clarity', 118, 'ml', 30, 1653),
  ('Leather Conditioner', 'Meguiars Gold Class 3-in-1', 400, 'ml', 100, 648),
  ('Dashboard Protectant', 'Sonax Profiline Plastic', 1000, 'ml', 250, 236),
  ('Tire Dressing', 'Meguiars Endurance Gel', 473, 'ml', 120, 450),
  ('Wheel Cleaner', 'Meguiars Ultimate All Wheel', 709, 'ml', 180, 375),
  ('Paint Sealant', 'Meguiars Hybrid Ceramic', 768, 'ml', 200, 430),
  ('Degreaser', 'SONAX Engine Cold Cleaner', 500, 'ml', 150, 220),
  ('Odor Neutralizer', 'CarPro SO2Pure', 500, 'ml', 120, 400),
  ('Quick Detailer', 'Meguiars Last Touch', 946, 'ml', 250, 264),
  ('Polishing Compound', 'Meguiars Ultimate Compound', 473, 'ml', 120, 634),
  ('Microfiber Towels', 'Generic', 32, 'pcs', 15, 31000);

INSERT INTO equipment (name, brand_model, purchase_date, purchase_price, maintenance_interval_days, status) VALUES
  ('Pressure Washer', 'Karcher K4 Compact', '2026-02-01', 5000000, 90, 'operational'),
  ('Portable Power Station', 'Bluetti Premium 100 V2', '2026-02-01', 8000000, 180, 'operational'),
  ('Water Tank + Pump', '500L + 12V DC', '2026-02-01', 1450000, 90, 'operational'),
  ('Wet/Dry Vacuum', 'Krisbow 20L', '2026-02-01', 1259000, 60, 'operational'),
  ('DA Polisher', 'HL 8050 DA', '2026-02-01', 1500000, 60, 'operational'),
  ('Air Compressor', 'Lakoni Fresco 110', '2026-02-01', 1350000, 90, 'operational'),
  ('Vehicle', 'Daihatsu Gran Max', '2026-02-01', 85000000, 90, 'operational');
