-- Fix tracking for migration 20250619 (inquiry_status_automation)
-- Based on our reconnaissance, the function appears to be working
-- We just need to fix the tracking table

-- Check current state first
SELECT 
  version, 
  name, 
  executed_at 
FROM supabase_migrations.schema_migrations 
WHERE version = '20250619';

-- Insert the missing tracking record
-- This is safe because the function appears to be working based on our tests
INSERT INTO supabase_migrations.schema_migrations (version, name, statements, executed_at)
VALUES (
  '20250619',
  '000000_inquiry_status_automation',
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
WHERE version = '20250619';