# BELIVE — Iraqi Business Directory

A production-ready, Supabase-backed Iraqi business directory app.  
Multilingual (English / Arabic / Kurdish), mobile-first, PWA-enabled.

**Live data**: 1,800 verified businesses across 17 Iraqi governorates  
**Tech**: React 19 · TypeScript · Vite · TailwindCSS 4 · Supabase · Zustand

---

## Features

- Browse 1,800 real Iraqi businesses
- Filter by governorate (17) and category (10)
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
| 1 | Backend contract — schema docs, missing tables | ✅ Done |
| 2 | Shared data layer — hooks, typed queries | 🔜 Next |
| 3 | Auth — fix profile creation, Google OAuth | 🔜 |
| 4 | Business directory — filters, pagination, null safety | 🔜 |
| 5 | Feed system — posts, stories, events, deals | 🔜 |
| 6 | Owner dashboard — claim flow, post publishing | 🔜 |
| 7 | Multilingual UI | 🔜 |
| 8 | Scripts / public assets / docs | 🔜 |
| 9 | Documentation cleanup | 🔜 |
