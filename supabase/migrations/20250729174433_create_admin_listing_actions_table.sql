-- Create Admin Listing Actions Table Migration
-- Purpose: Create the missing admin_listing_actions table that the verification system expects
-- Addresses: Fixes "ambiguous column reference" error in update_listing_verification_status function
-- Date: 2025-07-29

-- =============================================================================
-- Create Admin Listing Actions Table
-- =============================================================================

-- Create the admin_listing_actions table that the verification system expects
CREATE TABLE IF NOT EXISTS admin_listing_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    admin_user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add constraint for action types (matches what the verification system expects)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'admin_listing_actions_action_type_check'
        AND table_name = 'admin_listing_actions'
    ) THEN
        ALTER TABLE admin_listing_actions ADD CONSTRAINT admin_listing_actions_action_type_check
        CHECK (action_type IN (
            'approved',
            'rejected', 
            'status_changed',
            'appeal_reviewed',
            'notes_updated',
            'bulk_action',
            'listing_verified',
            'listing_unverified', 
            'listing_verification_deactivated'
        ));
    END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_listing_actions_listing_id 
ON admin_listing_actions(listing_id);

CREATE INDEX IF NOT EXISTS idx_admin_listing_actions_admin_user_id 
ON admin_listing_actions(admin_user_id);

CREATE INDEX IF NOT EXISTS idx_admin_listing_actions_created_at 
ON admin_listing_actions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_listing_actions_action_type 
ON admin_listing_actions(action_type);

-- =============================================================================
-- Row Level Security (RLS) Policies
-- =============================================================================

-- Enable RLS
ALTER TABLE admin_listing_actions ENABLE ROW LEVEL SECURITY;

-- Policy: Admin users can read all admin actions
CREATE POLICY "Admins can read all admin listing actions" 
ON admin_listing_actions 
FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy: Admin users can insert admin actions (for logging purposes)
CREATE POLICY "Admins can insert admin listing actions" 
ON admin_listing_actions 
FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
    AND admin_user_id = auth.uid()
);

-- Policy: No updates or deletes - audit trail should be immutable
-- (Updates and deletes are not allowed to maintain audit integrity)

-- =============================================================================
-- Comments for Documentation
-- =============================================================================

COMMENT ON TABLE admin_listing_actions IS 
'Audit trail for all admin actions performed on listings, especially verification status changes';

COMMENT ON COLUMN admin_listing_actions.listing_id IS 
'Reference to the listing that was acted upon';

COMMENT ON COLUMN admin_listing_actions.admin_user_id IS 
'Admin user who performed the action';

COMMENT ON COLUMN admin_listing_actions.action_type IS 
'Type of action performed (verification, approval, etc.)';

COMMENT ON COLUMN admin_listing_actions.previous_status IS 
'Status before the action was performed';

COMMENT ON COLUMN admin_listing_actions.new_status IS 
'Status after the action was performed';

COMMENT ON COLUMN admin_listing_actions.admin_notes IS 
'Optional notes from the admin about the action';

-- =============================================================================
-- Grant Permissions
-- =============================================================================

-- Grant appropriate permissions to authenticated users (RLS will handle admin-only access)
GRANT SELECT, INSERT ON admin_listing_actions TO authenticated;

-- =============================================================================
-- Validation
-- =============================================================================

-- Log successful creation
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== ADMIN LISTING ACTIONS TABLE CREATED ===';
    RAISE NOTICE 'Table: admin_listing_actions';
    RAISE NOTICE 'Purpose: Audit trail for admin listing actions';
    RAISE NOTICE 'Features: RLS enabled, proper indexes, action type constraints';
    RAISE NOTICE '';
    RAISE NOTICE 'This fixes the "ambiguous column reference" error in';
    RAISE NOTICE 'the update_listing_verification_status function.';
    RAISE NOTICE '===============================================';
END $$;