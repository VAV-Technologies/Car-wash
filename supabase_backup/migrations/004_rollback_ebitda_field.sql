-- Rollback Migration: 004_rollback_ebitda_field.sql
-- Remove EBITDA field from listings table (if needed)
-- ONLY RUN THIS IF YOU NEED TO ROLLBACK THE EBITDA FEATURE

-- Start transaction
BEGIN;

-- Check if column exists before dropping
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'listings' 
        AND column_name = 'ebitda'
    ) THEN
        -- First, backup any existing EBITDA data (optional)
        -- CREATE TABLE IF NOT EXISTS listings_ebitda_backup AS 
        -- SELECT id, ebitda FROM listings WHERE ebitda IS NOT NULL;
        
        ALTER TABLE listings 
        DROP COLUMN ebitda;
        
        RAISE NOTICE 'Column ebitda removed from listings table';
    ELSE
        RAISE NOTICE 'Column ebitda does not exist in listings table - nothing to rollback';
    END IF;
END $$;

-- Commit transaction
COMMIT;