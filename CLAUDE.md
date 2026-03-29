# Castudio — Full-Stack Car Wash Platform

## Overview
Castudio is a premium mobile car wash and detailing company in Jabodetabek, Indonesia. This codebase powers three platforms, three AI agents, and the entire business operations stack.

## Tech Stack
- **Framework:** Next.js 15 (App Router) + TypeScript
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Styling:** Tailwind CSS + Radix UI + Lucide Icons
- **AI:** Anthropic Claude SDK (Sonnet 4)
- **Hosting:** Vercel (app) + Azure Container Instance (WAHA)
- **Maps:** Leaflet.js + OpenStreetMap

## Three Platforms

### 1. Public Site (`/`)
Marketing website. Pages: homepage, services, subscriptions, detailing, blog (`/tips`), contact, FAQ, terms, privacy.
Blog is dynamic — posts stored in Supabase `blog_posts` table, published by the Dimas agent.

### 2. Admin Panel (`/admin`)
Business operations dashboard. Auth required (Supabase Auth, email/password).

Sidebar modules:
- **Sales & Marketing:** Customers, Subscriptions, Conversations
- **Operations:** Bookings, Job Tracker, Team & Bonus, Equipment
- **Finance:** Finance, Invoicing, Inventory
- **Technology:** Agents (Shera, Ryan, Dimas), Accounts
- **Analysis:** Analytics, Customer Map, Scorecard, Architecture

### 3. Washer Panel (`/wash`)
Mobile-first field operations app. Auth required (employee login).
Pages: Today's Jobs, Job History, Earnings, SOPs, Profile.
Employee ID = Supabase Auth user ID (must match).

## Three AI Agents

### Shera — WhatsApp AI Agent (24/7)
- **Trigger:** Incoming WhatsApp messages via WAHA webhook
- **Code:** `src/lib/agents/shera.ts`
- **Webhook:** `src/app/api/webhook/whatsapp/route.ts`
- **Infra:** WAHA Docker container on Azure ($4.75/mo)
- **Does:** Books services, answers questions, handles objections, collects ratings, escalates to humans
- **Config:** Rules in `agent_rules` table, settings in `agent_settings` table, knowledge in `agent_knowledge` table

### Ryan — Email Reply Agent (24/7)
- **Trigger:** Plusvibe webhook on email replies
- **Code:** `src/lib/agents/plusvibe.ts` + `src/lib/agents/plusvibe-client.ts`
- **Webhook:** `src/app/api/webhook/plusvibe/route.ts`
- **Infra:** Vercel serverless (free)
- **Does:** Classifies email replies (7 categories), handles objections, extracts phone numbers, hands off to Shera

### Dimas — SEO Blog Autopilot (Daily)
- **Trigger:** Vercel cron at 6:00 AM Jakarta
- **Code:** `src/lib/agents/dimas/` (config, researcher, writer, publisher, tracker, sitemap, gsc)
- **Cron:** `src/app/api/cron/dimas/daily/route.ts`
- **Infra:** Vercel cron (free)
- **Does:** Researches keywords (GSC + autocomplete), writes posts (Claude), publishes to blog, tracks rankings

## Cron Jobs (vercel.json)
| Schedule | Endpoint | Purpose |
|----------|----------|---------|
| Every 2h | `/api/cron/follow-up` | Post-job rating request |
| Daily 10am | `/api/cron/re-engage` | 30-day re-engagement for one-time customers |
| Daily 11am | `/api/cron/upsell` | Subscription upsell for repeat customers |
| Daily 6am | `/api/cron/dimas/daily` | Blog publishing pipeline |
| Monday 7am | `/api/cron/dimas/track` | Weekly SEO rank tracking |
| Monthly 1st | `/api/cron/dimas/research` | Deep keyword research |

