# Nobridge Development Guide for Claude

## 🎯 Project Overview
Nobridge is a business marketplace platform built with Next.js 15, TypeScript, Supabase, and Tailwind CSS. This guide helps maintain development consistency and prevent common issues.

## 🗄️ Database & Migrations

### Migration Best Practices
**ALWAYS follow this workflow to prevent migration tracking issues:**

1. **Before any migration work:**
   ```bash
   supabase migration list
   ```
   Verify Local and Remote columns are identical. If mismatched, STOP and fix tracking first.

2. **Creating new migrations - THE CORRECT WAY:**
   ```bash
   # ALWAYS use this command first - it generates proper timestamp
   supabase migration new descriptive_migration_name
   
   # This creates: supabase/migrations/20250728120000_descriptive_migration_name.sql
   # Then edit the generated file with your SQL
   ```
   
   ⚠️ **NEVER** manually create SQL files in the migrations folder!
   ⚠️ **NEVER** use timestamps like `20250616_` without full format!
   ⚠️ **NEVER** put non-SQL files (like .md) in migrations folder!

3. **Testing locally:**
   ```bash
   supabase db reset           # Rebuilds local DB with all migrations
   npm run dev                 # Test your changes
   ```

4. **Before deploying to production:**
   ```bash
   supabase migration list     # Must show perfect sync
   supabase db push --dry-run  # Preview changes
   supabase db push           # Apply to production (will prompt for confirmation)
   ```

### 🚨 Migration Troubleshooting

**Common Migration Issues We've Fixed (July 2025):**
1. **Invalid files in migrations folder** - README.md was causing CLI to fail
2. **Duplicate migrations with bad timestamps** - Files like `20250616_` instead of full timestamp
3. **Out-of-sync tracking** - Local migrations not marked as applied in remote

**If `supabase migration list` shows mismatches:**

1. **First, update Supabase CLI to latest version:**
   ```bash
   brew install supabase/tap/supabase
   # or upgrade if already installed:
   brew upgrade supabase/tap/supabase
   ```

2. **Use `supabase migration repair` to fix tracking:**
   ```bash
   # If migration exists in production but not tracked:
   supabase migration repair --status applied 20250616
   
   # If migration was rolled back or doesn't exist:
   supabase migration repair --status reverted 20250616
   ```

3. **Clean up duplicate/invalid files:**
   - Remove any non-SQL files from migrations folder
   - Remove duplicate migrations with improper timestamps
   - Keep only the properly timestamped versions

4. **Verify perfect sync:**
   ```bash
   supabase migration list
   # All migrations should appear in both Local and Remote columns
   ```

**What NOT to do:**
- **DO NOT** use `supabase db reset` on production
- **DO NOT** manually edit the migration tracking table
- **DO NOT** delete migrations that have been applied to production
- **DO NOT** create SQL files manually in migrations folder

**Emergency Recovery Process (Proven July 2025):**
1. Update Supabase CLI to latest version
2. Remove invalid files from migrations folder
3. Use `supabase migration repair` to fix tracking
4. Verify with `supabase migration list`
5. Test with a new migration to ensure system works

## 🏗️ Code Architecture

### Key Technologies
- **Next.js 15.2.3** with App Router
- **TypeScript** for type safety
- **Supabase** for backend (PostgreSQL + Auth + Real-time)
- **Tailwind CSS** + **ShadCN UI** for styling
- **Zod** for form validation

### Project Structure
```
src/
├── app/                 # Next.js App Router pages
│   ├── (auth)/         # Authentication routes
│   ├── dashboard/      # User dashboards
│   ├── api/           # API routes
│   └── listings/      # Marketplace pages
├── components/         # Reusable components
│   ├── ui/            # Base UI components (ShadCN)
│   ├── auth/          # Authentication components
│   └── shared/        # Shared components
├── lib/               # Utilities and configurations
├── hooks/             # Custom React hooks
└── types/             # TypeScript definitions

supabase/
├── migrations/        # Database migrations
├── templates/         # Email templates
└── config.toml       # Supabase configuration
```

## 🔧 Development Commands

### Essential Commands
```bash
# Start local development
supabase start
npm run dev

# Database operations
supabase db reset           # Reset local DB with all migrations
supabase migration list     # Check migration status
supabase db push           # Deploy migrations to production
supabase gen types typescript --local > src/types/supabase.ts

# Testing & Quality
npm run build              # Production build
npm run lint              # ESLint check
npm run type-check        # TypeScript check
```

