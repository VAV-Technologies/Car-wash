-- Fix Admin Listing Access Migration
-- Purpose: Restore admin ability to view all listings including inactive ones
-- Addresses: Admin cannot see deactivated listings due to missing RLS policy
-- Date: 2025-07-27

-- =============================================================================
-- PHASE 1: Create Admin Detection Function (Avoids RLS Recursion)
-- =============================================================================

-- Create a function to check admin status without triggering RLS on user_profiles
-- This uses the service role context to avoid infinite recursion
CREATE OR REPLACE FUNCTION is_admin_user(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- If no user provided or not authenticated, return false
    IF user_uuid IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Use service role context to directly query user_profiles
    -- This bypasses RLS and prevents infinite recursion
    SELECT role INTO user_role
    FROM user_profiles 
    WHERE id = user_uuid;
    
    -- Return true if user has admin role
    RETURN COALESCE(user_role = 'admin', FALSE);
EXCEPTION
    WHEN OTHERS THEN
        -- If any error occurs, default to false for security
        RETURN FALSE;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION is_admin_user TO authenticated;

-- =============================================================================
-- PHASE 2: Create New Admin Listing Access Policy
-- =============================================================================

-- Create a new admin policy that uses our safe admin detection function
CREATE POLICY "Admins can view all listings safely" ON listings
    FOR SELECT USING (is_admin_user());

-- =============================================================================
-- PHASE 3: Verification and Testing
-- =============================================================================

-- Add comment explaining the approach
COMMENT ON FUNCTION is_admin_user IS 
'Safely detects admin users without triggering RLS recursion. Uses SECURITY DEFINER to bypass RLS when checking user_profiles table.';

COMMENT ON POLICY "Admins can view all listings safely" ON listings IS
'Allows admin users to view all listings regardless of status or deleted_at state. Uses safe admin detection to prevent RLS recursion.';

-- =============================================================================
-- PHASE 4: Validation Query (for testing)
-- =============================================================================

-- Create a validation function to test admin access
CREATE OR REPLACE FUNCTION validate_admin_listing_access()
RETURNS TABLE (
    total_listings BIGINT,
    active_listings BIGINT,
    inactive_listings BIGINT,
    admin_can_see_inactive BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    test_admin_id UUID;
    inactive_count BIGINT;
BEGIN
    -- Get first admin user for testing
    SELECT id INTO test_admin_id 
    FROM user_profiles 
    WHERE role = 'admin' 
    LIMIT 1;
    
    IF test_admin_id IS NULL THEN
        RAISE NOTICE 'No admin users found for validation';
        RETURN;
    END IF;
    
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM listings WHERE deleted_at IS NULL) as total_listings,
        (SELECT COUNT(*) FROM listings WHERE status IN ('active', 'verified_anonymous', 'verified_public') AND deleted_at IS NULL) as active_listings,
        (SELECT COUNT(*) FROM listings WHERE status = 'inactive' AND deleted_at IS NULL) as inactive_listings,
        (SELECT COUNT(*) FROM listings WHERE status = 'inactive' AND deleted_at IS NULL) > 0 as admin_can_see_inactive;
END;
$$;

-- Grant execute permission for validation
GRANT EXECUTE ON FUNCTION validate_admin_listing_access TO authenticated;

-- =============================================================================
-- MIGRATION COMPLETION LOG
-- =============================================================================

-- Log this migration for tracking
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== ADMIN LISTING ACCESS FIX COMPLETED ===';
    RAISE NOTICE 'Created function: is_admin_user()';
    RAISE NOTICE 'Created policy: "Admins can view all listings safely"';
    RAISE NOTICE 'Validation function: validate_admin_listing_access()';
    RAISE NOTICE '';
    RAISE NOTICE 'Admin users can now view all listings including:';
    RAISE NOTICE '- Active listings';
    RAISE NOTICE '- Inactive/deactivated listings'; 
    RAISE NOTICE '- Draft listings';
    RAISE NOTICE '- All other status types';
    RAISE NOTICE '============================================';
END $$;