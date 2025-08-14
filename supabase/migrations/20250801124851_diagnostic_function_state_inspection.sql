-- Diagnostic Migration: Function State Inspection
-- Purpose: Inspect actual production state to understand function conflicts
-- This migration only queries and reports - makes no changes

-- =============================================================================
-- Phase 1: Inspect Function Overloads
-- =============================================================================

DO $$
DECLARE
    func_record RECORD;
    param_record RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== DIAGNOSTIC: FUNCTION STATE INSPECTION ===';
    RAISE NOTICE '';
    
    -- Check all versions of update_listing_verification_status
    RAISE NOTICE '--- UPDATE_LISTING_VERIFICATION_STATUS FUNCTIONS ---';
    
    FOR func_record IN 
        SELECT 
            p.oid,
            p.proname,
            p.pronargs,
            pg_get_function_identity_arguments(p.oid) as signature,
            pg_get_functiondef(p.oid) as definition
        FROM pg_proc p 
        WHERE p.proname = 'update_listing_verification_status'
        ORDER BY p.oid
    LOOP
        RAISE NOTICE 'Function OID: %, Args: %, Signature: %', 
            func_record.oid, func_record.pronargs, func_record.signature;
    END LOOP;
    
    -- Check all versions of get_listing_verification_history
    RAISE NOTICE '';
    RAISE NOTICE '--- GET_LISTING_VERIFICATION_HISTORY FUNCTIONS ---';
    
    FOR func_record IN 
        SELECT 
            p.oid,
            p.proname,
            p.pronargs,
            pg_get_function_identity_arguments(p.oid) as signature
        FROM pg_proc p 
        WHERE p.proname = 'get_listing_verification_history'
        ORDER BY p.oid
    LOOP
        RAISE NOTICE 'Function OID: %, Args: %, Signature: %', 
            func_record.oid, func_record.pronargs, func_record.signature;
    END LOOP;
    
    RAISE NOTICE '';
    
END $$;

-- =============================================================================
-- Phase 2: Inspect Column Types
-- =============================================================================

DO $$
DECLARE
    col_record RECORD;
BEGIN
    RAISE NOTICE '--- COLUMN TYPE INSPECTION ---';
    
    -- Check user_profiles.full_name type
    SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable
    INTO col_record
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'full_name';
    
    IF FOUND THEN
        RAISE NOTICE 'user_profiles.full_name: % (max_length: %, nullable: %)', 
            col_record.data_type, col_record.character_maximum_length, col_record.is_nullable;
    ELSE
        RAISE NOTICE 'user_profiles.full_name: NOT FOUND';
    END IF;
    
    -- Check listings verification columns
    RAISE NOTICE '';
    RAISE NOTICE '--- LISTINGS VERIFICATION COLUMNS ---';
    
    FOR col_record IN
        SELECT 
            column_name,
            data_type,
            udt_name,
            is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'listings' 
        AND column_name LIKE 'listing_verification%'
        ORDER BY column_name
    LOOP
        RAISE NOTICE 'listings.%: % (udt: %, nullable: %)', 
            col_record.column_name, col_record.data_type, col_record.udt_name, col_record.is_nullable;
    END LOOP;
    
    RAISE NOTICE '';
    
END $$;

-- =============================================================================
-- Phase 3: Test Function Calls (Safe Test)
-- =============================================================================

DO $$
DECLARE
    test_result JSONB;
    history_result RECORD;
    error_msg TEXT;
BEGIN
    RAISE NOTICE '--- FUNCTION CALL TESTS ---';
    
    -- Test update function (will fail due to auth, but we can see the error)
    BEGIN
        SELECT update_listing_verification_status(
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID,  -- admin_user_id
            'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::UUID,  -- listing_uuid
            'verified',                                     -- new_verification_status
            'diagnostic test'                               -- verification_notes
        ) INTO test_result;
        
        RAISE NOTICE 'Update function test result: %', test_result;
        
    EXCEPTION
        WHEN OTHERS THEN
            error_msg := SQLERRM;
            RAISE NOTICE 'Update function error (expected): %', error_msg;
            
            -- Check if it's the overloading error
            IF error_msg LIKE '%function update_listing_verification_status%ambiguous%' OR 
               error_msg LIKE '%Could not choose the best candidate function%' THEN
                RAISE NOTICE 'CONFIRMED: Function overloading conflict exists';
            END IF;
    END;
    
    -- Test history function
    BEGIN
        SELECT * FROM get_listing_verification_history('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::UUID) 
        INTO history_result;
        
        RAISE NOTICE 'History function test completed successfully';
        
    EXCEPTION
        WHEN OTHERS THEN
            error_msg := SQLERRM;
            RAISE NOTICE 'History function error: %', error_msg;
            
            -- Check if it's the return type error
            IF error_msg LIKE '%does not match expected type%' THEN
                RAISE NOTICE 'CONFIRMED: Return type mismatch exists';
            END IF;
    END;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== DIAGNOSTIC COMPLETE ===';
    
END $$;