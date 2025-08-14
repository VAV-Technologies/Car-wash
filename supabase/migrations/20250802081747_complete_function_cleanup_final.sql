-- Complete Function Cleanup - Final Fix
-- Purpose: Drop all duplicate functions and create single definitive versions
-- Fixes: Function overloading conflicts and return type mismatches

-- =============================================================================
-- Phase 1: Drop ALL existing function versions
-- =============================================================================

-- Drop all versions of update_listing_verification_status
-- Version 1: Original with enum parameter
DROP FUNCTION IF EXISTS update_listing_verification_status(
    listing_uuid UUID,
    new_verification_status listing_verification_status,
    admin_user_id UUID,
    verification_notes TEXT
);

-- Version 2: With TEXT parameter
DROP FUNCTION IF EXISTS update_listing_verification_status(
    admin_user_id UUID,
    listing_uuid UUID,
    new_verification_status TEXT,
    verification_notes TEXT
);

-- Drop existing history function (has return type mismatch)
DROP FUNCTION IF EXISTS get_listing_verification_history(listing_uuid UUID);

-- =============================================================================
-- Phase 2: Create single definitive functions with correct signatures
-- =============================================================================

-- Create update function with parameter order matching our API calls
CREATE OR REPLACE FUNCTION update_listing_verification_status(
    admin_user_id UUID,
    listing_uuid UUID,
    new_verification_status TEXT,
    verification_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_profile user_profiles%ROWTYPE;
    listing_record listings%ROWTYPE;
    verification_status_enum listing_verification_status;
BEGIN
    -- Validate admin user exists and has admin role
    SELECT * INTO admin_profile
    FROM user_profiles
    WHERE id = admin_user_id AND role = 'admin';
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Unauthorized: Admin role required'
        );
    END IF;

    -- Validate listing exists
    SELECT * INTO listing_record
    FROM listings
    WHERE id = listing_uuid;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Listing not found'
        );
    END IF;

    -- Cast text to enum (this handles the type conversion)
    verification_status_enum := new_verification_status::listing_verification_status;

    -- Update listing verification status
    UPDATE listings
    SET 
        listing_verification_status = verification_status_enum,
        listing_verification_by = admin_user_id,
        listing_verification_at = NOW(),
        listing_verification_notes = verification_notes
    WHERE id = listing_uuid;

    -- Return success
    RETURN jsonb_build_object(
        'success', true,
        'listing_id', listing_uuid,
        'verification_status', verification_status_enum,
        'verified_by', admin_profile.full_name,
        'verified_at', NOW()
    );

EXCEPTION
    WHEN invalid_text_representation THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid verification status: ' || new_verification_status
        );
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Database error: ' || SQLERRM
        );
END;
$$;

-- Create history function with correct return types matching actual schema
CREATE OR REPLACE FUNCTION get_listing_verification_history(listing_uuid UUID)
RETURNS TABLE (
    verification_id UUID,
    admin_name VARCHAR(255),  -- Changed from TEXT to VARCHAR(255) to match user_profiles.full_name
    verification_status listing_verification_status,
    verification_notes TEXT,
    verified_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.listing_verification_by as verification_id,
        up.full_name as admin_name,
        l.listing_verification_status as verification_status,
        l.listing_verification_notes as verification_notes,
        l.listing_verification_at as verified_at
    FROM listings l
    LEFT JOIN user_profiles up ON l.listing_verification_by = up.id
    WHERE l.id = listing_uuid
    AND l.listing_verification_status IS NOT NULL
    ORDER BY l.listing_verification_at DESC;
END;
$$;

-- =============================================================================
-- Phase 3: Grant necessary permissions
-- =============================================================================

-- Grant execute permissions to authenticated users (PostgREST will handle RLS)
GRANT EXECUTE ON FUNCTION update_listing_verification_status(UUID, UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_listing_verification_history(UUID) TO authenticated;