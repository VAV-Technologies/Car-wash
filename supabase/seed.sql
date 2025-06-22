-- Clean seed.sql
-- This file is intentionally minimal.
-- The seller user and listings are created dynamically by the complete-clean-rebuild.cjs script.
-- This prevents foreign key constraint errors during the initial database reset.

SELECT 'Minimal seed executed' as status;
