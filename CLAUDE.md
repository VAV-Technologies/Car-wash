# Nobridge — Static Frontend

## Overview
Nobridge is a static marketing site built with Next.js 15, TypeScript, and Tailwind CSS. It serves as the public-facing website for the Nobridge M&A advisory firm. There is no backend, database, or authentication — all content is static.

## Tech Stack
- **Next.js 15** with App Router
- **TypeScript**
- **Tailwind CSS** + Radix UI primitives
- **Framer Motion** for animations
- **Three.js / react-three-fiber** for the interactive globe
- **Lucide React** for icons

## Project Structure
```
src/
├── app/              # Pages (static routes)
├── components/
│   ├── ui/           # Base UI components (Radix-based)
│   ├── layout/       # Navbar, Footer, GlobalLayoutWrapper
│   ├── seo/          # StructuredData
│   └── shared/       # Shared components (Logo, etc.)
├── lib/
│   ├── utils.ts      # cn() helper
│   └── blog.ts       # Static blog data (samplePosts array)
└── hooks/
    ├── use-toast.ts
    ├── use-debounce.ts
    └── use-mobile.tsx
```

## Pages
`/` `/about` `/pricing` `/terms` `/privacy` `/contact` `/faq` `/help` `/docs` `/acfi-certificate` `/how-selling-works` `/how-buying-works` `/seller-services` `/buyer-services` `/resources` `/resources/[slug]`

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
