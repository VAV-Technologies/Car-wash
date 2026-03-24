# CASTUDIO Washer Panel System Plan
## track.castudio.id

**Document purpose:** Complete specification for the Castudio washer/technician panel. This is the field operations app used by washers to receive their daily schedule, follow SOPs, upload proof-of-work photos, and track their earnings. Integrates with systems.castudio.id via shared Supabase database.

---

## 1. Purpose

The washer panel serves ONE purpose: give the washer everything they need to complete their jobs to standard, and nothing more.

What the washer needs:
- What jobs they have today (and upcoming)
- Where each job is (address, map, customer phone if location issues)
- What type of service it is
- Step-by-step SOP for that service type
- What equipment and chemicals to load
- Where to photograph after completion (mandatory quality checkpoints)
- How much they are earning (bonuses per job, monthly total)
- History of past jobs

What the washer does NOT need:
- Other washers' schedules
- Customer payment info or financial data
- Business analytics, P&L, or scenario tracking
- Inventory management (they just follow the SOP)
- Booking management (admin handles scheduling and assignment)

---

## 2. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js PWA (Progressive Web App) | Installable on washer's phone like a native app. Works offline for photo queue. |
| Backend | Shared Supabase database (same as systems.castudio.id) | No separate backend. RLS controls what washer can see/write. |
| Auth | Supabase Auth (email + password) | Each washer has unique login credentials. Admin creates accounts. |
| Storage | Supabase Storage | Photos uploaded to private buckets. Compressed client-side before upload. |
| Maps | Google Maps embed | Directions link opens native maps app (Google Maps / Waze). |
| Hosting | Vercel | Same project or separate deploy under track.castudio.id subdomain. |

**PWA requirements:**
- Installable on Android (primary) via "Add to Home Screen"
- Offline capability: if connection drops mid-job, photos queue locally and upload when reconnected
- Push notifications for new job assignments (via Supabase Realtime or web push)
- Mobile-first design. This is a phone-only interface. No desktop layout needed.

---

## 3. Authentication & Access

Each washer gets a unique account created by admin in systems.castudio.id.

```
Login: employee email or phone number
Password: set by admin on account creation, washer can change
Role: 'washer' (enforced by Supabase RLS)
```

**RLS rules for washer role:**
- SELECT on bookings: only rows where washer_id = auth.uid() AND status in ('confirmed', 'en_route', 'in_progress', 'completed')
- SELECT on jobs: only rows where washer_id = auth.uid()
- INSERT on jobs: only with washer_id = auth.uid()
- UPDATE on jobs: only rows where washer_id = auth.uid() (for adding photos, notes, chemicals, status changes)
- UPDATE on bookings: only status field, only for own bookings, only forward transitions (confirmed -> en_route -> in_progress -> completed)
- SELECT on customers: only customer_id that matches their assigned bookings (name, phone, car_model, plate_number, neighborhood, segment/vip status). No access to financial data, lifetime value, or full CRM.
- SELECT on employees: only own record (for earnings view)
- SELECT on sop_checklists: full read access (reference material)
- INSERT on job_photos: only for own jobs
- NO access to: transactions, subscriptions, inventory, equipment, conversations, notifications, other employees

---

## 4. Data Model (additions to existing schema)

The washer panel mostly reads/writes to existing tables (bookings, jobs, customers, employees). Two new tables are needed:

### 4.1 sop_checklists

Stores the standard operating procedure steps for each service type. Admin manages these in systems.castudio.id. Washers read them in track.castudio.id.

