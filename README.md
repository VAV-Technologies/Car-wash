# Castudio — Premium Car Wash & Detailing

Premium mobile car wash and detailing company in Jakarta, Indonesia. This repo contains the customer-facing website and internal admin panel.

## Tech Stack

- **Next.js 15** with App Router + TypeScript + Tailwind CSS
- **Supabase** (PostgreSQL, Auth, RLS, Storage)
- **Claude API** for AI business assistant
- **Vercel** for hosting

## Development

```bash
npm install
npm run dev    # http://localhost:9002
npm run build
```

## Structure

- `src/app/` — Public website pages (castudio.co)
- `src/app/(admin)/admin/` — Admin panel (castudio.co/admin)
- `src/app/api/` — API routes (blogs, chat)
- `src/lib/admin/` — Admin data layer (CRUD, queries)
- `src/components/admin/` — Admin UI components

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CASTUDIO_API_KEY=
ANTHROPIC_API_KEY=
```
