# BELIVE — Iraqi Business Directory

A production-ready, Supabase-backed Iraqi business directory app.  
Multilingual (English / Arabic / Kurdish), mobile-first, PWA-enabled.

**Live data**: 1,800 verified businesses across 18 Iraqi governorates  
**Tech**: React 19 · TypeScript · Vite · TailwindCSS 4 · Supabase · Zustand

---

## Features

- Browse 1,800 real Iraqi businesses
- Filter by governorate (18) and category (10)
- Bilingual business names (English, Arabic, Kurdish)
- Business owner dashboard — claim listing, publish posts
- Supabase Auth — email/password + Google OAuth
- Infinite scroll / load-more pagination
- PWA — installable, offline-capable
- RTL support for Arabic and Kurdish

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables
cp .env.example .env.local
# Edit .env.local — add your VITE_SUPABASE_ANON_KEY

# 3. Run locally
npm run dev
# → http://localhost:3000
```

The app will connect to the live Supabase instance and display real businesses.  
No mock data. No Gemini API key required.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon key (public-safe) |
| `VITE_GOOGLE_CLIENT_ID` | No | Google OAuth client (optional) |
| `VITE_APP_URL` | No | App base URL for OAuth redirect |

See `.env.example` for details.

---

## Project Structure

```
src/
├── components/
│   ├── auth/          AuthModal.tsx
│   ├── dashboard/     BusinessDashboard.tsx
│   └── home/          BusinessGrid · CategoryGrid · HeroSection
│                      LocationFilter · FeedComponent · TrendingSection
│                      BusinessDetailModal · StoryRow · PostFeed
├── hooks/
│   ├── useBusinesses.ts       business listing + filters + pagination
│   ├── useMetadata.ts         categories / governorates / cities from DB
│   ├── usePosts.ts            post feed
│   └── useBusinessManagement.ts  claim + update owned business
├── lib/
│   ├── supabase.ts            TypeScript interfaces
│   └── supabaseClient.ts      Supabase client init
├── pages/
│   └── HomePage.tsx           main page
├── stores/
│   ├── authStore.ts           Supabase auth state
│   └── homeStore.ts           filters + language (Zustand + persist)
└── styles/
    └── humus-design.css       design system tokens
```

---

## Backend

Supabase PostgreSQL — see [`supabase/README.md`](supabase/README.md) for:
- Full table schema
- RLS policy reference
- Auth setup (Google OAuth)
- Which migrations to apply to the live DB
- Known issues and phase roadmap

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on :3000 |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | TypeScript type-check |
| `npm run verify` | Check DB connectivity and table existence |

---

## Deployment

### Vercel (recommended)

1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy — Vite builds automatically

### Supabase Auth Redirect

Add your production domain to:  
Supabase Dashboard → Auth → URL Configuration → Site URL

---

## Status

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Safety — migration branch, snapshot, collision check | ✅ Done |
| 1 | Backend contract — schema docs, missing tables, seeds applied | ✅ Done |
| 2 | Shared data layer — hooks, typed queries, camelCase fixes | ✅ Done |
| 3 | Auth — Profile interface fixed, /dashboard protected, Google OAuth guarded | ✅ Done |
| 4 | Business directory — all 4 filter combos, category reset on governorate change, Halabja added | ✅ Done |
| 5 | Feed system — StoryRow → live categories, FeedComponent → live posts, TrendingSection category names fixed | ✅ Done |
| 6 | Owner dashboard — claim flow uses business_claims table, getOwnedBusinesses camelCase fix, Manage Business link wired | ✅ Done |
| 7 | Multilingual UI — centralized src/i18n/ui.ts with t() and useT() | ✅ Done |
| 8 | Scripts — verify-setup.js, README 18 governorates update | ✅ Done |
| 9 | Documentation cleanup | ✅ Done |

---

## i18n System

UI translations live in `src/i18n/ui.ts`.  
Import `t(key, lang)` for static usage or `useT()` hook for React components.  
Categories and governorates are translated at the DB level (useMetadata returns multilingual objects).

---

## Route Protection

`/dashboard` requires `business_owner` role (via `ProtectedRoute` component).  
Unauthenticated users and non-owner users are redirected to `/`.
