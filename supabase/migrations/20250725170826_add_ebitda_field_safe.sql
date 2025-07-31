-- Migration: Add EBITDA field to listings table
-- This migration is idempotent and safe to run multiple times

-- Start transaction to ensure atomicity
BEGIN;

-- Check if column already exists before adding
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

-- Commit transaction
COMMIT;