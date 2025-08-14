-- Fix Verification Trigger Action Type
-- Purpose: Fix check constraint violation by using generic 'status_changed' action type
-- SAFETY: Only modifies trigger function, no data changes

-- =============================================================================
-- Replace the trigger function with fixed version
-- =============================================================================

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
            'status_changed',  -- Use generic action type that exists in constraint
            OLD.listing_verification_status::VARCHAR,
            NEW.listing_verification_status::VARCHAR,
            NEW.listing_verification_notes
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: The trigger itself doesn't need to be recreated, only the function it calls

-- =============================================================================
-- Verification
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== TRIGGER FUNCTION FIXED ===';
    RAISE NOTICE 'Function: log_listing_verification_action()';
    RAISE NOTICE 'Change: Now uses generic ''status_changed'' action type';
    RAISE NOTICE 'Result: Works with any verification status value';
    RAISE NOTICE '';
END $$;