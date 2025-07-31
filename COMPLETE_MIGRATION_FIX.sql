-- Complete Migration Fix Script
-- Run this in Supabase Dashboard > SQL Editor
-- This script fixes all migration tracking issues and adds EBITDA

-- =============================================================================
-- PHASE 1: Fix Migration 20250616 Tracking
-- =============================================================================

-- Check current state of 20250616
SELECT 'BEFORE 20250616 FIX:' as status, version, name, executed_at 
FROM supabase_migrations.schema_migrations 
WHERE version = '20250616';

-- Fix 20250616 tracking (admin_listing_management_system)
INSERT INTO supabase_migrations.schema_migrations (version, name, statements, executed_at)
VALUES (
  '20250616',
  'admin_listing_management_system',
  NULL,
  NOW()
)
ON CONFLICT (version) DO NOTHING;

-- Verify 20250616 fix
SELECT 'AFTER 20250616 FIX:' as status, version, name, executed_at 
FROM supabase_migrations.schema_migrations 
WHERE version = '20250616';

-- =============================================================================
-- PHASE 2: Fix Migration 20250619 Tracking
-- =============================================================================

-- Check current state of 20250619
SELECT 'BEFORE 20250619 FIX:' as status, version, name, executed_at 
FROM supabase_migrations.schema_migrations 
WHERE version = '20250619';

-- Fix 20250619 tracking (inquiry_status_automation)
INSERT INTO supabase_migrations.schema_migrations (version, name, statements, executed_at)
VALUES (
  '20250619',
  '000000_inquiry_status_automation',
  NULL,
  NOW()
)
ON CONFLICT (version) DO NOTHING;

-- Verify 20250619 fix
SELECT 'AFTER 20250619 FIX:' as status, version, name, executed_at 
FROM supabase_migrations.schema_migrations 
WHERE version = '20250619';

-- =============================================================================
-- PHASE 3: Add EBITDA Column
-- =============================================================================

-- Check if EBITDA column already exists
SELECT 'EBITDA COLUMN CHECK:' as status, column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'listings' 
AND column_name = 'ebitda';

-- Add EBITDA column (idempotent operation)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'listings' 
        AND column_name = 'ebitda'
    ) THEN
        ALTER TABLE listings 
        ADD COLUMN ebitda DECIMAL(15,2);
        
        -- Add comment for documentation
        COMMENT ON COLUMN listings.ebitda IS 'Earnings Before Interest, Taxes, Depreciation, and Amortization (EBITDA) in USD';
        
        RAISE NOTICE 'Column ebitda added successfully to listings table';
    ELSE
        RAISE NOTICE 'Column ebitda already exists in listings table - skipping';
    END IF;
END $$;

-- Verify EBITDA column was added
SELECT 'EBITDA COLUMN AFTER:' as status, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'listings' 
AND column_name = 'ebitda';

-- =============================================================================
-- PHASE 4: Add EBITDA Migration Tracking
-- =============================================================================

-- Add tracking for EBITDA migration
INSERT INTO supabase_migrations.schema_migrations (version, name, statements, executed_at)
VALUES (
  '20250725170826',
  'add_ebitda_field_safe',
  NULL,
  NOW()
)
ON CONFLICT (version) DO NOTHING;

-- =============================================================================
-- PHASE 5: Final Verification
-- =============================================================================

-- Show all relevant migration tracking records
SELECT 'FINAL MIGRATION STATE:' as status, version, name, executed_at 
FROM supabase_migrations.schema_migrations 
WHERE version IN ('20250616', '20250619', '20250725170826')
ORDER BY version;

-- Test EBITDA column functionality
SELECT 'EBITDA TEST:' as status, id, listing_title_anonymous, ebitda
FROM listings 
LIMIT 3;

-- Show summary
SELECT 'COMPLETION STATUS:' as status, 
       'All migration tracking issues resolved and EBITDA column added' as message;