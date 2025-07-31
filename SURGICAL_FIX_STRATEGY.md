# Surgical Fix Strategy

## Overview
A precise, low-risk approach to fix migration tracking issues and apply EBITDA to production.

## Phase 1: Apply EBITDA Migration (PRIORITY 1)
**Goal**: Add EBITDA column to production database
**Risk**: 🟢 LOW (idempotent, safe operation)

### Steps:
1. ✅ **Backup**: Create point-in-time backup of production database
2. ✅ **Apply**: Run EBITDA migration on production using `supabase migration up --linked`
3. ✅ **Verify**: Test that EBITDA column exists and is queryable
4. ✅ **Test**: Verify application functionality works with new column

### Expected Outcome:
- EBITDA column added to production listings table
- All existing data preserved (EBITDA values will be NULL initially)
- Application can now display EBITDA field

## Phase 2: Fix Migration 20250616 Tracking (PRIORITY 2)
**Goal**: Align migration tracking for admin listing management system
**Risk**: 🟢 LOW (schema is already correct, only fixing tracking)

### Current State:
- ✅ Remote database: HAS all the schema changes from this migration
- ❌ Migration tracking: Shows as "remote only" but should be "both"

### Fix Strategy:
```sql
-- Connect to remote database and mark migration as applied locally
INSERT INTO supabase_migrations.schema_migrations (version, name) 
VALUES ('20250616', 'admin_listing_management_system')
ON CONFLICT (version) DO NOTHING;
```

## Phase 3: Investigate Migration 20250619 (PRIORITY 3)
**Goal**: Ensure inquiry status automation is working properly
**Risk**: 🟡 MEDIUM (function may need reapplication)

### Investigation Steps:
1. Check if `update_inquiry_statuses_on_verification` function exists in remote
2. Compare function definition between local and remote
3. If different, reapply the function definition

### Possible Outcomes:
- **Best case**: Function exists but is named differently - just fix tracking
- **Medium case**: Function needs to be updated - reapply function definition
- **Worst case**: Entire migration needs reapplication - apply carefully

## Execution Order
1. **First**: EBITDA migration (high value, low risk)
2. **Second**: 20250616 tracking fix (low risk, improves consistency)
3. **Third**: 20250619 investigation (medium risk, can be done later)

## Rollback Plans
- **EBITDA**: Can drop column if needed (but would lose any data entered)
- **Tracking fixes**: Can remove entries from schema_migrations table
- **Function updates**: Can restore previous function definition

## Success Criteria
✅ EBITDA column works in production application  
✅ Migration list shows consistent state  
✅ All existing functionality preserved  
✅ No data loss occurred