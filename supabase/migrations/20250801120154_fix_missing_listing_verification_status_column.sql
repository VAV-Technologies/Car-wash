-- Fix Missing Listing Verification Status Column
-- Purpose: Safely add missing listing_verification_status column and related fields
-- This migration is idempotent and safe to run on production

-- =============================================================================
-- PHASE 1: Create Enum Type (if not exists)
-- =============================================================================

DO $$ 
BEGIN
    -- Check if enum already exists to make migration idempotent
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_verification_status') THEN
        CREATE TYPE listing_verification_status AS ENUM (
            'unverified',    -- Default state - listing not yet verified
            'verified',      -- Admin has verified this listing content
            'deactivated'    -- Admin has deactivated this listing verification
        );
        
        RAISE NOTICE 'Created enum: listing_verification_status';
    ELSE
        RAISE NOTICE 'Enum listing_verification_status already exists - skipping creation';
    END IF;
END $$;

-- =============================================================================
-- PHASE 2: Add Missing Columns (if not exist)
-- =============================================================================

DO $$
BEGIN
    -- Add listing_verification_status column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'listings' 
        AND column_name = 'listing_verification_status'
    ) THEN
        ALTER TABLE listings 
        ADD COLUMN listing_verification_status listing_verification_status DEFAULT 'unverified';
        
        RAISE NOTICE 'Added column: listing_verification_status to listings table';
    ELSE
        RAISE NOTICE 'Column listing_verification_status already exists - skipping';
    END IF;

    -- Add listing_verification_by column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'listings' 
        AND column_name = 'listing_verification_by'
    ) THEN
        ALTER TABLE listings ADD COLUMN listing_verification_by UUID REFERENCES user_profiles(id);
        RAISE NOTICE 'Added column: listing_verification_by to listings table';
    ELSE
        RAISE NOTICE 'Column listing_verification_by already exists - skipping';
    END IF;

    -- Add listing_verification_at column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'listings' 
        AND column_name = 'listing_verification_at'
    ) THEN
        ALTER TABLE listings ADD COLUMN listing_verification_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added column: listing_verification_at to listings table';
    ELSE
        RAISE NOTICE 'Column listing_verification_at already exists - skipping';
    END IF;

    -- Add listing_verification_notes column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'listings' 
        AND column_name = 'listing_verification_notes'
    ) THEN
        ALTER TABLE listings ADD COLUMN listing_verification_notes TEXT;
        RAISE NOTICE 'Added column: listing_verification_notes to listings table';
    ELSE
        RAISE NOTICE 'Column listing_verification_notes already exists - skipping';
    END IF;
END $$;

-- =============================================================================
-- PHASE 3: Add Indexes (if not exist)
-- =============================================================================

-- Add index for verification status queries
CREATE INDEX IF NOT EXISTS idx_listings_verification_status 
ON listings(listing_verification_status);

-- Add index for verification tracking
CREATE INDEX IF NOT EXISTS idx_listings_verification_by 
ON listings(listing_verification_by);

CREATE INDEX IF NOT EXISTS idx_listings_verification_at 
ON listings(listing_verification_at DESC);

-- Composite index for admin filtering
CREATE INDEX IF NOT EXISTS idx_listings_status_verification 
ON listings(status, listing_verification_status) 
WHERE deleted_at IS NULL;

-- =============================================================================
-- PHASE 4: Set Default Values for Existing Records
-- =============================================================================

DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Only update records where the verification status is NULL (safe)
    UPDATE listings 
    SET listing_verification_status = CASE
        -- If listing is already verified by admin, mark as verified
        WHEN status IN ('verified_anonymous', 'verified_public') THEN 'verified'::listing_verification_status
        -- If listing is inactive or rejected, mark as deactivated  
        WHEN status IN ('inactive', 'rejected_by_admin') THEN 'deactivated'::listing_verification_status
        -- For all other cases, mark as unverified (safe default)
        ELSE 'unverified'::listing_verification_status
    END
    WHERE listing_verification_status IS NULL;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RAISE NOTICE 'Updated % existing listings with default verification status', updated_count;
END $$;

-- =============================================================================
-- VALIDATION
-- =============================================================================

DO $$
DECLARE
    missing_columns INTEGER;
BEGIN
    SELECT COUNT(*) INTO missing_columns
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'listings' 
    AND column_name IN ('listing_verification_status', 'listing_verification_by', 'listing_verification_at', 'listing_verification_notes');
    
    IF missing_columns = 4 THEN
        RAISE NOTICE 'SUCCESS: All 4 listing verification columns are now present';
    ELSE
        RAISE NOTICE 'WARNING: Only % out of 4 verification columns found', missing_columns;
    END IF;
END $$;