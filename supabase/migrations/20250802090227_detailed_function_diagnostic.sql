-- Detailed Function Diagnostic - Get EXACT Definitions
-- Purpose: Get complete function definitions to create precise DROP statements
-- SAFETY: This migration makes NO changes - only reports information

DO $$
DECLARE
    func_record RECORD;
    dep_record RECORD;
    func_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== DETAILED FUNCTION DIAGNOSTIC ===';
    RAISE NOTICE 'Date: %', NOW();
    RAISE NOTICE '';
    
    -- =============================================================================
    -- Count how many update_listing_verification_status functions exist
    -- =============================================================================
    
    SELECT COUNT(*) INTO func_count
    FROM pg_proc p 
    WHERE p.proname = 'update_listing_verification_status';
    
    RAISE NOTICE 'Total update_listing_verification_status functions found: %', func_count;
    RAISE NOTICE '';
    
    -- =============================================================================
    -- Get COMPLETE function definitions
    -- =============================================================================
    
    RAISE NOTICE '--- COMPLETE FUNCTION DEFINITIONS ---';
    RAISE NOTICE '';
    
    FOR func_record IN 
        SELECT 
            p.oid,
            n.nspname as schema_name,
            p.proname as function_name,
            pg_get_function_identity_arguments(p.oid) as identity_args,
            pg_get_functiondef(p.oid) as full_definition
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'update_listing_verification_status'
        ORDER BY p.oid
    LOOP
        RAISE NOTICE 'Function OID: %', func_record.oid;
        RAISE NOTICE 'Schema: %', func_record.schema_name;
        RAISE NOTICE 'Identity Arguments: %', func_record.identity_args;
        RAISE NOTICE 'Full Definition:';
        RAISE NOTICE '%', func_record.full_definition;
        RAISE NOTICE '';
        RAISE NOTICE '--- DROP Statement for OID % ---', func_record.oid;
        RAISE NOTICE 'DROP FUNCTION IF EXISTS %.%(%);', 
            func_record.schema_name, 
            func_record.function_name,
            func_record.identity_args;
        RAISE NOTICE '';
        
        -- Check for dependencies
        RAISE NOTICE '--- Dependencies for OID % ---', func_record.oid;
        FOR dep_record IN
            SELECT 
                deptype,
                classid::regclass as class,
                objid,
                objsubid
            FROM pg_depend
            WHERE refobjid = func_record.oid
            AND deptype != 'i'  -- Ignore internal dependencies
        LOOP
            RAISE NOTICE 'Dependency Type: %, Class: %, Object: %', 
                dep_record.deptype, dep_record.class, dep_record.objid;
        END LOOP;
        
        RAISE NOTICE '';
        RAISE NOTICE '=================================';
        RAISE NOTICE '';
    END LOOP;
    
    -- =============================================================================
    -- Also check get_listing_verification_history function
    -- =============================================================================
    
    RAISE NOTICE '--- GET_LISTING_VERIFICATION_HISTORY FUNCTION ---';
    RAISE NOTICE '';
    
    FOR func_record IN 
        SELECT 
            p.oid,
            n.nspname as schema_name,
            p.proname as function_name,
            pg_get_function_identity_arguments(p.oid) as identity_args,
            pg_get_functiondef(p.oid) as full_definition
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'get_listing_verification_history'
        ORDER BY p.oid
    LOOP
        RAISE NOTICE 'Function OID: %', func_record.oid;
        RAISE NOTICE 'Schema: %', func_record.schema_name;
        RAISE NOTICE 'Identity Arguments: %', func_record.identity_args;
        RAISE NOTICE 'Full Definition:';
        RAISE NOTICE '%', func_record.full_definition;
        RAISE NOTICE '';
    END LOOP;
    
    -- =============================================================================
    -- Safety check: Verify no tables or data will be affected
    -- =============================================================================
    
    RAISE NOTICE '--- SAFETY VERIFICATION ---';
    RAISE NOTICE 'Tables in public schema: %', 
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public');
    RAISE NOTICE 'Total rows in listings table: %', 
        (SELECT COUNT(*) FROM listings);
    RAISE NOTICE '';
    
    RAISE NOTICE '=== DIAGNOSTIC COMPLETE ===';
    RAISE NOTICE 'Next step: Use the exact DROP statements shown above';
    RAISE NOTICE '';
    
END $$;