# 🚨 Emergency Recovery Procedures for Nobridge

## Overview
This document provides step-by-step procedures for recovering from critical issues with the Nobridge platform. These procedures are based on real-world experience and proven solutions.

## 🗄️ Database Migration Issues

### Symptoms
- `supabase migration list` shows Local/Remote mismatches
- Deployment fails with migration errors
- Database schema inconsistencies

### ⚠️ CRITICAL: What NOT to Do
- **NEVER** use `supabase db reset` on production
- **NEVER** use destructive SQL commands on production data
- **NEVER** manually delete migration files
- **NEVER** attempt to "sync" by dropping tables

### ✅ Proven Recovery Approach (Based on July 2025 Success)

#### Step 1: Investigate Before Acting
```bash
# Check migration status
supabase migration list

# Save current state
supabase migration list > migration_status_backup.txt
```

#### Step 2: Analyze Schema Differences
Use our proven investigation script:
```sql
-- Run in Supabase Dashboard SQL Editor
SELECT 
    'MIGRATION TABLE STRUCTURE:' as info,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'supabase_migrations' 
AND table_name = 'schema_migrations'
ORDER BY ordinal_position;

-- Check specific problematic migrations
SELECT 'CURRENT MIGRATIONS:' as info, version, name 
FROM supabase_migrations.schema_migrations 
WHERE version IN ('20250616', '20250619', 'YOUR_PROBLEM_MIGRATION')
ORDER BY version;
```

#### Step 3: Surgical Fixes Only
Based on our successful resolution, use this template:

```sql
-- Template for fixing migration tracking
-- Replace VERSION and NAME with actual values

-- Fix missing tracking record
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('VERSION_NUMBER', 'migration_name')
ON CONFLICT (version) DO NOTHING;

-- Verify the fix
SELECT version, name 
FROM supabase_migrations.schema_migrations 
WHERE version = 'VERSION_NUMBER';
```

#### Step 4: Idempotent Schema Changes
If schema changes are needed:

```sql
-- Example: Adding missing column (like EBITDA)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'table_name' 
        AND column_name = 'column_name'
    ) THEN
        ALTER TABLE table_name 
        ADD COLUMN column_name DATA_TYPE;
        
        RAISE NOTICE 'Column added successfully';
    ELSE
        RAISE NOTICE 'Column already exists - skipping';
    END IF;
END $$;
```

### Validation After Fixes
Use our proven validation script template:
```javascript
// validate_fix.cjs
const { createClient } = require('@supabase/supabase-js');

async function validateFix() {
  // Test critical table access
  const { data, error } = await supabase
    .from('critical_table')
    .select('*')
    .limit(1);
    
  if (error) {
    console.log('❌ Validation failed:', error.message);
    return false;
  }
  
  console.log('✅ Validation passed');
  return true;
}
```

## 🔐 Authentication System Failures

### Symptoms
- Users cannot log in or sign up
- Magic links not working
- OTP codes not being sent

### Recovery Steps

#### Check Supabase Auth Status
1. Go to Supabase Dashboard > Authentication
2. Check if auth is enabled
3. Verify email settings

#### Verify Configuration
```toml
# supabase/config.toml
[auth]
enabled = true
site_url = "https://yourapp.com"
additional_redirect_urls = ["http://localhost:3000", "https://yourapp.vercel.app"]

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = true
```

#### Test Email System
```bash
# Check local email system
open http://localhost:54324  # Inbucket for local testing
```

#### Reset Auth (Last Resort)
```sql
-- Only if absolutely necessary - this will log out all users
DELETE FROM auth.sessions;
DELETE FROM auth.refresh_tokens;
-- Users will need to re-authenticate
```

## 🚀 Deployment Failures

### Frontend Deployment Issues (Vercel)

#### Build Failures
```bash
# Local debugging
npm run build

# Check specific errors
npm run lint
npm run type-check

# Fix common issues
npm install
rm -rf .next
npm run build
```

#### Environment Variable Issues
```bash
# Check Vercel environment variables
vercel env ls

# Set missing variables
vercel env add VARIABLE_NAME
```

### Backend Deployment Issues (Supabase)