## File Structure
```
src/
├── app/                          # Next.js pages and routes
│   ├── (admin)/admin/            # Admin panel (auth protected)
│   │   ├── agents/               # Agent management (shera, plusvibe, dimas)
│   │   ├── bookings/             # Booking CRUD
│   │   ├── customers/            # Customer CRUD + segments
│   │   ├── finance/              # P&L, transactions, cash flow
│   │   └── ...                   # 15+ module pages
│   ├── (wash)/wash/              # Washer panel (auth protected)
│   │   ├── today/                # Daily job view
│   │   ├── job/[id]/             # Job detail + SOP checklist
│   │   └── ...                   # earnings, history, profile, sops
│   ├── api/                      # API routes
│   │   ├── admin/                # Admin CRUD endpoints
│   │   ├── cron/                 # Scheduled tasks
│   │   └── webhook/              # WhatsApp + Plusvibe webhooks
│   └── tips/                     # Public blog pages
├── components/
│   ├── admin/                    # Admin UI components (feature-based subdirs)
│   │   ├── agents/               # Agent cards, settings, code viewer
│   │   ├── bookings/             # Booking table, form, queue
│   │   ├── conversations/        # WhatsApp dashboard, escalations, rules
│   │   ├── finance/              # P&L, cash flow, break-even
│   │   └── ...                   # 15+ feature modules
│   ├── wash/                     # Washer panel components
│   │   ├── JobCard.tsx           # Booking card with actions
│   │   ├── JobDetailSheet.tsx    # Full job modal (SOP + photos)
│   │   └── ...
│   ├── ui/                       # Base UI library (shadcn/radix)
│   └── layout/                   # Navbar, footer, wrappers
├── lib/
│   ├── admin/                    # Admin business logic (18 files)
│   │   ├── bookings.ts           # Booking CRUD + auto-assign algorithm
│   │   ├── agents.ts             # Agent CRUD
│   │   ├── finance.ts            # Financial calculations
│   │   └── ...
│   ├── agents/                   # AI agent logic
│   │   ├── shera.ts              # WhatsApp agent (prompt, tools, processMessage)
│   │   ├── plusvibe.ts           # Email agent (classify, generate, handoff)
│   │   ├── plusvibe-client.ts    # Plusvibe API client
│   │   ├── waha.ts              # WAHA API client (sendText, sessions)
│   │   └── dimas/               # Blog agent modules
│   │       ├── researcher.ts     # Keyword research + scoring
│   │       ├── writer.ts         # Content generation
│   │       ├── publisher.ts      # Supabase publish + indexing
│   │       └── ...
│   ├── wash/                     # Washer panel logic
│   │   ├── jobs.ts               # Booking queries for washer
│   │   ├── sop.ts                # SOP checklists + photo upload
│   │   └── ...
│   ├── supabase.ts               # Supabase client (browser + server)
│   └── blog.ts                   # Blog query functions
└── hooks/                        # Custom React hooks
```

## Database (30 tables)
**Core:** customers, bookings, jobs, employees, subscriptions
**Financial:** transactions, ratings, upsell_attempts
**Operations:** equipment, inventory, sop_checklists
**Communications:** whatsapp_conversations, email_leads, conversations, human_escalations
**Content:** blog_posts, keyword_research, rank_tracking
**AI:** agent_settings, agent_logs, agent_knowledge, agent_rules, automations, connectors, automation_runs
**Storage:** job_photos, castudio-photos (bucket)
**Analytics:** customer_stats, notifications

## Key Patterns
- **Auto-assign:** `bookings.ts` has `autoAssignWasher()` using neighborhood proximity clusters
- **Message buffering:** WhatsApp webhook buffers 15 seconds to combine rapid messages
- **Bot protection:** Webhook blocks business accounts, known service numbers, and detects bot loops
- **Agent key chain:** Each agent checks agent_settings → connectors base_model → env var for Claude API key
- **Round-robin:** Dimas rotates blog categories (tips → guides → news)

## Environment Variables
See `src/app/(admin)/admin/architecture/page.tsx` for the full list, or check Vercel dashboard.

## Development
```bash
npm run dev    # Start dev server
npm run build  # Production build
```
