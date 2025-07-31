-- Fix ambiguous parameter reference in update_listing_verification_status function
-- Issue: "admin_notes" parameter conflicts with "admin_notes" column name in listings table
-- Solution: Rename the function parameter to avoid ambiguity

DROP FUNCTION IF EXISTS update_listing_verification_status(UUID, TEXT, UUID, TEXT);

CREATE OR REPLACE FUNCTION update_listing_verification_status(
    listing_uuid UUID,
    new_verification_status TEXT,
    admin_user_id UUID,
    verification_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    listing_record RECORD;
    old_verification_status TEXT;
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
        listing_verification_notes = verification_notes,
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
            'notes', verification_notes
        )
    );
END;
$function$;

-- Grant execute permission to authenticated users (API will check admin role)
GRANT EXECUTE ON FUNCTION update_listing_verification_status TO authenticated;

-- Add comment
COMMENT ON FUNCTION update_listing_verification_status IS 'Updates listing verification status with proper admin authorization and audit trail. Fixed parameter ambiguity by renaming admin_notes parameter to verification_notes.';