#### Migration Push Failures
```bash
# Check what would be pushed
supabase db push --dry-run

# If safe, apply
supabase db push

# If issues, fix locally first
supabase db reset
supabase start
```

## 📊 Application Performance Issues

### Database Performance Problems

#### Identify Slow Queries
```sql
-- Check slow queries in Supabase Dashboard
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

#### Common Fixes
- Add database indexes for frequently queried columns
- Optimize RLS policies
- Use proper query patterns

#### Emergency Performance Fix
```sql
-- Temporarily disable RLS if performance is critical
-- ⚠️ Only for emergencies, re-enable ASAP
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Re-enable after fixing
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### Frontend Performance Issues

#### Bundle Size Issues
```bash
# Analyze bundle
npm run build
npx @next/bundle-analyzer

# Common fixes
# - Dynamic imports for large components
# - Optimize images
# - Remove unused dependencies
```

## 🔄 Data Recovery Procedures

### Accidental Data Loss

#### From Supabase Backups
1. Go to Supabase Dashboard > Settings > Database
2. Find appropriate backup point
3. Restore specific tables if possible

#### From Version Control
```bash
# Restore database schema from migrations
git checkout HEAD~1 -- supabase/migrations/
supabase db reset
```

### User Data Corruption

#### Identify Affected Records
```sql
-- Example: Find corrupted user profiles
SELECT * FROM user_profiles 
WHERE created_at > '2025-07-26'  -- After known good state
AND (field_name IS NULL OR field_name = '');
```

#### Fix Specific Records
```sql
-- Example: Fix user role assignments
UPDATE user_profiles 
SET role = 'buyer'
WHERE role IS NULL AND created_at > '2025-07-26';
```

## 📞 Emergency Response Protocol

### Immediate Actions (First 5 minutes)
1. **Assess Impact**: How many users affected?
2. **Document Issue**: Take screenshots, save error logs
3. **Stop Deployment**: If deployment caused issue
4. **Notify Stakeholders**: If user-facing impact

### Investigation Phase (Next 15 minutes)
1. **Check Monitoring**: Vercel Analytics, Supabase Logs
2. **Identify Root Cause**: Recent changes, deploy times
3. **Determine Fix Strategy**: Rollback vs. Forward fix

### Resolution Phase
1. **Apply Fix**: Use procedures above
2. **Validate Resolution**: Test critical user flows
3. **Monitor Stability**: Watch for recurring issues
4. **Update Documentation**: Record lessons learned

## 🛡️ Prevention Measures

### Pre-commit Hooks (Already Implemented)
- Migration status checks
- Automatic validation
- Prevents problematic commits

### Staging Environment
```bash
# Test all changes in staging first
supabase link --project-ref staging-project-ref
supabase db push
# Test thoroughly before production
```

### Monitoring and Alerts
- Set up error rate alerts
- Monitor database performance
- Track user authentication success rates

## 📋 Recovery Checklist Template

```markdown
## Incident Response Checklist

### Discovery
- [ ] Issue identified at: _______________
- [ ] Impact assessment: _______________
- [ ] Users affected: _______________

### Investigation  
- [ ] Logs reviewed
- [ ] Recent changes identified
- [ ] Root cause determined: _______________

### Resolution
- [ ] Fix strategy chosen: _______________
- [ ] Fix applied at: _______________
- [ ] Validation completed: _______________

### Post-incident
- [ ] Documentation updated
- [ ] Prevention measures added
- [ ] Stakeholders notified
```

## 🎯 Key Lessons from July 2025 Migration Crisis

### What Worked
✅ **Surgical SQL fixes** instead of destructive resets
✅ **Investigating first** before applying fixes  
✅ **Idempotent operations** that can be run multiple times safely
✅ **Step-by-step validation** after each change
✅ **Preserving production data** at all costs

### What to Avoid
❌ **Never use reset commands** on production
❌ **Don't guess** - always investigate first
❌ **Avoid batch fixes** - fix one issue at a time
❌ **Don't skip validation** after changes

---

## 🏥 Remember: First, Do No Harm

When in doubt:
1. **Stop and investigate** before taking action
2. **Backup critical data** before major changes  
3. **Test fixes locally** when possible
4. **Document everything** for future reference
5. **Ask for help** rather than guessing

**This platform has real users and real data. Err on the side of caution.**