```sql
create table sop_checklists (
  id uuid primary key default gen_random_uuid(),
  service_type text not null check (service_type in (
    'standard_wash', 'professional', 'elite_wash',
    'interior_detail', 'exterior_detail', 'window_detail',
    'tire_rims', 'full_detail'
  )),
  step_number integer not null,
  step_title text not null,
  step_description text not null, -- detailed instruction
  equipment_needed text[], -- e.g. ['pressure_washer', 'foam_cannon', 'bucket_with_grit_guard']
  chemicals_needed text[], -- e.g. ['car_shampoo', 'snow_foam']
  estimated_minutes integer, -- how long this step should take
  photo_required boolean default false, -- if true, washer must upload a photo at this step
  photo_description text, -- what the photo should show, e.g. "Driver side door panel after wipe"
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(service_type, step_number)
);
```

### 4.2 job_photos

Structured photo uploads tied to specific SOP checkpoints. This replaces the simple photos_before/photos_after arrays on the jobs table with a more structured approach for quality control.

```sql
create table job_photos (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id),
  washer_id uuid not null references employees(id),
  photo_type text not null check (photo_type in (
    'before_overall', 'before_detail', 'after_checkpoint', 'after_overall', 'issue'
  )),
  sop_step_id uuid references sop_checklists(id), -- links to which SOP step this photo proves
  photo_url text not null, -- Supabase Storage signed URL
  caption text, -- washer's note on what this photo shows
  taken_at timestamptz default now(),
  created_at timestamptz default now()
);
```

