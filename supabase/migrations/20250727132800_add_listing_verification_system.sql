-- Add Listing Verification System Migration
-- Purpose: Add granular listing verification independent of seller verification
-- Addresses: Admin should be able to verify individual listings separately from seller verification
-- Date: 2025-07-27

-- =============================================================================
-- PHASE 1: Create Listing Verification Status Enum
-- =============================================================================

-- Create enum for listing verification status
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
-- PHASE 2: Add Column to Listings Table
-- =============================================================================

-- Add the new column (nullable during migration for safety)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'listings' 
        AND column_name = 'listing_verification_status'
    ) THEN
        -- Add column as nullable first
        ALTER TABLE listings 
        ADD COLUMN listing_verification_status listing_verification_status;
        
        RAISE NOTICE 'Added column: listing_verification_status to listings table';
    ELSE
        RAISE NOTICE 'Column listing_verification_status already exists - skipping';
    END IF;
END $$;

-- =============================================================================
-- PHASE 3: Data Migration - Set Intelligent Defaults
-- =============================================================================

-- Update existing listings with appropriate default values based on current state
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Only update records where the new column is NULL (safe for re-running)
    UPDATE listings 
    SET listing_verification_status = CASE
        -- If listing is verified by admin or has verified status, mark as verified
        WHEN status IN ('verified_anonymous', 'verified_public') THEN 'verified'::listing_verification_status
        -- If listing is inactive (what user calls "deactivated"), mark as deactivated  
        WHEN status = 'inactive' THEN 'deactivated'::listing_verification_status
        -- If listing was rejected by admin, mark as deactivated
        WHEN status = 'rejected_by_admin' THEN 'deactivated'::listing_verification_status
        -- For all other cases (active, pending, draft, etc.), mark as unverified
        ELSE 'unverified'::listing_verification_status
    END
    WHERE listing_verification_status IS NULL;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RAISE NOTICE 'Updated % listings with default verification status', updated_count;
END $$;

-- =============================================================================
-- PHASE 4: Add Constraints and Indexes
-- =============================================================================

-- Add index for admin queries on verification status
CREATE INDEX IF NOT EXISTS idx_listings_verification_status 
ON listings(listing_verification_status);

-- Composite index for admin filtering (status + verification)
CREATE INDEX IF NOT EXISTS idx_listings_status_verification 
ON listings(status, listing_verification_status) 
WHERE deleted_at IS NULL;

-- Add admin tracking fields for listing verification actions
DO $$
BEGIN
    -- Add columns for tracking listing verification actions (if not exists)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'listings' 
        AND column_name = 'listing_verification_by'
    ) THEN
        ALTER TABLE listings ADD COLUMN listing_verification_by UUID REFERENCES user_profiles(id);
        ALTER TABLE listings ADD COLUMN listing_verification_at TIMESTAMP WITH TIME ZONE;
        ALTER TABLE listings ADD COLUMN listing_verification_notes TEXT;
        
        RAISE NOTICE 'Added listing verification tracking columns';
    ELSE
        RAISE NOTICE 'Listing verification tracking columns already exist';
    END IF;
END $$;

-- Add indexes for verification tracking
CREATE INDEX IF NOT EXISTS idx_listings_verification_by 
ON listings(listing_verification_by);

CREATE INDEX IF NOT EXISTS idx_listings_verification_at 
ON listings(listing_verification_at DESC);

-- =============================================================================
-- PHASE 5: Create Helper Functions
-- =============================================================================

-- Function to update listing verification status (for API use)
CREATE OR REPLACE FUNCTION update_listing_verification_status(
    listing_uuid UUID,
    new_verification_status listing_verification_status,
    admin_user_id UUID,
    admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    listing_record RECORD;
    old_verification_status listing_verification_status;
BEGIN
    -- Check if admin user exists and has admin role
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = admin_user_id AND role = 'admin'
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unauthorized: Admin role required'
        );
    END IF;
    
    -- Get current listing and verification status
    SELECT * INTO listing_record 
    FROM listings 
    WHERE id = listing_uuid AND deleted_at IS NULL;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Listing not found'
        );
    END IF;
    
    old_verification_status := listing_record.listing_verification_status;
    
    -- Update the listing verification status
    UPDATE listings
    SET 
        listing_verification_status = new_verification_status,
        listing_verification_by = admin_user_id,
        listing_verification_at = NOW(),
        listing_verification_notes = admin_notes,
        updated_at = NOW()
    WHERE id = listing_uuid;
    
    -- Return success response with details
    RETURN jsonb_build_object(
        'success', true,
        'data', jsonb_build_object(
            'listingId', listing_uuid,
            'previousStatus', old_verification_status,
            'newStatus', new_verification_status,
            'verifiedBy', admin_user_id,
            'verifiedAt', NOW(),
            'notes', admin_notes
        )
    );
END;
$$;

-- Grant execute permission to authenticated users (API will check admin role)
GRANT EXECUTE ON FUNCTION update_listing_verification_status TO authenticated;

