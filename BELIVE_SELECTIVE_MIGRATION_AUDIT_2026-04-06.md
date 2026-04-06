# BELIVE Selective Migration Audit (HUMUPLUS/HUMUS → belive)

**Date:** 2026-04-06 (UTC)  
**Target final repo:** `mahdialmuntadhar1-rgb/belive`

## Scope & Access Reality

I audited the local `belive` repository deeply and attempted to fetch both source repos for direct code-to-code diff:

- `https://github.com/mahdialmuntadhar1-rgb/HUMUPLUS.git`
- `https://github.com/mahdialmuntadhar1-rgb/HUMUS.git`

The environment returned `CONNECT tunnel failed, response 403`, so direct remote cloning was **blocked** in this run. Therefore:

1. Findings below are based on belive’s actual current code and embedded HUMUS/HUMUPLUS-related docs/history.
2. Wherever HUMUPLUS/HUMUS implementation details are unknown, recommendations are explicit and conditional.

---

## Executive Verdict

## **belive status: PARTIALLY TRANSFERRED**

belive is strong on core Supabase-backed directory/auth/feed architecture, but still has clear production gaps and placeholder surfaces that suggest transfer is not fully complete:

- `Scraper` route is placeholder UI only.
- `Review` route is placeholder UI only.
- `supabaseClient` still embeds hardcoded anon credential fallback.
- App still carries legacy Gemini-related dependency/config not needed for Supabase-only public app.
- No explicit deployment config file (`vercel.json`/equivalent) and no visible first-class upload/storage flow despite dashboard post creation UX.

So belive is **not yet the final single public full-stack repo** without a final selective migration and cleanup pass.

---

## What belive already has (important full-stack pieces)

### Already present and production-relevant

1. **Supabase client wiring** with Vite env support (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
2. **Real data fetching** via hooks for businesses, posts, metadata, and business management.
3. **Auth wiring** with Supabase auth listener, profile hydration/upsert fallback, and protected owner dashboard route.
4. **Database contract assets** under `supabase/migrations` + seeds + setup docs.
5. **PWA integration** through `vite-plugin-pwa` and web manifest.
6. **Owner dashboard features** for business profile updates + post publishing.
7. **Multilingual/state layer** via Zustand + translation module.

---

## Classification matrix (what to move vs avoid)

## A) Already present in belive

- `src/lib/supabaseClient.ts` (Supabase client init, env-driven).
- `src/hooks/useBusinesses.ts` (real listing + filters + pagination).
- `src/hooks/usePosts.ts` (real posts + `increment_likes` RPC usage).
- `src/hooks/useMetadata.ts` (live categories/governorates/cities).
- `src/hooks/useBusinessManagement.ts` (claim + profile update + owner business fetch).
- `src/stores/authStore.ts` + `src/components/auth/ProtectedRoute.tsx` (auth state + route guard).
- `supabase/migrations/*` and `supabase/seed/*` (backend contract artifacts).
- `vite.config.ts` + `public/manifest.webmanifest` (PWA pipeline exists).

## B) Missing in belive and should be copied **if present in HUMUPLUS/HUMUS**

> These are the most likely critical misses to pull in surgically.

1. **Real Scraper implementation** replacing placeholder page:
   - target file currently placeholder: `src/pages/Scraper.tsx`
   - pull only real production scraper UI/service wiring if source repo has it.
2. **Real Review implementation** replacing placeholder page:
   - target file currently placeholder: `src/pages/Review.tsx`
   - pull review submission/listing logic only if it uses Supabase and app schema.
3. **Supabase Storage upload helpers + signed URL flow** (if source has these):
   - look for modules like `src/lib/storage*`, upload services, bucket policy docs.
   - integrate into dashboard post/profile image creation to replace raw URL-only inputs.
4. **Deployment hardening files** (if source has):
   - `vercel.json`, CSP/security headers, SPA rewrites, build cache tuning.
5. **Production bugfix utilities** for feed/business mapping edge cases:
   - especially null-safe business lookup for posts when related business not loaded.
6. **Env validation tooling** (if source has stronger implementation):
   - startup fail-fast validation, typed env schema, CI check.

## C) Useful but optional

- Stronger observability (error boundary/Sentry/log service), if present.
- Additional data mappers/normalizers to reduce camelCase/snake_case drift.
- CI workflows for lint/build/typecheck/smoke tests.
- Admin moderation interfaces for claims/reviews (if public app requirements include this).

## D) Outdated / dangerous / should NOT be copied

1. **Any Firebase auth/firestore/storage modules** (conflicts with Supabase-first architecture).
2. **Any mock-data generators hardwired into runtime UI**.
3. **Any old category ID mapping (`dining`, `cafe`, etc.) as filter source of truth** when DB uses canonical names.
4. **Any code that directly sets ownership without `business_claims` workflow**.
5. **Any source secrets / hardcoded keys / service-role keys**.
6. **Any legacy AI/Gemini frontend coupling not required for directory app**.

---

## belive files that should NOT be overwritten

Protect these because they contain newer branding/layout/state integration and working Supabase plumbing:

- `src/pages/HomePage.tsx`
- `src/components/home/*` (selective patch only, no blind replace)
- `src/styles/humus-design.css`
- `src/stores/homeStore.ts`
- `src/i18n/ui.ts`
- `src/hooks/useBusinesses.ts`
- `src/hooks/useMetadata.ts`
- `src/hooks/useBusinessManagement.ts`
- `src/stores/authStore.ts`
- `src/components/auth/AuthModal.tsx`
- `src/components/auth/ProtectedRoute.tsx`
- `supabase/migrations/*` and `supabase/seed/*`

Rule: copy missing logic as isolated modules first, then integrate through small targeted imports.

---

## belive current red flags to fix before calling it final

1. **Placeholder product routes**:
   - `src/pages/Scraper.tsx`
   - `src/pages/Review.tsx`
2. **Hardcoded Supabase anon fallback in client code** (`src/lib/supabaseClient.ts`).
3. **Legacy non-Supabase coupling still present**:
   - `@google/genai` dependency in `package.json`
   - `process.env.GEMINI_API_KEY` define in `vite.config.ts`
4. **Potential runtime null bug in feed contact bar**:
   - Feed resolves `business` by ID, then uses `business.phone` without guarding missing lookup.

---

## Safe selective migration order (recommended)

1. **Snapshot & guardrails**
   - Create safety branch and tag.
   - Add baseline tests/build checks.
2. **Migrate missing backend-adjacent modules first**
   - scraper/review services, storage/upload helpers, env validation helpers.
   - no UI overwrite yet.
3. **Replace placeholder routes only**
   - patch `src/pages/Scraper.tsx` and `src/pages/Review.tsx` to real Supabase implementations.
4. **Integrate storage uploads**
   - wire dashboard image flows to upload helper (fallback to URL optional).
5. **Remove unsafe legacy config**
   - remove hardcoded Supabase fallback creds.
   - remove unused Gemini dependency/config if unused after migration.
6. **Deployment hardening**
   - add/merge deployment config from source (only production-safe parts).
7. **Regression pass**
   - auth (email+Google), browse/filter, posts/likes, claim flow, dashboard updates, PWA install/offline shell.

---

## Can belive be the final true public app repo after these changes?

**Yes — conditionally.**

If the selective migration above is completed (especially replacing placeholder Scraper/Review and removing risky credential fallback), belive can be treated as the single final public full-stack repo.

Without those targeted transfers/cleanups, it remains **partially transferred**.