### Quick Migration Workflow
```bash
# 1. Check current status
supabase migration list

# 2. Create new migration (ALWAYS use this command!)
supabase migration new add_user_preferences

# 3. Edit the generated file
# supabase/migrations/20250728_add_user_preferences.sql

# 4. Test locally
supabase db reset

# 5. Deploy when ready
supabase db push
```

### Environment Setup
Create `.env.local`:
```env
# Local development
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=[from-supabase-start]

# Production (when needed)
REMOTE_SUPABASE_URL=[production-url]
REMOTE_SUPABASE_SERVICE_KEY=[service-key]
```

## 🎨 UI/UX Guidelines

### Design System
- **Primary Color:** `#0D0D39` (Dark Blue)
- **Font:** Montserrat Arabic for headings, Satoshi for body
- **Icons:** Custom Nobridge icons via `NobridgeIcon` component
- **Logo:** Brand logos in `public/assets/` (light/dark variants)

### Component Patterns
```tsx
// Use ShadCN components as base
import { Button } from "@/components/ui/button"

// Custom icons
import { NobridgeIcon } from "@/components/ui/nobridge-icon"
<NobridgeIcon icon="business-listing" size="lg" />

// Form validation with Zod
const schema = z.object({
  ebitda: z.coerce.number().optional()
})
```

## 🔒 Security & Authentication

### User Roles
- **Buyer:** Browse and inquire about listings
- **Seller:** Create and manage business listings
- **Admin:** Full platform management

### Security Practices
- Row Level Security (RLS) policies on all tables
- Type-safe API routes with proper validation
- Secure file uploads to Supabase Storage
- No secrets in client-side code

## 🚀 Deployment

### Pre-deployment Checklist
1. ✅ Run `supabase migration list` (must show perfect sync)
2. ✅ Run `npm run build` (must succeed)
3. ✅ Run `npm run lint` (must pass)
4. ✅ Test critical user flows locally
5. ✅ Verify environment variables are set

### Production Deployment
```bash
# Frontend (Vercel)
npm run build
vercel --prod

# Backend (Supabase)
supabase db push  # Only after migration list verification
```

## 🐛 Common Issues & Solutions

### Migration Tracking Issues
**Symptoms:** Local/Remote mismatches in `supabase migration list`
**Solution:** Use surgical SQL fixes, never reset production

### Build Errors
**Symptoms:** TypeScript or import errors
**Solution:** 
```bash
supabase gen types typescript --local > src/types/supabase.ts
npm run type-check
```

### Authentication Issues
**Symptoms:** Users can't log in/sign up
**Solution:** Check `supabase/config.toml` site_url and redirect_urls

## 📊 Features Implemented

### Core Features
- ✅ Business listing marketplace
- ✅ User authentication (magic links + OTP)
- ✅ Role-based dashboards (Buyer/Seller/Admin)
- ✅ Financial data display (Revenue, Cash Flow, **EBITDA**)
- ✅ Inquiry system with status automation
- ✅ Admin listing management system
- ✅ Modern UI with custom branding

### Recent Additions
- ✅ **EBITDA field** in listings (July 2025)
- ✅ Financial snapshot display improvements
- ✅ **Migration system fully repaired** (July 28, 2025)
  - Fixed tracking mismatches using `supabase migration repair`
  - Removed duplicate migrations and invalid files
  - Updated CLI to v2.31.8
  - Documented proper migration workflow
- ✅ **Admin verification system** with audit trails (July 2025)
- ✅ Custom icon system
- ✅ Brand redesign to Nobridge

## 🎯 Development Guidelines

### Code Quality
- Always use TypeScript with strict mode
- Follow existing component patterns
- Use ShadCN UI components when possible
- Implement proper error handling
- Write descriptive commit messages

### Database Changes
- Create migrations for all schema changes
- Use idempotent SQL operations
- Add proper comments to columns
- Test locally before production
- Never commit secrets or API keys

### Testing
- Test all user flows after changes
- Verify responsive design on mobile
- Check authentication across roles
- Validate form submissions and error states

---

## 🆘 Emergency Contacts
- **Database Issues:** Use the proven migration fix approach documented here
- **Deployment Issues:** Check Vercel logs and Supabase dashboard
- **Authentication Issues:** Verify Supabase Auth configuration

Remember: This platform has real users and production data. Always prioritize data safety and test thoroughly before deploying.