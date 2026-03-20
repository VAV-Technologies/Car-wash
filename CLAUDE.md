# Castudio — Static Frontend

## Overview
Castudio is a static marketing site built with Next.js 15, TypeScript, and Tailwind CSS. It serves as the public-facing website for Castudio, a premium car wash and car detailing company in Indonesia. There is no backend, database, or authentication — all content is static.

## Tech Stack
- **Next.js 15** with App Router
- **TypeScript**
- **Tailwind CSS** + Radix UI primitives
- **Framer Motion** for animations
- **Lucide React** for icons

## Project Structure
```
src/
├── app/              # Pages (static routes)
├── components/
│   ├── ui/           # Base UI components (Radix-based)
│   ├── layout/       # Navbar, Footer, GlobalLayoutWrapper
│   ├── seo/          # StructuredData
│   └── shared/       # Shared components (Logo, WhatsAppButton, etc.)
├── lib/
│   ├── utils.ts      # cn() helper
│   └── blog.ts       # Static blog data (samplePosts array)
└── hooks/
    ├── use-toast.ts
    ├── use-debounce.ts
    └── use-mobile.tsx
```

## Pages
`/` `/about` `/car-wash/one-time` `/car-wash/subscriptions` `/detailing` `/terms` `/privacy` `/contact` `/faq` `/coverage` `/tips` `/tips/[slug]`

## Development
```bash
npm run dev          # Start dev server on port 9002
npm run build        # Production build
npm run start        # Serve production build
```

## Key Decisions
- Contact form uses `mailto:` link (no API)
- Blog/resources content comes from static `samplePosts` array in `src/lib/blog.ts`
- No authentication, no database, no API routes
- Deployed on Vercel as a static site
- Dark theme: brand-black (#0A0A0A), brand-dark-gray (#171717), brand-orange (#F97316)
- Currency: Indonesian Rupiah (IDR)
