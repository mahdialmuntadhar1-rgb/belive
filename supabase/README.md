# Supabase Backend Setup

**Project**: mahdialmuntadhar1-rgb/belive  
**Live instance**: `hsadukhmcclwixuntqwu` (ap-northeast-2)  
**Status**: Active — 1,800 businesses in production

---

## Quick Reference

| What | Value |
|------|-------|
| Supabase URL | `https://hsadukhmcclwixuntqwu.supabase.co` |
| Region | ap-northeast-2 (Seoul) |
| Postgres | 17.6.1 |
| Businesses | 1,800 rows |
| Auth | Email/password + Google OAuth |

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
VITE_SUPABASE_URL=https://hsadukhmcclwixuntqwu.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key from Supabase dashboard>
```

The anon key is safe to use client-side — it is restricted by RLS policies.  
Never expose the service_role key in frontend code.

---

## Schema Overview

### Core tables (frontend-facing)

| Table | Rows | Purpose |
|-------|------|---------|
| `businesses` | 1,800 | Main business directory |
| `profiles` | — | Auth user profiles (linked to auth.users) |
| `posts` | — | Business status updates / feed |
| `stories` | — | Story bubbles |
| `events` | — | Local events |
| `deals` | — | Time-limited promotions |
| `business_postcards` | — | Rich visual business cards |
| `business_claims` | — | Owner claim requests |
| `reviews` | — | User star ratings and comments |
| `categories` | 10 | Category display names with translations |
| `governorates` | 18 | Governorate names with translations (incl. Halabja) |
| `cities` | — | City names per governorate |

### Pipeline tables (scraper system — not used by frontend)
`raw_businesses`, `verified_businesses`, `agents`, `agent_tasks`,  
`agent_logs`, `businesses_import`, `csv_uploaded_businesses`,  
`businesses_cleaned_master`, `sync_runs`

---

## Column Naming Convention

The `businesses` table uses **camelCase** column names (with SQL double-quotes):
- `"nameAr"`, `"nameKu"`, `"imageUrl"`, `"isFeatured"`, etc.

The `posts`, `stories`, `deals`, `events` tables also use camelCase.

The `profiles`, `business_claims`, `reviews` tables use **snake_case**.

This inconsistency is a known artifact of the import pipeline.  
Frontend code must handle both where needed (see `useBusinesses.ts`).

---

## Migration Files

```
supabase/migrations/
├── 001_profiles.sql        ← profiles table + handle_new_user trigger
├── 002_businesses.sql      ← businesses table schema (DO NOT run on live)
├── 003_content_tables.sql  ← posts, stories, events, deals, postcards
├── 004_claim_reviews.sql   ← business_claims, reviews
├── 005_metadata_tables.sql ← categories, governorates, cities ✅ applied
├── 006_rls_policies.sql    ← RLS reference documentation
├── 007_functions.sql       ← increment_likes + other functions ✅ applied
└── 008_add_halabja_governorate.sql ← Halabja (18th governorate) ✅ applied

supabase/seed/
├── 001_categories.sql      ← 10 categories with AR/KU translations ✅ applied
└── 002_governorates.sql    ← 17 governorates with AR/KU translations ✅ applied
```

### Status of live DB migrations

| File | Status | Notes |
|------|--------|-------|
| `001_profiles.sql` | ✅ exists | do not re-run |
| `002_businesses.sql` | ✅ exists | 1,800 rows, do not recreate |
| `003_content_tables.sql` | ✅ exists | do not re-run |
| `004_claim_reviews.sql` | ✅ exists | do not re-run |
| `005_metadata_tables.sql` | ✅ applied | categories + governorates live |
| `006_rls_policies.sql` | reference only | do not run |
| `007_functions.sql` | ✅ applied | increment_likes live |
| `008_add_halabja_governorate.sql` | ✅ applied | 18 governorates now |
| `seed/001_categories.sql` | ✅ applied | 10 categories live |
| `seed/002_governorates.sql` | ✅ applied | 17 base governorates live |

---

## Applying Pending Migrations

Run the following in the Supabase SQL Editor (or via Supabase CLI):

```sql
-- Step 1: Create metadata tables
\i supabase/migrations/005_metadata_tables.sql

-- Step 2: Add missing increment_likes function
\i supabase/migrations/007_functions.sql

-- Step 3: Seed categories (10 rows)
\i supabase/seed/001_categories.sql

-- Step 4: Seed governorates (17 rows)
\i supabase/seed/002_governorates.sql
```

---

## Auth Setup

### Email/Password
Works out of the box. Supabase Auth handles it.

### Google OAuth
1. Go to Supabase Dashboard → Authentication → Providers → Google
2. Enable Google
3. Add your Google OAuth Client ID and Secret
4. Add redirect URL to Google Console: `https://hsadukhmcclwixuntqwu.supabase.co/auth/v1/callback`
5. Add site URL in Supabase: your production domain

If `VITE_GOOGLE_CLIENT_ID` is not set in `.env.local`, the Google login button  
renders as disabled (grey + tooltip). Email/password auth always works.

### Profile auto-creation
The `handle_new_user` trigger on `auth.users` automatically creates a row in  
`profiles` on signup. The trigger is active on the live DB.  
`authStore.ts` does NOT manually insert profiles — the trigger handles it.

---

## RLS Summary

- **Public read** on `businesses`, `posts`, `stories`, `events`, `deals`,  
  `business_postcards`, `categories`, `governorates`, `cities`, `reviews`
- **Auth-only write** for `profiles`, `business_claims`, `reviews`, `posts`
- **Admin-only** (by email) for managing `business_claims` status

---

## Resolved Issues (all phases complete)

| Issue | Resolved in |
|-------|-------------|
| `usePosts.ts` queried wrong column names (snake_case vs camelCase) | Phase 2 |
| `authStore.ts` inserted `email` into `profiles` (column missing) | Phase 2 |
| `authStore.ts` Profile interface declared non-existent email/avatar_url fields | Phase 3 |
| `/dashboard` route had no auth protection | Phase 3 |
| Google OAuth button was always active even when not configured | Phase 3 |
| `useBusinessManagement.ts` used snake_case writes on camelCase businesses table | Phase 2 |
| `getOwnedBusinesses` queried `owner_id` instead of camelCase `ownerId` | Phase 6 |
| `claimBusiness` bypassed `business_claims` table (direct ownerId update) | Phase 6 |
| `increment_likes` RPC missing from live DB | Phase 1 |
| No `categories`/`governorates` tables | Phase 1 |
| Governorate filter defaulted to "Baghdad" showing only 100/1,800 businesses | Phase 0 |
| Category filter used internal IDs instead of DB English names | Phase 0 |
| Changing governorate did not reset selected category | Phase 4 |
| Halabja (Iraq's 18th governorate) missing from DB | Phase 4 |
| StoryRow used hardcoded mock data | Phase 5 |
| TrendingSection getCategoryName used wrong ID mapping | Phase 5 |
| FeedComponent filtered out posts without matching loaded business | Phase 5 |

---

## Fresh Instance Setup (new Supabase project)

```bash
# 1. Install Supabase CLI
npm install -g supabase

# 2. Link to project
supabase link --project-ref hsadukhmcclwixuntqwu

# 3. Apply migrations in order
supabase db push

# 4. Or run manually in SQL Editor in this order:
#    001 → 002 → 003 → 004 → 005 → 006 → 007
#    Then seeds: 001 → 002
```
