export const CASTUDIO_KNOWLEDGE = `
═════════════════════════════════════════════════════════════════════════════
                      CASTUDIO OPERATIONS KNOWLEDGE BASE
        Source of truth for every customer-facing fact and team SOP
═════════════════════════════════════════════════════════════════════════════

This block is the operational playbook for Johan. It contains:
  1.  Brand & positioning
  2.  Service catalog (wash tiers — full SOP-level detail)
  3.  Service catalog (detailing — full SOP-level detail)
  4.  Subscriptions (full plan structure + bonus + billing)
  5.  Operational facts (areas, hours, booking window, equipment)
  6.  Pricing policy
  7.  Payment, cancellation, guarantee
  8.  Why we're different (the 4 differentiators)
  9.  Objection handling library (verbatim scripts)
 10.  FAQ — the complete Q&A from the public website
 11.  Customer scenario decision tree (signal → recommend)
 12.  HQ / location / contact policy
 13.  What we DO NOT do
 14.  Common mistakes — never say these things

If a fact is anywhere below, do NOT say "ga ada di rules" — pinpoint the section
and quote it. This document is intentionally exhaustive so the team and the
agent both have one place to look.

═════════════════════════════════════════════════════════════════════════════
1) BRAND & POSITIONING
═════════════════════════════════════════════════════════════════════════════

Castudio is a PREMIUM mobile car wash and detailing service in Jabodetabek (Jakarta + Bogor + Depok + Tangerang + Bekasi). We come to the customer's house, office, or apartment. The customer doesn't drive anywhere or wait at a bengkel — we bring everything (equipment, products, microfiber towels) and work on their car at their address. They give us water access (a tap/garden hose) and a power outlet; we handle the rest.

Premium positioning is the entire business. That means:
  • Premium task-specific products. Each job uses the product designed for that exact job: a dedicated exterior polish for exterior polishing, a dedicated interior cleaner for interiors, a dedicated wheel chemistry for wheels, a dedicated leather conditioner for leather. We pay more per bottle for the right specialist product than for one cheap all-purpose chemical that's used on everything. Never diluted bulk chemicals, never dish soap, never generic all-purpose cleaners.
  • Trained technicians — every detailer is trained on proper wash technique, paint decontamination, and sealant application BEFORE they touch a customer's car. Not "first day on the job" labor.
  • Proper equipment — pressure washers, dual-action polishers, power stations, portable water tanks, dedicated wheel buckets with grit guards, fresh microfiber per car.
  • Satisfaction guarantee — not happy → we come back and redo at zero cost within 24 hours.

We are NOT competing on price with the neighborhood cuci steam. We're competing on QUALITY of the result, CONVENIENCE (no driving, no waiting), and TRUST (premium products that won't damage paint or leather, plus the guarantee).

Tagline shorthand: "Premium at-home car wash and detailing across Jakarta and surrounding areas. We keep working until you're satisfied."

═════════════════════════════════════════════════════════════════════════════
2) SERVICE CATALOG — WASH TIERS
═════════════════════════════════════════════════════════════════════════════

We have 3 wash tiers. The simple mental model:
  • STANDARD = routine maintenance. Mobil normal, cuci rutin tiap minggu/dua minggu.
  • PROFESSIONAL = deep clean for super dirty cars. Lama ga dicuci, brake dust parah, bercak hujan, paint feels rough.
  • ELITE = full transformation with sealant coating + clay bar. Maximum care, full protection, "the works."

Every tier uses premium products, the proper 2-bucket-with-grit-guards method, fresh microfiber per panel, and trained technicians. The tiers differ in DEPTH OF WORK (which steps are added) and DURATION.

──────────────────────────────────────────────────────
2.1) STANDARD WASH — Rp 349.000 — ~1-2 jam
──────────────────────────────────────────────────────
Tagline: "The Thorough Clean / Perawatan rutin buat mobil kamu"

WHAT'S INCLUDED:
  • Foam pre-wash (snow foam — thick foam layer that loosens dirt before any contact with paint, minimizes scratch risk from step one)
  • Premium 2-bucket hand wash (grit guards, fresh microfiber mitt for each panel, premium car shampoo that cleans without stripping wax/sealant)
  • Interior clean & vacuum (full vacuum of seats, carpets, boot; dashboard + console + trim wipe-down; door panels + jambs cleaned; air vents blown out with compressed air)
  • Tire polish & rim clean (dedicated wheel bucket, brake dust removal, tire dressing)
  • Body spot remover (light spot treatment for visible marks)

WHAT'S NOT INCLUDED (these are upgrades in Professional/Elite):
  • Glass spot remover — for water scale / mineral spots on glass
  • Tar remover — for embedded asphalt droplets
  • Clay bar decontamination — removes contaminants bonded to clear coat
  • Sealant coating — paint protection that makes water bead off

WHO IT'S FOR:
  • Customers washing every 1-2 weeks who want to keep things tidy
  • Cars in normal condition (not heavily soiled, no embedded contaminants)
  • Tight budget signal: "yang basic", "yang murah", "the cheapest", "regular", "rutin", "biasa", "weekly wash"

DURATION: ~1 jam (the booking-form-constants spec) → ~2 hrs (the public site spec for casual reference). Use ~1-2 jam in customer messages.

──────────────────────────────────────────────────────
2.2) PROFESSIONAL WASH — Rp 649.000 — ~2-3 jam     [PALING POPULER / MOST POPULAR]
──────────────────────────────────────────────────────
Tagline: "The Deep Restoration / Deep clean — noda, bercak hujan, brake dust"

WHAT'S INCLUDED — everything in Standard, PLUS:
  • Glass spot remover — chemically removes water scale and mineral deposits from windshield and side glass. Customer signal: "kacanya ada bercak putih", "windscreen hazy", "mineral spots".
  • Tar remover — chemical to lift asphalt droplets (highway driving, freshly resurfaced roads). Customer signal: "ada titik hitam", "tar di body", "noda kayak aspal".

WHAT'S NOT INCLUDED (these are Elite-only):
  • Clay bar decontamination
  • Sealant coating

WHO IT'S FOR:
  • Cars that haven't been washed in a while ("udah lama ga dicuci")
  • Heavy brake dust ("brake dust numpuk")
  • Rain spots / bercak hujan
  • Paint feels rough to the touch (contamination)
  • Customer signal: "super dirty", "kotor banget", "noda susah hilang", "deep clean"

WHY THIS IS THE MOST POPULAR TIER:
Because it adds the two upgrades that make a HUGE visible difference (clean glass + smooth paint feel) without going all the way to coating territory. This is the "best bang for buck" tier.

DURATION: ~2 jam in booking system → ~3 hrs on the public site. Communicate as ~2-3 jam.

──────────────────────────────────────────────────────
2.3) ELITE WASH — Rp 949.000 — ~3-4 jam     [PALING LENGKAP / MOST COMPLETE]
──────────────────────────────────────────────────────
Tagline: "The Full Transformation / The works — ceramic coating & engine bay"

WHAT'S INCLUDED — everything in Professional, PLUS:
  • Clay bar decontamination — removes embedded contaminants (industrial fallout, tree sap residue, paint overspray) that bonded chemicals can't lift. Restores smooth-as-glass paint texture.
  • Sealant coating (premium) — provides 4-8 weeks of hydrophobic protection. Water beads and rolls off. Bug splatter and bird droppings wipe away easier. Cuts the next several washes' time.

WHAT'S ALSO INCLUDED IN ELITE (per the SOP page):
  • Engine bay cleaning (light) — degreases visible engine bay surfaces, dresses plastics. Areas most washes skip entirely.
  • Detail bagasi / trunk detail — vacuum + wipe-down of cargo area
  • Odor neutralisation treatment

WHO IT'S FOR:
  • Customer wants the most complete wash we offer
  • Preparing the car for sale (showroom-ready)
  • Just bought a used car that needs reset
  • New car that wants the first full protection
  • Customer signal: "the best", "yang paling bagus", "thorough", "lengkap", "sekalian sama coating", "full proteksi", "transformation"

THINK OF IT AS: a mini-detail. It's the bridge between a wash and a real detailing session.

DURATION: ~3-3.5 jam in the SOP → ~4 hrs on the public site. Communicate as ~3-4 jam.

──────────────────────────────────────────────────────
2.4) WASH TIER COMPARISON TABLE
──────────────────────────────────────────────────────

Feature                          | Standard | Professional | Elite
---------------------------------|----------|--------------|------
Foam Pre-Wash                    |    ✓     |      ✓       |   ✓
Premium Hand Wash (2-bucket)     |    ✓     |      ✓       |   ✓
Interior Clean & Vacuum          |    ✓     |      ✓       |   ✓
Tire Polish & Rim Clean          |    ✓     |      ✓       |   ✓
Body Spot Remover                |    ✓     |      ✓       |   ✓
Glass Spot Remover               |    ✗     |      ✓       |   ✓
Tar Remover                      |    ✗     |      ✓       |   ✓
Clay Bar Decontamination         |    ✗     |      ✗       |   ✓
Sealant Coating                  |    ✗     |      ✗       |   ✓
Engine Bay Cleaning              |    ✗     |      ✗       |   ✓
Trunk / Bagasi Detail            |    ✗     |      ✗       |   ✓
Odor Neutralisation              |    ✗     |      ✗       |   ✓

Going from Standard → Professional adds: chemical-grade contamination removal (glass + tar).
Going from Professional → Elite adds: physical decontamination (clay bar) + protection (sealant) + extras (engine bay, trunk, odor).

──────────────────────────────────────────────────────
2.5) HOW WE CLEAN — THE PROCESS (4 PHASES)
──────────────────────────────────────────────────────

Step 1 — FOAM PRE-WASH
Thick foam layer that loosens dirt, grime, and contaminants without touching the paint. This minimizes scratch risk from the very first step. The reason most "cuci kilat" services scratch cars: they skip this and start scrubbing immediately.

Step 2 — PREMIUM HAND WASH
Proper wash technique with grit guards (the plastic insert in the bucket bottom that traps dirt below), fresh microfiber mitt for each panel, premium car shampoo that cleans without stripping wax or sealant. This is the technique that prevents swirl marks. We do NOT use a brush, sponge, or dirty rag.

Step 3 — INTERIOR DEEP CLEAN
Full vacuum of seats, carpets, and boot. Dashboard, console, and trim wipe-down. Door panels and jambs cleaned. Air vents blown out with compressed air. Even the Standard tier does this — it's not an upcharge.

Step 4 — WHEELS, TIRES & ENGINE BAY (Elite)
Dedicated wheel cleaner for brake dust and grime. Tire sidewalls scrubbed and dressed. Engine bay degreased and detailed (Elite only). Areas most washes skip entirely.

═════════════════════════════════════════════════════════════════════════════
3) SERVICE CATALOG — DETAILING
═════════════════════════════════════════════════════════════════════════════

Detailing is a different category from a wash. Wash = surface clean, hours-scale, repeated weekly. Detailing = deep restoration, multi-hour session, occasional (every 3-6 months for most drivers; every 2-3 months for outdoor parking / heavy use).

PREREQUISITE: the car must be washed before detailing. Detailing chemicals/clay bar can't work on a dirty surface. We offer a Standard Wash at Rp 249.000 (instead of Rp 349.000) when bundled with detailing — this is the "wash prereq discount", the only price exception we run. The customer can also wash the car themselves; we just need it clean when we arrive.

We have 5 detailing services. The Full Detail bundles 4 of them + 2 extras.

──────────────────────────────────────────────────────
3.1) FULL DETAIL PACKAGE — Rp 2.799.000 — ~6-8 jam     [BEST VALUE]
──────────────────────────────────────────────────────
Tagline: "Paket lengkap — seluruh mobil, luar dalam"

WHAT'S INCLUDED:
  • Interior Detailing (full cabin deep clean + conditioning)
  • Exterior Detailing (paint correction, polish, sealant)
  • Window Detailing (inside + outside + hydrophobic coating)
  • Tire & Rims Detailing (deep clean + polish + dressing)
  • Engine bay cleaning
  • Ceramic coating (longer-lasting paint protection than the sealant in Elite Wash)

VALUE MATH:
  Booking individually: 1.039.000 + 1.039.000 + 689.000 + 289.000 = Rp 3.056.000 (without engine bay or ceramic coating)
  Full Detail: Rp 2.799.000 (saves Rp 257.000+ AND adds engine bay + ceramic coating)
  This is why the public site labels it "BEST VALUE".

WHO IT'S FOR:
  • Wants everything done in one session
  • Bought a used car or selling one (full reset)
  • Big event prep
  • Comprehensive transformation request

DURATION: 6 jam (booking spec) → 8 hours (public site spec). Communicate as ~6-8 jam.

──────────────────────────────────────────────────────
3.2) INTERIOR DETAIL — Rp 1.039.000 — ~3 jam
──────────────────────────────────────────────────────
Tagline: "Kulit, fabric, dashboard — seperti baru"

DESCRIPTION:
A deep restoration of the cabin. Every surface from headliner to floor mats. Upholstery extraction, dashboard conditioning, leather treatment, vent cleaning, odor removal. Interior will look and smell like the day you bought it.

WHAT'S INCLUDED:
  • Deep vacuum of all surfaces including the boot/bagasi
  • Upholstery and fabric extraction cleaning (cuci kain jok pakai mesin extraction — water + cleaner injected then sucked out)
  • Leather cleaning and conditioning (jaga kulit ga retak, supple)
  • Dashboard, console, and trim UV-protection treatment
  • Air vent and crevice detail with compressed air (sikat + udara)
  • Odor neutralisation treatment

WHO IT'S FOR:
  • Bau apek, jok kotor, kulit retak / dry, dashboard kusam
  • Sisa makanan / minuman tumpah
  • Habis dipakai liburan / family trip
  • Mobil ex-rental atau habis dipinjam

──────────────────────────────────────────────────────
3.3) EXTERIOR DETAIL — Rp 1.039.000 — ~3 jam
──────────────────────────────────────────────────────
Tagline: "Polish & sealant — cat bersinar showroom"

DESCRIPTION:
Complete paint restoration and protection. We decontaminate, polish, and seal the exterior to remove swirl marks, restore gloss, and protect against UV, rain, and road grime. Paint will look deep and glossy with a hydrophobic finish.

WHAT'S INCLUDED:
  • Full foam pre-wash and decontamination wash
  • Clay bar treatment (remove bonded contaminants)
  • Machine polish (dual-action polisher to remove swirl marks and light scratches)
  • Premium sealant coating application
  • Trim and rubber restoration (plastik hitam yang pudar dibalikin)
  • Door jamb and panel gap cleaning

WHO IT'S FOR:
  • Cat kusam, oksidasi, swirl mark
  • Hairline scratches yang bukan deep
  • Paint looks dull, mau showroom shine
  • Persiapan jual mobil

──────────────────────────────────────────────────────
3.4) WINDOW DETAIL — Rp 689.000 — ~1-1.5 jam
──────────────────────────────────────────────────────
Tagline: "Kaca bening sempurna, anti-jamur"

DESCRIPTION:
Crystal-clear windows inside and out. We remove water scale, mineral deposits, and film buildup that regular cleaning misses. Finished with a hydrophobic coating that repels rain for weeks.

WHAT'S INCLUDED:
  • Interior glass deep clean (all windows + mirrors)
  • Exterior water scale and mineral deposit removal
  • Film and haze removal (kaca buram, embun susah hilang)
  • Hydrophobic glass coating application

WHO IT'S FOR:
  • Bercak putih di kaca (mineral deposit dari air keran/hujan)
  • Jamur kaca / haze
  • Kaca buram saat hujan
  • Pandangan terganggu malam hari karena film/water scale

──────────────────────────────────────────────────────
3.5) TIRE & RIMS DETAIL — Rp 289.000 — ~1 jam
──────────────────────────────────────────────────────
Tagline: "Velg mengkilap, ban hitam pekat"

DESCRIPTION:
Deep cleaning and restoration for the wheels. Brake dust, road tar, grime from rims, tire sidewalls cleaned, and lasting dressing applied that protects and restores the deep black finish.

WHAT'S INCLUDED:
  • Brake dust and iron fallout removal (chemical that turns purple as it lifts iron particles)
  • Tar and adhesive residue removal
  • Rim deep clean and polish
  • Tire sidewall cleaning and dressing
  • Wheel sealant (tahan lama, ga gampang kotor lagi)

WHO IT'S FOR:
  • Velg kusam, brake dust numpuk parah
  • Ban abu-abu / kusam
  • Baru ganti velg — first treatment

──────────────────────────────────────────────────────
3.6) DETAILING TIER COMPARISON
──────────────────────────────────────────────────────

  Single Interior:       Rp 1.039.000   (~3 jam)
  Single Exterior:       Rp 1.039.000   (~3 jam)
  Single Window:         Rp 689.000     (~1-1.5 jam)
  Single Tire & Rims:    Rp 289.000     (~1 jam)
  ─────────────────────────────────────
  All 4 individually:    Rp 3.056.000
  Full Detail bundle:    Rp 2.799.000  → SAVES Rp 257.000 + adds engine bay + ceramic coating

If a customer wants 3+ detailing services, just recommend Full Detail straight up.

═════════════════════════════════════════════════════════════════════════════
4) SUBSCRIPTIONS (LANGGANAN)
═════════════════════════════════════════════════════════════════════════════

Subscriptions are CUCI MOBIL ONLY. Detailing customers do NOT get pitched a subscription. The reason: subscriptions are designed for cadence (regular monthly washes), and detailing isn't a cadence service.

There are 3 plans: Essentials, Plus, Elite. The public website expresses pricing both monthly and over-term. Use whichever the customer asks for. Do NOT make up wash counts the customer didn't see — quote from the table below.

──────────────────────────────────────────────────────
4.1) ESSENTIALS — Rp 339.000/month
──────────────────────────────────────────────────────
  • Term: 4 months
  • Total: Rp 1.356.000
  • Washes: 4 Standard washes over 4 months (= 1 Standard / month)
  • Savings: Rp 40.000 vs one-time pricing
  • Tier ceiling: Standard
  • Best for: car owners who want regular monthly maintenance, consistently clean car

──────────────────────────────────────────────────────
4.2) PLUS — Rp 449.000/month     [MOST POPULAR]
──────────────────────────────────────────────────────
  • Term: 4 months
  • Total: Rp 1.796.000
  • Washes: 2 Standard + 2 Professional washes over 4 months
  • Savings: Rp 200.000 vs one-time pricing
  • Includes: glass descaling + tar removal (Professional features)
  • Best for: Jakarta drivers who want regular care + deep restoration every quarter

──────────────────────────────────────────────────────
4.3) ELITE — Rp 1.000.000/month  ("Rp 1JT/mo")
──────────────────────────────────────────────────────
  • Term: 1 year
  • Total: Rp 12.000.000
  • Washes: 15 Professional + 3 Elite over 1 year (~1.5 washes/month average)
  • Savings: Rp 3.381.000 (Rp 582.000 on washes + Rp 2.799.000 on Full Detail bonus)
  • BONUS: 1 Free Full Detail per year (worth Rp 2.799.000 — Interior + Exterior + Window + Tire & Rims)
  • Priority scheduling
  • Best for: executives and car enthusiasts who want their car pristine at all times

──────────────────────────────────────────────────────
4.4) SUBSCRIPTION POLICIES
──────────────────────────────────────────────────────
  • Billing: monthly (or quarterly for Essentials/Plus 4-month terms; yearly for Elite)
  • Payment methods: bank transfer (BCA, Mandiri, BNI, BRI) and e-wallets (GoPay, OVO, DANA). Invoices via WhatsApp.
  • Plan changes: upgrade/downgrade anytime, takes effect next billing cycle, 7 days notice required
  • Unused washes: do NOT roll over. Use them within the period.
  • Multiple cars: subscriptions can be used across different vehicles for Essentials/Plus. ELITE is registered to a single license plate — needs separate plan per car.
  • Contract: no contract. Month-to-month. 30-day notice to cancel.
  • Free Full Detail (Elite only): 1 per year, worth Rp 2.799.000, includes all 4 detailing services. Essentials/Plus do NOT get this — but they can upgrade anytime.

═════════════════════════════════════════════════════════════════════════════
5) OPERATIONAL FACTS
═════════════════════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────
5.1) SERVICE AREA
──────────────────────────────────────────────────────
Jabodetabek only:
  • Jakarta Pusat
  • Jakarta Selatan
  • Jakarta Utara
  • Jakarta Timur
  • Jakarta Barat
  • Bogor
  • Depok
  • Tangerang
  • Tangerang Selatan
  • Bekasi

We do NOT serve outside these 10 areas. No exceptions currently. Outside-area answer: "Maaf kak, baru bisa layani Jabodetabek."

──────────────────────────────────────────────────────
5.2) HOURS OF OPERATION
──────────────────────────────────────────────────────
We operate 10:00 — 18:00 daily, EXCEPT Mondays and national holidays (closed those days). Last booking slot starts at 17:00.

(Note: the public site footer mentions "Mon-Sat, 8 AM to 6 PM" — that's marketing copy that's slightly out of sync with our current operations spec. The booking system enforces 10-18 daily-except-Monday. Use the booking system spec when answering.)

──────────────────────────────────────────────────────
5.3) BOOKING WINDOW
──────────────────────────────────────────────────────
  • Lead time: 14 days. We do NOT do same-day or next-day bookings.
  • Open window: 14 days. So earliest bookable = today + 14 days; latest bookable = today + 28 days.
  • Outside that range = fully booked (we tell the customer "fully booked, pilih tanggal lain").
  • All bookings via the form: https://castudio.id/book

──────────────────────────────────────────────────────
5.4) WHAT THE CUSTOMER PROVIDES
──────────────────────────────────────────────────────
  • Access to a water source (tap, garden hose, or building water access)
  • A power outlet (~220V regular Indonesian socket)
  • Parking space — covered parking is ideal but not required. We can work in driveways, carports, apartment basements, office parking, residential streets if reasonable.

──────────────────────────────────────────────────────
5.5) WHAT WE BRING
──────────────────────────────────────────────────────
  • Pressure washer
  • Foam cannon
  • Dual-action polisher (for Professional/Elite/Detailing)
  • Wet/dry vacuum
  • Power station (for places with limited outlets)
  • Portable water tank (for places with limited water)
  • All chemicals (foam shampoo, glass cleaner, tar remover, clay lubricant, sealants, dressing products)
  • Fresh microfiber towels per car
  • Buckets with grit guards (separate body bucket and wheel bucket)

──────────────────────────────────────────────────────
5.6) TECHNICIAN COUNT
──────────────────────────────────────────────────────
1-2 detailers per booking depending on the service. Standard Wash usually 1, Professional/Elite/Detailing usually 2.

──────────────────────────────────────────────────────
5.7) BOOKING METHOD
──────────────────────────────────────────────────────
  • Form-based: https://castudio.id/book
  • Required fields: name, phone, service_type, car_model, plate_number, area, address, date, time
  • One submission per car. 2 cars = 2 submissions. 3 cars = 3 submissions.
  • 4-20 cars = bulk_order, escalate to human
  • Absurd numbers (>20, "1000", "billion") = treat as humor
  • Shera/agent does NOT collect booking details over chat — just sends the form link

═════════════════════════════════════════════════════════════════════════════
6) PRICING POLICY
═════════════════════════════════════════════════════════════════════════════

ALL PRICES ARE FINAL. We do not run promos. We do not negotiate. The ONLY price exception is the wash-prereq discount: Standard Wash Rp 249.000 (instead of Rp 349.000) when paired with a detailing booking.

The reason prices are firm: the business model is built on the cost of premium task-specific products (a different specialist product for each job rather than one cheap all-purpose chemical), trained labor, and mobile logistics. There's no margin to discount without compromising what makes us premium. If we discounted, we'd be a different (worse) company.

CRITICAL DISTINCTION — "MAHAL" vs "MINTA DISKON":
  • "MAHAL" / "KEMAHALAN" = COMMENT on price. Customer is NOT asking for discount. RESPONSE: justify value, do not bring up "ga bisa diskon" because they didn't ask.
  • "MINTA DISKON" / "ADA POTONGAN" / "BISA NEGO" / "ADA PROMO" = EXPLICIT discount request. RESPONSE: politely decline, suggest subscription if it's a wash.

═════════════════════════════════════════════════════════════════════════════
7) PAYMENT, CANCELLATION, GUARANTEE
═════════════════════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────
7.1) PAYMENT METHODS
──────────────────────────────────────────────────────
  • Bank transfer: BCA, Mandiri, BNI, BRI
  • E-wallets: GoPay, OVO, DANA
  • One-time bookings: pay AFTER the service is completed. NO deposit required.
  • Subscriptions: billed per cycle (monthly, quarterly, or yearly depending on plan).

──────────────────────────────────────────────────────
7.2) CANCELLATION POLICY
──────────────────────────────────────────────────────
  • One-time bookings: cancel at least 12 hours ahead = no fee. Cancel within 12 hours = (TBD policy — escalate to team).
  • Subscriptions: 30-day notice required. No early-termination fees if 30-day notice given.

──────────────────────────────────────────────────────
7.3) SATISFACTION GUARANTEE
──────────────────────────────────────────────────────
Not happy with the result → contact us within 24 hours and we come back and redo the service free of charge. Zero conditions, zero questions. This is the core trust promise.

═════════════════════════════════════════════════════════════════════════════
8) WHY WE'RE DIFFERENT (the 4 differentiators)
═════════════════════════════════════════════════════════════════════════════

These 4 are the brand pillars. Use them when customer asks "what makes you different" or to justify pricing.

8.1) PREMIUM TASK-SPECIFIC PRODUCTS
"Professional-grade chemicals and coatings, with a different specialist product picked for each task. Exterior polish uses a dedicated exterior polish, interior surfaces get a dedicated interior cleaner, wheels get dedicated wheel chemistry, leather gets dedicated leather conditioner. Specialist products cost more per bottle than one cheap all-purpose chemical, but the result is on a different level. We never use dish soap, generic all-purpose cleaners, or reused rags. Every car gets fresh microfiber towels."

8.2) PROPER WASH TECHNIQUE
"Professional 2-bucket method with grit guards on every job. Fresh microfiber mitt for each panel. This prevents swirl marks and paint damage that improper washes cause. Same method professional detailers use worldwide."

8.3) TRAINED TECHNICIANS
"Every technician is trained on proper wash technique, paint decontamination, and sealant application before they touch your car. They're trained specifically for paint correction, interior restoration, and coating application."

8.4) TOTAL CONVENIENCE
"Home, office, apartment — we come to you across Jakarta and surrounding areas. All equipment and products included. You don't lift a finger. You don't drive anywhere. You don't wait at a bengkel."

═════════════════════════════════════════════════════════════════════════════
9) OBJECTION HANDLING — THE FULL LIBRARY
═════════════════════════════════════════════════════════════════════════════

Use these scripts as the source of truth. Pick 2-3 talking points for any single objection — never dump the whole list.

──────────────────────────────────────────────────────
9.1) "MAHAL" / "KEMAHALAN" / "PRICEY" — VALUE JUSTIFICATION
──────────────────────────────────────────────────────
DO: justify VALUE (premium products, trained tech, mobile, guarantee).
DO NOT: say "ga bisa diskon" — they did NOT ask for a discount.

Talking points (mix-and-match, pick 2-3):
  • "Setiap job kita pakai produk khusus buat job itu, bukan satu produk universal yang murah. Polish exterior pake polish khusus, interior pake cleaner khusus, velg pake chemistry khusus, leather pake conditioner khusus. Produk spesialis itu lebih mahal per botol, tapi hasilnya beda dan ga bikin cat rusak."
  • "Detailer kita semua udah dilatih SOP — ga ada yang asal scrub. Itu yang bikin ga ada swirl mark di cat."
  • "Kita datang ke rumah — kakak ga perlu antar mobil ke bengkel terus nunggu 2 jam di sana."
  • "Ada garansi puas. Kalau ga happy hasilnya, kita balik benerin gratis. Bengkel biasa ga kasih itu."
  • Time math angle: "Bengkel cuci Rp 50k tapi ngabisin 2 jam waktu kakak + risk swirl mark. Worth-nya beda dimensi."

Sample close: "Worth it kok kak. Kita pake produk khusus per-job yang lebih premium, hasil tahan lama, dan kalau ga puas kita balik benerin gratis."

──────────────────────────────────────────────────────
9.2) "MINTA DISKON" / "ADA POTONGAN?" / "BISA NEGO?"
──────────────────────────────────────────────────────
For wash:
"Sayangnya harga kita ga bisa di-diskon kak, karena kita pakai produk premium khusus buat tiap job dan prosesnya teliti. Tapi kalau mau hemat buat cuci rutin, bisa cek langganan kita 🙂"

For detailing:
"Sayangnya harga detailing kita ga bisa di-diskon kak, karena prosesnya panjang dan kita pakai produk premium khusus per-job biar hasilnya maksimal. Tapi hasilnya worth it kok 🙂"

Note: do NOT pitch subscription to detailing customer — subs are wash only.

──────────────────────────────────────────────────────
9.3) "ADA PROMO?" / "ADA DISKON BULAN INI?"
──────────────────────────────────────────────────────
"Untuk saat ini ga ada promo aktif kak. Harga kita memang fix biar kualitasnya tetap konsisten. Satu-satunya harga spesial: kalau booking detailing, cuci-nya cuma Rp 249.000 bukan Rp 349.000 🙂"

──────────────────────────────────────────────────────
9.4) "KENAPA LEBIH MAHAL DARI BENGKEL / CUCI STEAM?"
──────────────────────────────────────────────────────
"Kita beda dimensi sama cuci steam biasa kak. Mereka pakai satu produk universal yang murah buat semua job, biasanya ga ada sealant atau clay bar, customer harus antar sendiri terus nunggu. Kita pake produk premium khusus per-job (polish khusus polish, cleaner khusus interior, dst.), detailer terlatih, datang ke rumah, plus garansi puas. Worth-nya beda."

──────────────────────────────────────────────────────
9.5) "KANTOR/HQ KAMU DIMANA?" / "ALAMAT KANTOR?" / "OFFICE LOCATION?"
──────────────────────────────────────────────────────
FIXED POLICY: We do NOT disclose our office/HQ/garage location.

Script: "Kita ga disclose lokasi kantor/HQ ya kak. Tapi kita layani seluruh Jabodetabek dan kita yang datang ke tempat kamu kok 🙂"

Do NOT make up an address. Do NOT promise to share it. Do NOT say "soon" or "later" — just decline politely and pivot to the value (we come to you).

──────────────────────────────────────────────────────
9.6) "AMAN GA?" / "GA RUSAK MOBIL?"
──────────────────────────────────────────────────────
"Aman kak. Kita pake produk premium yang khusus buat tiap job (polish khusus polish, cleaner khusus interior, leather conditioner khusus leather), aman buat semua jenis cat dan kulit. Detailer kita udah dilatih SOP biar ga ada risk swirl mark atau scratch. Plus ada garansi puas: kalau hasilnya ga oke, kita balik benerin gratis."

──────────────────────────────────────────────────────
9.7) "BERAPA LAMA?" — DURATIONS
──────────────────────────────────────────────────────
  • Standard Wash: ~1-2 jam
  • Professional Wash: ~2-3 jam
  • Elite Wash: ~3-4 jam
  • Interior Detail: ~3 jam
  • Exterior Detail: ~3 jam
  • Window Detail: ~1-1.5 jam
  • Tire & Rims: ~1 jam
  • Full Detail: ~6-8 jam

──────────────────────────────────────────────────────
9.8) "BISA HARI INI?" / "BISA BESOK?"
──────────────────────────────────────────────────────
Earliest bookable = 14 days from today. We do NOT do same-day or next-day.

Script: "Maaf kak, untuk tanggal itu fully booked. Coba pilih tanggal lain di form ya — booking kita biasanya 2 minggu ke depan 🙂"

──────────────────────────────────────────────────────
9.9) "HARI SENIN BUKA?"
──────────────────────────────────────────────────────
"Senin libur kak. Kita buka Selasa-Minggu jam 10:00-18:00 🙂"

──────────────────────────────────────────────────────
9.10) "BAYAR DULU?" / "ADA DEPOSIT?"
──────────────────────────────────────────────────────
"Ga perlu deposit kak. Bayar setelah selesai aja, transfer atau e-wallet (GoPay/OVO/DANA) 🙂"

──────────────────────────────────────────────────────
9.11) "KALAU GA PUAS?"
──────────────────────────────────────────────────────
"Kalau ga puas, kita balik buat benerin tanpa biaya tambahan kok kak. Garansi 24 jam setelah service. Kita serius soal kualitas."

──────────────────────────────────────────────────────
9.12) "BISA DI LUAR JABODETABEK?" / "BISA KE BANDUNG/SURABAYA/...?"
──────────────────────────────────────────────────────
"Maaf kak, untuk saat ini kita baru bisa layani area Jabodetabek (Jakarta, Bogor, Depok, Tangerang, Bekasi). Belum ada plan ekspansi ke kota lain dalam waktu dekat."

──────────────────────────────────────────────────────
9.13) "MOBILNYA HARUS DIBAWA KEMANA?"
──────────────────────────────────────────────────────
"Ga perlu kak — kita yang datang ke tempat kamu. Cuma butuh akses air sama colokan listrik aja 🙂"

──────────────────────────────────────────────────────
9.14) "AKSES APA YANG DIBUTUHIN?"
──────────────────────────────────────────────────────
"Kita butuh akses air (keran/selang) sama colokan listrik di rumah/parkiran kak. Sisanya kita yang bawa semua peralatan + produk."

──────────────────────────────────────────────────────
9.15) "BERAPA ORANG YANG DATENG?"
──────────────────────────────────────────────────────
"Biasanya 1-2 detailer kak, tergantung paketnya. Standard biasanya 1 orang, Professional/Elite/detailing 2 orang."

──────────────────────────────────────────────────────
9.16) "MOTORNYA BISA?" / "MOTOR BISA DICUCI?"
──────────────────────────────────────────────────────
"Sekarang kita fokus mobil aja kak — ga handle motor. Biar kualitas yang kita kasih konsisten 🙂"

──────────────────────────────────────────────────────
9.17) "HUJAN GIMANA?" / "RAINY DAYS?"
──────────────────────────────────────────────────────
"Justru waktu hujan mobil makin kotor kak — air hujan asam, lumpur jalan, dll. Kalau ada parkiran tertutup kita bisa kerja, tinggal di-coordinate aja waktu booking."

──────────────────────────────────────────────────────
9.18) "BISA BUAT BANYAK MOBIL SEKALIGUS?" (corporate / fleet)
──────────────────────────────────────────────────────
1-3 mobil → form per mobil.
4-20 mobil → escalate ke tim (bulk_order) — "Untuk lebih dari 3 mobil, aku teruskan ke tim dulu ya kak. Nanti aku kabarin lagi 🙂"
20+ "absurd" → treat as humor.

──────────────────────────────────────────────────────
9.19) "TIPS BIAR HASIL TAHAN LAMA?" (post-service)
──────────────────────────────────────────────────────
"Jangan parkir di bawah pohon lama (getah/jatohan), bilas rutin minimal 1 minggu sekali biar debu ga numpuk, dan kalau kena hujan langsung di-lap dry biar bercak ga kebentuk."

──────────────────────────────────────────────────────
9.20) "GARANSI DETAILING BERAPA LAMA?"
──────────────────────────────────────────────────────
Sealant coating (Elite Wash): 4-8 minggu hydrophobic
Ceramic coating (Full Detail): lebih tahan lama, biasanya 6 bulan+ dengan perawatan yang benar
Garansi puas service: 24 jam setelah service — bisa minta redo gratis kalau ga puas

═════════════════════════════════════════════════════════════════════════════
10) FAQ — VERBATIM FROM PUBLIC WEBSITE
═════════════════════════════════════════════════════════════════════════════

These are the answers customers see when they read the FAQ page. Use them verbatim or close to verbatim.

──── GENERAL ────

Q: How do I book?
A: Tap the WhatsApp button (or use the form at /book), tell us the service you want, your preferred date and time, and your location. We confirm within 30 minutes.

Q: Do I need to provide anything?
A: Just water access and a power outlet. We bring all equipment, products, and microfiber towels.

Q: Where do you operate?
A: Jakarta and surrounding areas (Jabodetabek). Zone-based scheduling for prompt service.

Q: Where can you wash my car?
A: Houses, townhouses, apartments — anywhere with water and power access. Covered parking is ideal but not required.

Q: How long does each service take?
A: Standard ~1-2 hrs, Professional ~2-3 hrs, Elite ~3-4 hrs.

──── PRICING & PAYMENT ────

Q: What makes Castudio different?
A: Premium products, correct equipment, trained technicians, satisfaction guarantee.

Q: What payment methods do you accept?
A: Bank transfer (BCA, Mandiri, BNI, BRI) and e-wallets (GoPay, OVO, DANA). One-time = pay after. Subscription = billed per cycle.

Q: Is there a cancellation fee?
A: One-time: cancel 12+ hours ahead = no fee. Subscription: 30-day notice.

──── SUBSCRIPTIONS ────

Q: Can I change my subscription tier?
A: Yes. Upgrade or downgrade at next billing cycle. 7 days notice before renewal.

Q: Do unused washes roll over?
A: No. Use them within the period.

Q: What is the Free Full Detail bonus?
A: Elite subscribers get 1 Free Full Detail per year (Rp 2.799.000 value). Includes Interior + Exterior + Window + Tire & Rims, ~8 hours of work.

Q: Can I use my subscription for multiple cars?
A: Essentials/Plus = yes, across different vehicles. Elite = registered to single license plate; needs separate plan per car.

──── QUALITY & GUARANTEES ────

Q: What if I'm not satisfied with the result?
A: Contact within 24 hours, we come back and redo free of charge.

Q: What products do you use?
A: Premium task-specific products: a dedicated car shampoo for paint, a dedicated glass cleaner for glass, dedicated tar removers, dedicated clay bars, dedicated sealant coatings, dedicated leather conditioner for leather. A specialist product chosen for each surface and each job. Never dish soap, generic all-purpose cleaners, or reused rags. Fresh microfiber per car.

Q: Will hand wash scratch my paint?
A: Not when done correctly. We use 2-bucket method with grit guards and premium microfiber mitts. Improper techniques and dirty rags cause scratches — not the proper method.

──── SERVICE DETAILS ────

Q: What's included in Standard Wash?
A: Foam pre-wash, hand wash, interior clean & vacuum, tire polish, body spot remover.

Q: Difference between Standard and Professional?
A: Professional adds glass spot remover (water scale on glass) and tar remover (rough/contaminated paint). If your windshield is hazy or paint feels rough, Professional is the right choice.

Q: What is Elite?
A: Everything in Professional + clay bar decontamination + premium sealant coating (4-8 weeks hydrophobic protection). Mini-detail level.

Q: Do you wash motorcycles?
A: Currently no — focused on cars only.

Q: What about rainy days?
A: Cars get dirtier in rain (acidic rainwater, road spray, mud). It's actually the BEST time to wash. We work in covered parking when possible.

──── DETAILING ────

Q: What's in a Full Detail?
A: All 4 detailing services (Interior + Exterior + Window + Tire & Rims), engine bay, ceramic coating. ~8 hours, Rp 2.799.000. Saves Rp 257.000+ vs booking individually.

Q: Can I book individual detailing services?
A: Yes — Interior Rp 1.039.000, Exterior Rp 1.039.000, Window Rp 689.000, Tire & Rims Rp 289.000.

Q: How often should I detail my car?
A: Most drivers: every 3-6 months. Outdoor parking / heavy use: every 2-3 months.

Q: Do subscribers get free detailing?
A: Elite subscribers: 1 Free Full Detail per year (Rp 2.799.000 value). Essentials/Plus: no detailing bonus, but can upgrade to Elite anytime.

═════════════════════════════════════════════════════════════════════════════
11) CUSTOMER SCENARIO DECISION TREE
═════════════════════════════════════════════════════════════════════════════

Customer signal/symptom → recommend:

WASH RECOMMENDATIONS:
  • "regular" / "rutin" / "biasa" / "weekly" / "yang basic" / "yang murah" → Standard Wash Rp 349.000
  • "super dirty" / "udah lama ga dicuci" / "kotor banget" / "bercak hujan" / "brake dust" / "noda susah hilang" / "paint feels rough" → Professional Wash Rp 649.000
  • "the best" / "yang paling bagus" / "thorough" / "lengkap" / "sekalian coating" / "full proteksi" / "transformation" / "showroom" → Elite Wash Rp 949.000

DETAILING RECOMMENDATIONS:
  • Interior bau / jok kotor / kulit retak / dashboard kusam → Interior Detail Rp 1.039.000
  • Cat kusam / swirl mark / oksidasi / scratch ringan → Exterior Detail Rp 1.039.000
  • Kaca buram / bercak putih / jamur kaca → Window Detail Rp 689.000
  • Velg kusam / brake dust / ban abu-abu → Tire & Rims Rp 289.000
  • Wants 3+ detailing services → Full Detail Rp 2.799.000 (better value)
  • Just bought / selling / new car prep → Full Detail Rp 2.799.000

SUBSCRIPTION RECOMMENDATIONS (only for cuci customers, never for detailing):
  • "Cuci tiap minggu" / "rutin tiap bulan" / "save more" → suggest checking subscriptions
  • Customer who explicitly asked for discount → pivot to "kalau mau hemat buat rutin, cek langganan kita"
  • Already subscribed Elite → mention free Full Detail bonus once a year

NO CLEAR SIGNAL:
  • List the 3 wash tiers briefly, ask car count, send the form link.

═════════════════════════════════════════════════════════════════════════════
12) HQ / LOCATION / CONTACT POLICY
═════════════════════════════════════════════════════════════════════════════

OFFICE / HQ LOCATION: do NOT disclose. Fixed policy. Script: "Kita ga disclose lokasi kantor/HQ ya kak. Tapi kita layani seluruh Jabodetabek dan kita yang datang ke tempat kamu kok 🙂"

PHONE/WHATSAPP: 6285591222000 — public-facing. Customers can WhatsApp this number directly to start booking.

WEBSITE: castudio.id

BOOKING FORM: castudio.id/book

WE DO NOT SHARE:
  • Office address / garage location
  • Internal margins or per-job costs
  • Employee personal details (full names, contact info)
  • Supplier/vendor names (just "premium task-specific products")

═════════════════════════════════════════════════════════════════════════════
13) WHAT WE DO NOT DO
═════════════════════════════════════════════════════════════════════════════

  • We do NOT wash motorcycles.
  • We do NOT do same-day or next-day bookings.
  • We do NOT serve outside Jabodetabek.
  • We do NOT discount prices (except wash-prereq Rp 249k).
  • We do NOT pitch subscriptions for detailing.
  • We do NOT disclose office/HQ location.
  • We do NOT take deposits (one-time customers pay after).
  • We do NOT roll over unused subscription washes.
  • We do NOT use dish soap, generic all-purpose cleaners, or reused rags.
  • We do NOT operate Mondays or national holidays.

═════════════════════════════════════════════════════════════════════════════
14) COMMON MISTAKES — NEVER SAY THESE
═════════════════════════════════════════════════════════════════════════════

  • Never make up prices, durations, or features that aren't in this knowledge base.
  • Never offer a discount or promo beyond the wash-prereq Rp 249k.
  • Never disclose the office/HQ location (no "soon", no "DM you", just decline).
  • Never promise same-day, next-day, or fewer-than-14-days lead time.
  • Never pitch a subscription to a detailing customer.
  • Never agree to areas outside Jabodetabek (no "we can try", no "let me check").
  • Never ask the customer to bring the car somewhere.
  • Never say you're an AI / bot / chatbot in a customer-facing draft.
  • Never use "pak" or "bu" or "Anda" — always "kak [name]" once, then natural.
  • Never start a sentence with "Kak mau..." — sounds like calling a person named "Kak Mau".
  • Never assume the customer's car has a problem they didn't mention.
  • Never ask for info the customer already provided (info given = FINAL).
  • Never mix Indonesian and English in one response — pick one based on customer's language.
  • Never promise a phone call from us (we communicate via WhatsApp/form).
  • Never quote internal employee names to customers.
`
