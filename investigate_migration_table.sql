-- Investigation Script: Check Migration Table Structure
-- Run this first to understand the actual schema

-- Check if the migration schema and table exist
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'supabase_migrations';

-- Check the actual structure of the schema_migrations table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'supabase_migrations' 
AND table_name = 'schema_migrations'
ORDER BY ordinal_position;

-- Check what data currently exists in the table
SELECT version, name 
FROM supabase_migrations.schema_migrations 
ORDER BY version 
LIMIT 10;

-- Check specifically for our problematic migrations
SELECT version, name 
FROM supabase_migrations.schema_migrations 
WHERE version IN ('20250616', '20250619', '20250725170826');

-- Count total migrations
SELECT COUNT(*) as total_migrations 
FROM supabase_migrations.schema_migrations;