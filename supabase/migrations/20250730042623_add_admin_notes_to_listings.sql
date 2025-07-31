-- Add admin_notes column to listings table
-- Purpose: Fix missing admin_notes column that the admin API expects
-- Date: 2025-07-30

-- Add admin_notes column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'listings' 
        AND column_name = 'admin_notes'
    ) THEN
        ALTER TABLE listings 
        ADD COLUMN admin_notes TEXT;
        
        COMMENT ON COLUMN listings.admin_notes IS 
        'Admin notes for internal use - not visible to sellers or buyers';
        
        RAISE NOTICE 'Added column: admin_notes to listings table';
    ELSE
        RAISE NOTICE 'Column admin_notes already exists in listings table - skipping';
    END IF;
END $$;

-- Also add admin_action_by and admin_action_at if they don't exist
-- (These are referenced in the admin API)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'listings' 
        AND column_name = 'admin_action_by'
    ) THEN
        ALTER TABLE listings 
        ADD COLUMN admin_action_by UUID REFERENCES user_profiles(id);
        
        COMMENT ON COLUMN listings.admin_action_by IS 
        'Admin user who last performed an action on this listing';
        
        RAISE NOTICE 'Added column: admin_action_by to listings table';
    ELSE
        RAISE NOTICE 'Column admin_action_by already exists - skipping';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'listings' 
        AND column_name = 'admin_action_at'
    ) THEN
        ALTER TABLE listings 
        ADD COLUMN admin_action_at TIMESTAMP WITH TIME ZONE;
        
        COMMENT ON COLUMN listings.admin_action_at IS 
        'Timestamp of last admin action on this listing';
        
        RAISE NOTICE 'Added column: admin_action_at to listings table';
    ELSE
        RAISE NOTICE 'Column admin_action_at already exists - skipping';
    END IF;
END $$;

-- Add rejection_category column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'listings' 
        AND column_name = 'rejection_category'
    ) THEN
        ALTER TABLE listings 
        ADD COLUMN rejection_category VARCHAR(50);
        
        COMMENT ON COLUMN listings.rejection_category IS 
        'Category of rejection if listing was rejected';
        
        RAISE NOTICE 'Added column: rejection_category to listings table';
    ELSE
        RAISE NOTICE 'Column rejection_category already exists - skipping';
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listings_admin_action_by 
ON listings(admin_action_by) 
WHERE admin_action_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_listings_admin_action_at 
ON listings(admin_action_at DESC) 
WHERE admin_action_at IS NOT NULL;

-- Log successful migration
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== ADMIN COLUMNS ADDED TO LISTINGS TABLE ===';
    RAISE NOTICE 'Added columns: admin_notes, admin_action_by, admin_action_at, rejection_category';
    RAISE NOTICE 'This fixes the admin API error when fetching listings';
    RAISE NOTICE '=============================================';
END $$;