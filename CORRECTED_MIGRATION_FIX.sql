-- Corrected Migration Fix Script
-- Run this in Supabase Dashboard > SQL Editor
-- This version uses only basic columns that exist in all Supabase installations

-- =============================================================================
-- PHASE 0: Investigate Current State
-- =============================================================================

-- Check what columns exist in the migration table
SELECT 
    'MIGRATION TABLE STRUCTURE:' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'supabase_migrations' 
AND table_name = 'schema_migrations'
ORDER BY ordinal_position;

-- Check current migration state
SELECT 'CURRENT MIGRATIONS:' as info, version, name 
FROM supabase_migrations.schema_migrations 
WHERE version IN ('20250616', '20250619', '20250725170826')
ORDER BY version;

-- =============================================================================
-- PHASE 1: Fix Migration 20250616 Tracking
-- =============================================================================

-- Fix 20250616 tracking (admin_listing_management_system)
-- Using only basic columns to avoid schema issues
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('20250616', 'admin_listing_management_system')
ON CONFLICT (version) DO NOTHING;

-- =============================================================================
-- PHASE 2: Fix Migration 20250619 Tracking  
-- =============================================================================

-- Fix 20250619 tracking (inquiry_status_automation)
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('20250619', '000000_inquiry_status_automation')
ON CONFLICT (version) DO NOTHING;

-- =============================================================================
-- PHASE 3: Add EBITDA Column
-- =============================================================================

-- Check if EBITDA column already exists
SELECT 'EBITDA CHECK:' as info, 
       CASE WHEN COUNT(*) > 0 THEN 'EXISTS' ELSE 'MISSING' END as status
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

-- =============================================================================
-- PHASE 4: Add EBITDA Migration Tracking
-- =============================================================================

-- Add tracking for EBITDA migration
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('20250725170826', 'add_ebitda_field_safe')
ON CONFLICT (version) DO NOTHING;

-- =============================================================================
-- PHASE 5: Final Verification
-- =============================================================================

-- Show all relevant migration tracking records
SELECT 'FINAL STATE:' as info, version, name 
FROM supabase_migrations.schema_migrations 
WHERE version IN ('20250616', '20250619', '20250725170826')
ORDER BY version;

-- Verify EBITDA column exists
SELECT 'EBITDA FINAL CHECK:' as info, 
       column_name, 
       data_type, 
       is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'listings' 
AND column_name = 'ebitda';

-- Test EBITDA column functionality with a safe query
SELECT 'EBITDA TEST:' as info, 
       COUNT(*) as total_listings,
       COUNT(ebitda) as listings_with_ebitda,
       AVG(ebitda) as avg_ebitda
FROM listings;

-- Final success message
SELECT 'SUCCESS:' as info, 
       'All migration fixes completed successfully' as message;