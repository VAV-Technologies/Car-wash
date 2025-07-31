-- Fix ambiguous column reference in log_listing_verification_action trigger function
-- The issue: both listings and admin_listing_actions tables have admin_notes columns
-- PostgreSQL error: 'column reference "admin_notes" is ambiguous'

-- Drop existing function and trigger
DROP TRIGGER IF EXISTS trigger_log_listing_verification_action ON listings;
DROP FUNCTION IF EXISTS log_listing_verification_action();

-- Recreate trigger function with explicit column references
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
            admin_notes  -- Target column in admin_listing_actions table
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
            NEW.listing_verification_notes  -- Explicit reference to source column
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trigger_log_listing_verification_action
    AFTER UPDATE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION log_listing_verification_action();

-- Add comment
COMMENT ON FUNCTION log_listing_verification_action IS
'Logs listing verification changes to admin_listing_actions table - fixed column ambiguity';