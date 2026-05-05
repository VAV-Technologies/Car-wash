-- Coarse area selected by the customer in the public booking form.
-- Distinct from `neighborhood` (granular Jakarta-Selatan sub-area enum used
-- by the washer auto-assign cluster algorithm in src/lib/admin/bookings.ts).
-- Values come from AREAS in src/lib/booking-form-constants.ts (Jabodetabek
-- regions: "Jakarta Selatan", "Bogor", "Depok", etc.).
ALTER TABLE customers ADD COLUMN IF NOT EXISTS area TEXT NULL;
