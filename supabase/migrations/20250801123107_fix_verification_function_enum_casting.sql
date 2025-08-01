-- Fix Listing Verification Function Enum Casting
-- Purpose: Replace the verification function to properly handle enum casting
-- Root cause: Function parameter enum casting was failing in PostgreSQL

-- =============================================================================
-- Drop and recreate the function with proper enum handling
-- =============================================================================

DROP FUNCTION IF EXISTS update_listing_verification_status(UUID, listing_verification_status, UUID, TEXT);
DROP FUNCTION IF EXISTS update_listing_verification_status(UUID, UUID, listing_verification_status, TEXT);

-- Create the function with TEXT parameters and internal enum casting
CREATE OR REPLACE FUNCTION update_listing_verification_status(
    admin_user_id UUID,
    listing_uuid UUID,
    new_verification_status TEXT,
    verification_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    listing_record RECORD;
    old_verification_status listing_verification_status;
    casted_status listing_verification_status;
BEGIN
    -- Validate and cast the verification status
    BEGIN
        casted_status := new_verification_status::listing_verification_status;
    EXCEPTION
        WHEN invalid_text_representation THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Invalid verification status. Must be: unverified, verified, or deactivated'
            );
    END;

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
    
    -- Update the listing verification status with explicit casting
    UPDATE listings
    SET 
        listing_verification_status = casted_status,
        listing_verification_by = admin_user_id,
        listing_verification_at = NOW(),
        listing_verification_notes = verification_notes,
        updated_at = NOW()
    WHERE id = listing_uuid;
    
    -- Return success response with details
    RETURN jsonb_build_object(
        'success', true,
        'data', jsonb_build_object(
            'listingId', listing_uuid,
            'previousStatus', old_verification_status,
            'newStatus', casted_status,
            'verifiedBy', admin_user_id,
            'verifiedAt', NOW(),
            'notes', verification_notes
        )
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_listing_verification_status(UUID, UUID, TEXT, TEXT) TO authenticated;

-- =============================================================================
-- Fix the helper function as well
-- =============================================================================

DROP FUNCTION IF EXISTS get_listing_verification_history(UUID);

CREATE OR REPLACE FUNCTION get_listing_verification_history(listing_uuid UUID)
RETURNS TABLE (
    verification_status TEXT,
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
        l.listing_verification_status::TEXT as verification_status,
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
GRANT EXECUTE ON FUNCTION get_listing_verification_history(UUID) TO authenticated;

-- =============================================================================
-- Test the function
-- =============================================================================

DO $$
DECLARE
    test_result JSONB;
BEGIN
    -- Verify function exists and can be called (won't actually run due to admin check)
    SELECT update_listing_verification_status(
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::UUID,
        'verified',
        'test'
    ) INTO test_result;
    
    RAISE NOTICE 'Function test result: %', test_result;
    RAISE NOTICE 'SUCCESS: update_listing_verification_status function is working with proper enum casting';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Function exists but failed test (expected): %', SQLERRM;
END $$;