-- Function to get listing verification history
CREATE OR REPLACE FUNCTION get_listing_verification_history(listing_uuid UUID)
RETURNS TABLE (
    verification_status listing_verification_status,
    verified_by_name TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.listing_verification_status,
        up.full_name as verified_by_name,
        l.listing_verification_at,
        l.listing_verification_notes
    FROM listings l
    LEFT JOIN user_profiles up ON l.listing_verification_by = up.id
    WHERE l.id = listing_uuid
    AND l.deleted_at IS NULL;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_listing_verification_history TO authenticated;

-- =============================================================================
-- PHASE 6: Update Audit Trail System
-- =============================================================================

-- Extend the existing admin_listing_actions table to track verification actions
DO $$
BEGIN
    -- Add new action types for listing verification
    ALTER TABLE admin_listing_actions DROP CONSTRAINT IF EXISTS admin_listing_actions_action_type_check;
    
    ALTER TABLE admin_listing_actions ADD CONSTRAINT admin_listing_actions_action_type_check
    CHECK (action_type IN (
        'approved',
        'rejected', 
        'status_changed',
        'appeal_reviewed',
        'notes_updated',
        'bulk_action',
        -- New verification action types
        'listing_verified',
        'listing_unverified', 
        'listing_verification_deactivated'
    ));
    
    RAISE NOTICE 'Extended admin_listing_actions to include verification actions';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not extend admin_listing_actions constraint - table may not exist yet';
END $$;

-- Create trigger to automatically log listing verification changes
CREATE OR REPLACE FUNCTION log_listing_verification_action()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if verification status actually changed and it's an admin action
    IF OLD.listing_verification_status IS DISTINCT FROM NEW.listing_verification_status 
       AND NEW.listing_verification_by IS NOT NULL THEN
        
        INSERT INTO admin_listing_actions (
            listing_id,
            admin_user_id,
            action_type,
            previous_status,
            new_status,
            admin_notes
        ) VALUES (
            NEW.id,
            NEW.listing_verification_by,
            CASE NEW.listing_verification_status
                WHEN 'verified' THEN 'listing_verified'
                WHEN 'unverified' THEN 'listing_unverified'
                WHEN 'deactivated' THEN 'listing_verification_deactivated'
            END,
            OLD.listing_verification_status::VARCHAR,
            NEW.listing_verification_status::VARCHAR,
            NEW.listing_verification_notes
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic verification audit logging
DROP TRIGGER IF EXISTS trigger_log_listing_verification_action ON listings;
CREATE TRIGGER trigger_log_listing_verification_action
    AFTER UPDATE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION log_listing_verification_action();

-- =============================================================================
-- PHASE 7: Add Helpful Comments and Documentation
-- =============================================================================

COMMENT ON COLUMN listings.listing_verification_status IS 
'Independent listing verification status managed by admins. Separate from seller verification and marketplace visibility status.';

COMMENT ON COLUMN listings.listing_verification_by IS 
'Admin user who last updated the listing verification status';

COMMENT ON COLUMN listings.listing_verification_at IS 
'Timestamp when listing verification status was last updated';

COMMENT ON COLUMN listings.listing_verification_notes IS 
'Admin notes about the listing verification decision';

COMMENT ON FUNCTION update_listing_verification_status IS
'Updates listing verification status with proper admin authorization and audit trail';

COMMENT ON FUNCTION get_listing_verification_history IS
'Retrieves listing verification history for admin dashboard display';

-- =============================================================================
-- PHASE 8: Validation and Summary
-- =============================================================================

-- Create validation function to verify migration success
CREATE OR REPLACE FUNCTION validate_listing_verification_migration()
RETURNS TABLE (
    total_listings BIGINT,
    verified_listings BIGINT,
    unverified_listings BIGINT,
    deactivated_listings BIGINT,
    migration_complete BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_listings,
        COUNT(*) FILTER (WHERE listing_verification_status = 'verified') as verified_listings,
        COUNT(*) FILTER (WHERE listing_verification_status = 'unverified') as unverified_listings,
        COUNT(*) FILTER (WHERE listing_verification_status = 'deactivated') as deactivated_listings,
        COUNT(*) FILTER (WHERE listing_verification_status IS NULL) = 0 as migration_complete
    FROM listings 
    WHERE deleted_at IS NULL;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION validate_listing_verification_migration TO authenticated;

-- =============================================================================
-- MIGRATION COMPLETION LOG
-- =============================================================================

DO $$
DECLARE
    validation_result RECORD;
BEGIN
    -- Run validation
    SELECT * INTO validation_result FROM validate_listing_verification_migration();
    
    RAISE NOTICE '';
    RAISE NOTICE '=== LISTING VERIFICATION SYSTEM MIGRATION COMPLETE ===';
    RAISE NOTICE 'Total listings: %', validation_result.total_listings;
    RAISE NOTICE 'Verified listings: %', validation_result.verified_listings;
    RAISE NOTICE 'Unverified listings: %', validation_result.unverified_listings;
    RAISE NOTICE 'Deactivated listings: %', validation_result.deactivated_listings;
    RAISE NOTICE 'Migration complete: %', validation_result.migration_complete;
    RAISE NOTICE '';
    RAISE NOTICE 'New Features Available:';
    RAISE NOTICE '- Granular listing verification independent of seller verification';
    RAISE NOTICE '- Admin verification tracking and audit trail';
    RAISE NOTICE '- API functions for verification management';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '- Update admin UI to use new verification system';
    RAISE NOTICE '- Test API endpoints for verification management';
    RAISE NOTICE '- Update listing display logic for verification badges';
    RAISE NOTICE '========================================================';
END $$;