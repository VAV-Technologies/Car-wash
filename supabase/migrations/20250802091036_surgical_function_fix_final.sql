-- Surgical Function Fix - Final Solution
-- Purpose: Remove duplicate function overloads and create single definitive version
-- SAFETY: Only drops functions, no data or tables affected

-- =============================================================================
-- SAFETY VERIFICATION: Confirm we're only dropping functions
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE 'SAFETY CHECK: This migration will only drop and recreate functions.';
    RAISE NOTICE 'No tables, columns, or data will be affected.';
    RAISE NOTICE '';
END $$;

-- =============================================================================
-- Phase 1: Drop BOTH existing function overloads using exact signatures
-- =============================================================================

-- Drop Function OID 120898 (old parameter order)
DROP FUNCTION IF EXISTS public.update_listing_verification_status(
    listing_uuid uuid, 
    new_verification_status text, 
    admin_user_id uuid, 
    verification_notes text
);

-- Drop Function OID 123126 (new parameter order)  
DROP FUNCTION IF EXISTS public.update_listing_verification_status(
    admin_user_id uuid, 
    listing_uuid uuid, 
    new_verification_status text, 
    verification_notes text
);

-- Also drop the history function to recreate with correct return type
DROP FUNCTION IF EXISTS public.get_listing_verification_history(listing_uuid uuid);

-- =============================================================================
-- Phase 2: Verify drops were successful
-- =============================================================================

DO $$
DECLARE
    remaining_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_count
    FROM pg_proc p 
    WHERE p.proname = 'update_listing_verification_status';
    
    IF remaining_count > 0 THEN
        RAISE EXCEPTION 'ERROR: % update_listing_verification_status functions still exist after DROP', remaining_count;
    END IF;
    
    RAISE NOTICE 'SUCCESS: All duplicate functions removed';
END $$;

-- =============================================================================
-- Phase 3: Create single definitive function with API-matching parameter order
-- =============================================================================

CREATE OR REPLACE FUNCTION public.update_listing_verification_status(
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
    BEGIN
        verification_status_enum := new_verification_status::listing_verification_status;
    EXCEPTION
        WHEN invalid_text_representation THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'Invalid verification status: ' || new_verification_status
            );
    END;

    -- Update listing verification status
    UPDATE listings
    SET 
        listing_verification_status = verification_status_enum,
        listing_verification_by = admin_user_id,
        listing_verification_at = NOW(),
        listing_verification_notes = verification_notes,
        updated_at = NOW()
    WHERE id = listing_uuid;

    -- Return success with admin details
    RETURN jsonb_build_object(
        'success', true,
        'listing_id', listing_uuid,
        'verification_status', verification_status_enum::TEXT,
        'verified_by', admin_profile.full_name,
        'verified_at', NOW()
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Database error: ' || SQLERRM
        );
END;
$$;

-- =============================================================================
-- Phase 4: Recreate history function with correct return type
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_listing_verification_history(listing_uuid UUID)
RETURNS TABLE (
    verification_id UUID,
    admin_name VARCHAR(255),  -- Matches user_profiles.full_name exact type
    verification_status listing_verification_status,
    verification_notes TEXT,
    verified_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
-- Phase 5: Grant permissions
-- =============================================================================

GRANT EXECUTE ON FUNCTION public.update_listing_verification_status(UUID, UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_listing_verification_history(UUID) TO authenticated;

-- =============================================================================
-- Phase 6: Final verification
-- =============================================================================

DO $$
DECLARE
    final_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO final_count
    FROM pg_proc p 
    WHERE p.proname = 'update_listing_verification_status';
    
    IF final_count != 1 THEN
        RAISE EXCEPTION 'ERROR: Expected 1 function but found %', final_count;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== MIGRATION COMPLETE ===';
    RAISE NOTICE ' Removed duplicate function overloads';
    RAISE NOTICE ' Created single update_listing_verification_status function';
    RAISE NOTICE ' Fixed get_listing_verification_history return type';
    RAISE NOTICE ' No data or tables were affected';
    RAISE NOTICE '';
END $$;