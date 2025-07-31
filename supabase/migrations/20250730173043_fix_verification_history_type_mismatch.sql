-- Fix type mismatch in get_listing_verification_history function
-- The function was expecting TEXT but user_profiles.full_name is VARCHAR(255)

-- Drop existing function
DROP FUNCTION IF EXISTS get_listing_verification_history(UUID);

-- Recreate with proper type casting
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
        l.listing_verification_status::TEXT,
        up.full_name::TEXT as verified_by_name,  -- Explicit cast to TEXT
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

-- Add comment
COMMENT ON FUNCTION get_listing_verification_history IS
'Retrieves listing verification history for admin dashboard display - fixed type mismatch';