# 🚀 Nobridge Deployment Checklist

## Pre-Deployment Verification

### ✅ Database & Migrations
- [ ] Run `supabase migration list` - **MUST show perfect Local/Remote sync**
- [ ] If mismatches found, **STOP** and fix migration tracking first
- [ ] Test all migrations locally with `supabase db reset`
- [ ] Verify EBITDA and other critical columns exist in production

### ✅ Code Quality
- [ ] Run `npm run build` - **MUST succeed without errors**
- [ ] Run `npm run lint` - **MUST pass all checks**
- [ ] Run `npm run type-check` - **MUST have no TypeScript errors**
- [ ] Generate latest types: `supabase gen types typescript --local > src/types/supabase.ts`

### ✅ Functionality Testing
- [ ] Test user authentication (login/signup)
- [ ] Test listing creation with EBITDA field
- [ ] Test marketplace financial snapshot display
- [ ] Test admin dashboard functionality
- [ ] Test inquiry system
- [ ] Verify responsive design on mobile

### ✅ Environment & Security
- [ ] Verify production environment variables are set
- [ ] Check no secrets are committed to repository
- [ ] Confirm Supabase RLS policies are active
- [ ] Test email system functionality

### ✅ Performance & Monitoring
- [ ] Check build bundle size is reasonable
- [ ] Verify image optimization is working
- [ ] Test page load speeds
- [ ] Confirm error tracking is enabled

## Deployment Steps

### 🎯 Frontend Deployment (Vercel)
1. **Final verification:**
   ```bash
   npm run build
   npm run lint
   ```

2. **Deploy to production:**
   ```bash
   vercel --prod
   ```

3. **Post-deployment check:**
   - [ ] Visit production URL
   - [ ] Test critical user flows
   - [ ] Check Vercel deployment logs

### 🗄️ Backend Deployment (Supabase)
1. **Pre-migration safety check:**
   ```bash
   supabase migration list  # MUST show perfect sync
   ```

2. **Preview changes (recommended):**
   ```bash
   supabase db push --dry-run
   ```

3. **Deploy migrations:**
   ```bash
   supabase db push
   ```

4. **Post-deployment verification:**
   - [ ] Run validation script: `node validate_migration_fix.cjs`
   - [ ] Check Supabase dashboard for errors
   - [ ] Test database functionality

## Post-Deployment Validation

### ✅ Critical Path Testing
- [ ] User can sign up/login
- [ ] Seller can create listing with EBITDA
- [ ] Buyer can view listings with financial data
- [ ] Admin can manage listings
- [ ] Inquiry system works end-to-end

### ✅ Data Integrity
- [ ] All existing listings preserved
- [ ] EBITDA field accessible and updatable
- [ ] Financial snapshot displays correctly
- [ ] User profiles and roles intact

### ✅ Performance Monitoring
- [ ] Check page load times
- [ ] Monitor error rates
- [ ] Verify database query performance
- [ ] Check email delivery rates

## Rollback Plan

### 🚨 If Issues Detected

**Frontend Issues:**
1. Revert Vercel deployment to previous version
2. Check deployment logs for specific errors
3. Fix issues and redeploy

**Database Issues:**
1. **DO NOT** use `supabase db reset` on production
2. Use surgical SQL fixes (see `CORRECTED_MIGRATION_FIX.sql` template)
3. Restore from backup if necessary
4. Document all recovery actions

**Emergency Database Rollback (if absolutely necessary):**
```sql
-- Only if EBITDA causes critical issues
ALTER TABLE listings DROP COLUMN IF EXISTS ebitda;

-- Remove problematic migration tracking
DELETE FROM supabase_migrations.schema_migrations 
WHERE version = '20250725170826';
```

## Success Criteria

### ✅ Deployment Successful When:
- [ ] All tests pass
- [ ] No error spikes in monitoring
- [ ] Users can complete critical flows
- [ ] Database performance stable
- [ ] EBITDA feature working as expected

### ✅ Business Impact Achieved:
- [ ] Sellers can input EBITDA values
- [ ] Buyers see enhanced financial data
- [ ] Platform stability maintained
- [ ] User experience improved

## Emergency Contacts & Resources

### 📚 Documentation References
- `CLAUDE.md` - Development guidelines and troubleshooting
- `MIGRATION_FIX_DOCUMENTATION.md` - Migration issue resolution
- `validate_migration_fix.cjs` - Automated validation script

### 🔧 Recovery Tools
- `CORRECTED_MIGRATION_FIX.sql` - Template for migration fixes
- Git hooks for prevention of future issues
- Backup scripts and procedures

### 📊 Monitoring Dashboards
- Vercel Analytics Dashboard
- Supabase Database Dashboard
- Error tracking and performance metrics

---

## 🎯 Remember
- **Safety First:** Real users depend on this platform
- **Test Thoroughly:** Every change affects production data
- **Document Everything:** Help future deployments succeed
- **Stay Calm:** Follow the checklist and procedures

**Last Updated:** July 2025 (Post-EBITDA implementation)