Photo types:
- `before_overall`: Full car photos before starting (minimum 2: front 3/4 angle, rear 3/4 angle)
- `before_detail`: Close-up of any existing damage or issues spotted before work (protection against false claims)
- `after_checkpoint`: Photo proving a specific SOP step was completed (linked to sop_step_id)
- `after_overall`: Full car photos after completion (minimum 2: same angles as before)
- `issue`: Any problem found during the job (scratch discovered, stain that won't come out, equipment issue)

### 4.3 SOP seed data

Below are the full SOP checklists for each service type. These are seeded into the database and managed by admin.

**Standard Wash SOP:**

| Step | Title | Description | Equipment | Chemicals | Minutes | Photo Required | Photo Shows |
|------|-------|-------------|-----------|-----------|---------|---------------|-------------|
| 1 | Pre-inspection | Walk around the car. Note any existing damage, scratches, dents. Photograph all sides. Check with customer if anything specific to be careful about. | None | None | 3 | Yes | All 4 sides of car + any existing damage |
| 2 | Pre-rinse | Rinse entire car with pressure washer from top to bottom. Remove loose dirt and debris. Do not start from bottom up (drags dirt upward). | Pressure washer, water tank | None | 5 | No | |
| 3 | Snow foam | Apply snow foam using foam cannon. Cover entire car evenly. Let it dwell for 3-5 minutes to break down dirt. Do not let it dry. | Foam cannon, pressure washer | Snow foam concentrate | 5 | No | |
| 4 | Rinse foam | Pressure wash all foam off from top to bottom. | Pressure washer | None | 3 | No | |
| 5 | Two-bucket wash | Using two-bucket method (one wash, one rinse) with grit guards, hand wash with mitt from top to bottom. Panels: roof, windows, hood, trunk, upper sides, lower sides, bumpers last. Rinse mitt in clean bucket after each panel. | 2 buckets with grit guards, wash mitt | Car shampoo | 15 | No | |
| 6 | Final rinse | Rinse all shampoo off with clean water. Pressure washer for crevices, gentle stream for panels. | Pressure washer | None | 3 | No | |
| 7 | Dry | Dry with clean microfiber drying towel. Pat dry, do not drag across paint. Start from roof, work down. Use separate towel for lower panels. | Microfiber drying towels (2) | None | 8 | No | |
| 8 | Glass cleaning | Clean all windows inside and out with glass cleaner and glass microfiber towel. | Glass microfiber towel | Glass cleaner | 5 | Yes | Front windshield clarity |
| 9 | Tire dressing | Apply tire dressing to all 4 tires with applicator pad. Even coat, avoid getting on paint. | Tire applicator pad | Tire dressing | 5 | Yes | One tire with dressing applied |
| 10 | Quick detail | Spray quick detailer on all painted surfaces and buff with clean microfiber. Gives final shine and removes any water spots. | Microfiber buffing towel | Quick detailer | 5 | No | |
| 11 | Interior quick wipe | Wipe dashboard, center console, door panels with damp microfiber. Vacuum floor mats if accessible. | Interior microfiber towel, vacuum | APC (diluted) | 8 | Yes | Dashboard and center console |
| 12 | Final check | Walk around completed car. Check for missed spots, water spots, streaks. Compare to before photos. | None | None | 3 | Yes | Completed car from same angles as pre-inspection |

**Professional Wash SOP:**

Includes all Standard Wash steps plus:

| Step | Title | Description | Equipment | Chemicals | Minutes | Photo Required | Photo Shows |
|------|-------|-------------|-----------|-----------|---------|---------------|-------------|
| 5b | Iron decon | After two-bucket wash, spray iron remover on all painted panels and wheels. Wait 3-5 minutes until product turns purple (indicating iron contamination dissolving). Rinse thoroughly. | Spray bottle | Iron remover | 8 | Yes | Purple reaction on one panel |
| 10b | Paint sealant | After quick detail, apply paint sealant to all painted surfaces using applicator pad. Work one panel at a time. Let haze for 2-3 minutes, then buff off with clean microfiber. | Applicator pad, buffing microfiber | Paint sealant (Meguiar's Hybrid Ceramic) | 15 | Yes | Sealant beading after application |
| 11b | Interior deep clean | Use APC on all interior surfaces. Detail brushes for air vents, crevices, buttons. Leather conditioner on leather surfaces. Dashboard protectant on plastics. | Detail brushes, interior microfiber, applicator pads | APC, leather conditioner, dashboard protectant | 12 | Yes | Interior showing treated surfaces |

**Elite Wash, Interior Detail, Exterior Detail, Window Detail, Tire & Rims, Full Detail:**
Follow the same pattern. Admin builds and maintains these in systems.castudio.id. Each service type has 10-20 steps with specific equipment, chemicals, timing, and mandatory photo checkpoints.

Key principle: the SOP checklist IS the job. The washer goes step by step, checks off each one, uploads required photos, and the system ensures nothing is skipped.

---

## 5. Screens

The washer panel has 5 screens total. Keep it simple.

### 5.1 Today (Home Screen)

**What it shows:** Today's assigned jobs in chronological order. This is what the washer sees when they open the app.

**Layout:** Vertical card stack. Each job card shows:

```
┌─────────────────────────────────────┐
│ 09:00 AM        ● Confirmed         │
│                                     │
│ Ahmad Sudirman                      │
│ Toyota Alphard  •  B 1234 ABC       │
│ ★ VIP Customer                      │
│                                     │
│ Standard Wash                       │
│ Est. 1.5 hours  •  Bonus: Rp 20K   │
│                                     │
│ 📍 Jl. Metro Pondok Indah Blk...   │
│    Pondok Indah, South Jakarta      │
│                                     │
│ [Navigate]  [Call Customer]  [Start]│
└─────────────────────────────────────┘
```

**Card fields:**
- Scheduled time
- Status badge (confirmed / en_route / in_progress / completed)
- Customer name
- Car model + plate number
- Customer tag: show `VIP` badge if customer segment = vip, `Subscriber` badge if they have active subscription, `New Customer` badge if segment = new. These help the washer know to give extra care.
- Service type (human readable name)
- Estimated duration + bonus amount for this service
- Location: address, neighborhood tag
- Action buttons:
  - **Navigate**: opens Google Maps / Waze with the address as destination (deep link to native maps app)
  - **Call Customer**: tel: link to customer phone number. Use this if location is hard to find, gate is locked, customer is unreachable, etc.
  - **Start Job**: transitions booking status to `in_progress`, creates a job record, opens the SOP checklist screen

**Status transitions on this screen:**
- When washer leaves base/previous location: swipe or tap "On My Way" -> status = `en_route`
- When washer arrives and is ready to start: tap "Start Job" -> status = `in_progress`, job record created with started_at = now()
- Completed jobs today show at bottom in a "Done" section with green checkmark

**Empty state:** "No jobs scheduled for today. Enjoy your rest!" (or contact admin if you expected jobs)

**Pull-to-refresh** to check for newly assigned jobs.

**Upcoming section:** Below today's jobs, show tomorrow's confirmed jobs (read-only, no actions). Helps washer plan their next day.

### 5.2 Active Job (SOP Checklist Screen)

**When it opens:** After washer taps "Start Job" on a Today card. This is the main working screen.

**Layout:** Full-screen checklist tied to the SOP for the service type. Each step must be completed in order (or explicitly skipped with a reason).

**Header:**
```
Standard Wash — Ahmad Sudirman
Toyota Alphard  •  B 1234 ABC
Started: 09:15 AM  •  Timer: 00:42:31
```

Running timer from started_at. Helps washer pace themselves vs estimated duration.

**Checklist:**
```
✅ 1. Pre-inspection (3 min)
      Equipment: None
      📷 4 photos uploaded

✅ 2. Pre-rinse (5 min)
      Equipment: Pressure washer, water tank

☐  3. Snow foam (5 min)                    ← CURRENT
      Equipment: Foam cannon, pressure washer
      Chemicals: Snow foam concentrate

      Apply snow foam using foam cannon.
      Cover entire car evenly. Let it dwell
      for 3-5 minutes to break down dirt.
      Do not let it dry.

      [Mark Complete]

○  4. Rinse foam (3 min)
○  5. Two-bucket wash (15 min)
...
```

**Step states:**
- `✅` Completed (with timestamp)
- `☐` Current step (expanded with full instructions, equipment list, chemicals)
- `○` Upcoming (collapsed, just title and time estimate)
- `⏭️` Skipped (with reason logged)

**For steps where photo_required = true:**
When washer taps "Mark Complete" on a photo-required step, the camera opens. They must upload the required photo(s) before the step can be marked complete. The photo_description tells them exactly what to photograph.

```
📷 Photo required to complete this step:
   "Driver side door panel after wipe"
   
   [Take Photo]  [Choose from Gallery]
```

**Photo upload:**
- Compress to max 1200px wide, ~80% quality JPEG before upload (saves bandwidth and storage)
- Upload to Supabase Storage: `castudio-photos/jobs/{job_id}/{photo_type}_{step_number}_{timestamp}.jpg`
- If offline, queue locally and show "will upload when connected" indicator
- Each photo creates a row in job_photos table

**Step completion rules:**
- Steps with photo_required = true CANNOT be marked complete without at least 1 photo uploaded
- Steps can be skipped with a mandatory text reason (e.g., "customer declined interior wipe", "stain pre-existing"). Skip reason is logged in washer_notes on the job record.
- Steps must be completed in order (can't skip ahead without marking current as complete or skipped)

**Bottom bar:**
```
[Call Customer]  [Report Issue]  [Complete Job]
```

- **Call Customer**: tel: link (always available during active job)
- **Report Issue**: opens a form to log an issue found during the job (e.g., existing scratch, paint chip, mechanical problem noticed). Takes a photo (type = `issue`), adds to washer_notes.
- **Complete Job**: only enabled when all required steps are complete. Final confirmation dialog: "Have you completed all steps and uploaded all required photos?" On confirm: booking status -> `completed`, job completed_at = now(), calculates actual_duration_min.

**Upsell prompt:** After step 1 (pre-inspection), if the service type is `standard_wash`, show a subtle prompt:
```
💡 Tip: This car could benefit from a Professional Wash
   (iron removal + paint sealant).
   Did you mention this to the customer?
   [Yes, they upgraded] [Yes, they declined] [Skip]
```
This sets upsell_attempted and upsell_converted on the job record.

### 5.3 History

**What it shows:** Past completed jobs, most recent first. Paginated list.

**Layout:** Simple card list:
```
┌─────────────────────────────────────┐
│ Mar 22, 2026                        │
│ Ahmad Sudirman  •  Standard Wash    │
│ Duration: 1h 25m  •  Bonus: Rp 20K │
│ Rating: ★★★★★                       │
│ [View Photos]                       │
└─────────────────────────────────────┘
```

**Card fields:**
- Date
- Customer name + service type
- Actual duration
- Bonus earned for this job
- Customer rating (if received, otherwise "Awaiting rating")
- Tap to expand: view all uploaded photos, washer notes, any issues reported

**Filter:** By month, by service type. Default: current month.

### 5.4 Earnings

**What it shows:** Monthly earnings breakdown. The washer's personal compensation tracker.

**Layout:**

**Month selector** at top (defaults to current month).

```
March 2026
─────────────────────────────────
Base Salary              Rp 6,600,000
─────────────────────────────────
Per-Service Bonuses:
  Standard Wash (18x)    Rp   360,000
  Professional (8x)      Rp   280,000
  Elite Wash (2x)        Rp   100,000
  Interior Detail (1x)   Rp    50,000
─────────────────────────────────
Service Bonus Subtotal   Rp   790,000
─────────────────────────────────
Quality Bonus            Rp   500,000  ✅
  (0 complaints, avg 4.9 stars)
Attendance Bonus         Rp   300,000  ✅
  (0 unexcused absences)
─────────────────────────────────
TOTAL COMPENSATION       Rp 8,190,000
─────────────────────────────────
```

**Bonus qualification status (live for current month):**

Quality bonus (Rp 500,000): 
- Show current average rating and complaint count
- Green checkmark if still qualified (0 complaints, avg >= 4.8)
- Red X if disqualified (show reason: "1 complaint on Mar 15" or "avg rating 4.6")

Attendance bonus (Rp 300,000):
- Show attendance record
- Green checkmark if still qualified
- Red X if disqualified (show dates of unexcused absences)

**Per-service bonus rates (for reference on this screen):**
| Service | Bonus |
|---------|-------|
| Standard Wash | Rp 20,000 |
| Professional | Rp 35,000 |
| Elite Wash | Rp 50,000 |
| Interior/Exterior Detail | Rp 50,000 |
| Window Detailing | Rp 30,000 |
| Tire & Rims | Rp 15,000 |
| Full Detail | Rp 150,000 |

**Monthly history:** Can browse previous months to see past payslips.

### 5.5 Profile

**What it shows:** Washer's own account info and app settings. Minimal.

**Fields (read-only, managed by admin):**
- Name
- Phone number
- Employee ID
- Hire date
- Status (active)

**Editable by washer:**
- Password change
- Notification preferences (push notifications on/off)

**Actions:**
- Log out

---

## 6. Mandatory Photo Checkpoints by Service Type

These define the minimum photos required before a job can be marked complete. The washer cannot tap "Complete Job" until all mandatory photos are uploaded.

### Standard Wash
| Checkpoint | Photo Type | What to Photograph |
|-----------|-----------|-------------------|
| Pre-inspection front | before_overall | Front 3/4 angle of car |
| Pre-inspection rear | before_overall | Rear 3/4 angle of car |
| Pre-inspection damage | before_detail | Any existing damage (if none, skip with note "no existing damage") |
| Glass cleaned | after_checkpoint | Front windshield showing clarity |
| Tires dressed | after_checkpoint | One tire with dressing applied |
| Interior wiped | after_checkpoint | Dashboard and center console after cleaning |
| Completed front | after_overall | Front 3/4 angle matching pre-inspection |
| Completed rear | after_overall | Rear 3/4 angle matching pre-inspection |

**Minimum total: 7 photos** (8 if existing damage found)

### Professional Wash
All Standard Wash checkpoints plus:
| Checkpoint | Photo Type | What to Photograph |
|-----------|-----------|-------------------|
| Iron decon reaction | after_checkpoint | Purple reaction on a panel showing iron contamination dissolving |
| Paint sealant beading | after_checkpoint | Water beading on a sealed panel |
| Interior deep clean | after_checkpoint | Interior showing treated leather/plastic surfaces |

**Minimum total: 10 photos**

### Elite Wash
All Professional Wash checkpoints plus:
| Checkpoint | Photo Type | What to Photograph |
|-----------|-----------|-------------------|
| Tar removal | after_checkpoint | Panel showing tar spots removed |
| Glass coating beading | after_checkpoint | Window showing hydrophobic coating effect |

**Minimum total: 12 photos**

### Interior Detail
| Checkpoint | Photo Type | What to Photograph |
|-----------|-----------|-------------------|
| Before interior overall | before_overall | Full interior from driver door |
| Before interior rear | before_overall | Rear seats |
| Before detail | before_detail | Worst areas (stains, dirt buildup) |
| Dashboard cleaned | after_checkpoint | Dashboard after APC and protectant |
| Seats cleaned | after_checkpoint | Seats after cleaning/conditioning |
| Door panels | after_checkpoint | Door panel after cleaning |
| Center console | after_checkpoint | Console and cup holders |
| Completed interior | after_overall | Full interior from same angle as before |

**Minimum total: 8 photos**

### Exterior Detail
| Checkpoint | Photo Type | What to Photograph |
|-----------|-----------|-------------------|
| Before front | before_overall | Front 3/4 angle |
| Before rear | before_overall | Rear 3/4 angle |
| Before detail | before_detail | Worst paint areas (swirls, scratches, contamination) |
| Iron decon | after_checkpoint | Purple reaction |
| Clay bar result | after_checkpoint | Panel showing smooth surface after clay |
| Polish result | after_checkpoint | Panel showing corrected paint (before/after same panel) |
| Sealant beading | after_checkpoint | Water beading on sealed panel |
| Completed front | after_overall | Front 3/4 angle |
| Completed rear | after_overall | Rear 3/4 angle |

**Minimum total: 9 photos**

### Window Detail
| Checkpoint | Photo Type | What to Photograph |
|-----------|-----------|-------------------|
| Before windshield | before_overall | Front windshield showing spots/film |
| Before side window | before_overall | Side window close-up |
| Iron removed from glass | after_checkpoint | Glass after iron remover |
| Coating applied | after_checkpoint | Water beading on coated glass |
| Completed windshield | after_overall | Clean windshield |

**Minimum total: 5 photos**

### Tire & Rims
| Checkpoint | Photo Type | What to Photograph |
|-----------|-----------|-------------------|
| Before one wheel | before_overall | One wheel showing brake dust/dirt |
| Iron decon on rim | after_checkpoint | Purple reaction on rim |
| Cleaned rim | after_checkpoint | Clean rim after all cleaning |
| Tire dressed | after_checkpoint | Tire with dressing applied |
| Completed all 4 | after_overall | All 4 wheels completed (wide shot) |

**Minimum total: 5 photos**

### Full Detail
Combines all mandatory checkpoints from Exterior Detail + Interior Detail + Window Detail + Tire & Rims. Deduplicated (e.g., only one set of before_overall exterior shots).

**Minimum total: 18 photos**

---

## 7. Equipment Loadout by Service Type

Shown to the washer on the job card and at the top of the SOP checklist. This is what they need to load into the van before heading out.

```json
{
  "standard_wash": {
    "equipment": [
      "Pressure washer (Karcher K4)",
      "Water tank (filled to 200L minimum)",
      "Portable power station (charged > 80%)",
      "Foam cannon",
      "2 buckets with grit guards",
      "Wash mitt",
      "3 microfiber drying towels",
      "2 microfiber glass towels",
      "1 interior microfiber towel",
      "Tire applicator pad",
      "Vacuum"
    ],
    "chemicals": [
      "Car shampoo",
      "Snow foam concentrate",
      "Glass cleaner",
      "Tire dressing",
      "Quick detailer",
      "APC (diluted for interior)"
    ]
  },
  "professional": {
    "equipment": [
      "All Standard Wash equipment",
      "Spray bottle for iron remover",
      "Applicator pad for sealant",
      "2 extra microfiber buffing towels",
      "Detail brushes (air vents, crevices)"
    ],
    "chemicals": [
      "All Standard Wash chemicals",
      "Iron remover",
      "Paint sealant (Meguiar's Hybrid Ceramic)",
      "Leather conditioner",
      "Dashboard protectant"
    ]
  },
  "elite_wash": {
    "equipment": [
      "All Professional equipment",
      "Clay bar + lubricant"
    ],
    "chemicals": [
      "All Professional chemicals",
      "Tar remover",
      "Glass coating"
    ]
  },
  "interior_detail": {
    "equipment": [
      "Vacuum (Krisbow 20L)",
      "Air compressor",
      "Detail brushes (full set)",
      "Interior microfiber towels (6)",
      "Applicator pads (2)",
      "Portable power station"
    ],
    "chemicals": [
      "APC (SONAX Multistar, diluted)",
      "Leather conditioner",
      "Dashboard protectant",
      "Glass cleaner",
      "Odor neutralizer"
    ]
  },
  "exterior_detail": {
    "equipment": [
      "All Standard Wash equipment",
      "DA Polisher (HL 8050)",
      "Polishing pads (cutting + finishing)",
      "Clay bar kit",
      "Spray bottles",
      "6 extra microfiber towels"
    ],
    "chemicals": [
      "All Standard Wash chemicals",
      "Iron remover",
      "Tar remover",
      "Clay bar lubricant",
      "Polishing compound",
      "Paint sealant",
      "Glass cleaner",
      "Glass coating"
    ]
  },
  "window_detail": {
    "equipment": [
      "Glass microfiber towels (4)",
      "Spray bottles",
      "Applicator pad for coating"
    ],
    "chemicals": [
      "Glass cleaner",
      "Iron remover",
      "Glass coating (Meguiar's Perfect Clarity)"
    ]
  },
  "tire_rims": {
    "equipment": [
      "Pressure washer",
      "Water tank",
      "Portable power station",
      "Wheel brushes",
      "Detail brushes",
      "Tire applicator pad",
      "3 microfiber towels"
    ],
    "chemicals": [
      "Wheel cleaner",
      "Iron remover",
      "APC",
      "Tire dressing"
    ]
  },
  "full_detail": {
    "equipment": [
      "EVERYTHING - full equipment loadout"
    ],
    "chemicals": [
      "EVERYTHING - full chemical loadout"
    ]
  }
}
```

---

## 8. API Endpoints / Integration Points

The washer panel does NOT have its own API. It reads and writes directly to the shared Supabase database using the Supabase client SDK with the washer's auth token. RLS handles permissions.

**Key operations (Supabase client calls):**

```
READ:
- supabase.from('bookings').select('*, customers(name, phone, car_model, plate_number, neighborhood, segment)').eq('washer_id', currentUser.id).in('status', ['confirmed','en_route','in_progress']).gte('scheduled_date', today)
- supabase.from('sop_checklists').select('*').eq('service_type', jobServiceType).order('step_number')
- supabase.from('jobs').select('*, job_photos(*)').eq('washer_id', currentUser.id).order('completed_at', {ascending: false})
- supabase.from('employees').select('*').eq('id', currentUser.id).single()
- supabase.from('jobs').select('booking_id, bookings(service_type)').eq('washer_id', currentUser.id).gte('created_at', startOfMonth)  -- for earnings calc

WRITE:
- supabase.from('bookings').update({status: 'en_route'}).eq('id', bookingId)  -- status transition
- supabase.from('bookings').update({status: 'in_progress'}).eq('id', bookingId)  -- start job
- supabase.from('bookings').update({status: 'completed'}).eq('id', bookingId)  -- complete job
- supabase.from('jobs').insert({booking_id, washer_id, started_at, chemicals_used, ...})  -- create job on start
- supabase.from('jobs').update({completed_at, actual_duration_min, washer_notes, upsell_attempted, upsell_converted, ...}).eq('id', jobId)  -- complete job
- supabase.storage.from('castudio-photos').upload(filePath, compressedFile)  -- photo upload
- supabase.from('job_photos').insert({job_id, washer_id, photo_type, sop_step_id, photo_url, caption})  -- photo record

REALTIME:
- supabase.channel('bookings').on('postgres_changes', {event: 'INSERT', filter: `washer_id=eq.${currentUser.id}`}, callback)  -- new job assigned notification
- supabase.channel('bookings').on('postgres_changes', {event: 'UPDATE', filter: `washer_id=eq.${currentUser.id}`}, callback)  -- job rescheduled/cancelled notification
```

**What systems.castudio.id sees from washer activity:**
- Real-time booking status updates (en_route, in_progress, completed) reflected on the Operations Board
- Job records with all photos, duration, notes appearing in Job Tracker module
- Photo uploads visible in Job Tracker photo gallery
- Upsell attempt/conversion data flowing into analytics

---

## 9. Offline Behavior

The washer may lose cell signal in parking garages, basements, or remote areas. The app must handle this gracefully.

**Offline capabilities:**
- Today's schedule is cached on app open. Viewable offline.
- SOP checklists are cached per service type on first load. Viewable offline.
- Photos taken offline are queued in local storage (IndexedDB). A badge shows "3 photos pending upload". Auto-uploads when connection returns.
- Status transitions (en_route, in_progress, completed) are queued if offline and synced on reconnect.
- Earnings and History screens require connection (show "connect to internet to view" message).

**Sync indicator:** Small dot in header. Green = connected, yellow = syncing queued items, red = offline.

---

## 10. Notifications

**Push notifications sent to washer (via Supabase Realtime or web push):**

| Event | Notification | When |
|-------|-------------|------|
| New job assigned | "New job: [service_type] for [customer_name] on [date] at [time]" | Admin assigns booking to washer |
| Job rescheduled | "Job rescheduled: [customer_name] moved to [new_date] [new_time]" | Admin changes date/time |
| Job cancelled | "Job cancelled: [customer_name] [service_type] on [date]" | Admin or customer cancels |
| Customer rating received | "You received a ★[rating] rating from [customer_name]" | Customer rates after job |
| Tomorrow's preview | "You have [count] jobs tomorrow. First job at [time]." | 8pm the night before |

---

## 11. Build Order

### Phase 1: Core Flow
1. Set up Next.js PWA project with Supabase auth (washer login)
2. Create sop_checklists and job_photos tables, seed SOP data for all service types
3. Build Today screen: fetch assigned bookings, show job cards with customer info, navigate/call buttons
4. Build Active Job screen: SOP checklist, step-by-step flow, photo capture and upload
5. Build job completion flow: status transitions, job record creation, mandatory photo validation

### Phase 2: Tracking & Earnings
6. Build History screen: past jobs list with photo gallery
7. Build Earnings screen: monthly breakdown, bonus calculations, qualification status
8. Build Profile screen: basic info, password change, logout

### Phase 3: Polish
9. Add offline support (IndexedDB photo queue, cached schedules/SOPs)
10. Add push notifications for new assignments and schedule changes
11. Add upsell prompt after pre-inspection step
12. PWA manifest, icons, splash screen for "Add to Home Screen" install experience
