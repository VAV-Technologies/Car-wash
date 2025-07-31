-- Fix tracking for migration 20250616 (admin_listing_management_system)
-- This migration's schema changes are already applied to remote database
-- We just need to fix the tracking table

-- Check current state first
SELECT 
  version, 
  name, 
  executed_at 
FROM supabase_migrations.schema_migrations 
WHERE version = '20250616';

-- Insert the missing tracking record
-- This is safe because the schema changes are already applied
INSERT INTO supabase_migrations.schema_migrations (version, name, statements, executed_at)
VALUES (
  '20250616',
  'admin_listing_management_system',
  NULL,  -- We don't need to track statements for existing migrations
  NOW()
)
ON CONFLICT (version) DO NOTHING;

-- Verify the fix
SELECT 
  version, 
  name, 
  executed_at 
FROM supabase_migrations.schema_migrations 
WHERE version = '20250616';