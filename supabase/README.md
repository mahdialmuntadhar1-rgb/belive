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
| `governorates` | 17 | Governorate names with translations |
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
├── 005_metadata_tables.sql ← categories, governorates, cities (APPLY TO LIVE)
├── 006_rls_policies.sql    ← RLS reference documentation
└── 007_functions.sql       ← increment_likes + other functions (APPLY TO LIVE)

supabase/seed/
├── 001_categories.sql      ← 10 categories with AR/KU translations (APPLY TO LIVE)
└── 002_governorates.sql    ← 17 governorates with AR/KU translations (APPLY TO LIVE)
```

### Which files to apply to the live DB

| File | Apply to live? | Notes |
|------|---------------|-------|
| `001_profiles.sql` | NO | table exists |
| `002_businesses.sql` | NO | 1,800 rows exist, do not recreate |
| `003_content_tables.sql` | NO | tables exist with sample data |
| `004_claim_reviews.sql` | NO | tables exist |
| `005_metadata_tables.sql` | **YES** | tables are missing, needed for filters |
| `006_rls_policies.sql` | NO | reference only |
| `007_functions.sql` | **YES** | `increment_likes` is missing, needed by usePosts |
| `seed/001_categories.sql` | **YES** | needed for category filter UI |
| `seed/002_governorates.sql` | **YES** | needed for governorate filter UI |

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

If Google OAuth is not configured, the button in `AuthModal.tsx` will show  
a user-friendly error. Do not remove the UI — configure it properly or  
disable it cleanly (Phase 3 work).

### Profile auto-creation
The `handle_new_user` trigger on `auth.users` automatically creates a row in  
`profiles` on signup. The trigger is already active on the live DB.

**Known issue**: `authStore.ts` also tries to insert `email` into `profiles`  
during signup, but `profiles` has no `email` column. This causes a silent  
error. The trigger-created profile is correct. Fix tracked in Phase 3.

---

## RLS Summary

- **Public read** on `businesses`, `posts`, `stories`, `events`, `deals`,  
  `business_postcards`, `categories`, `governorates`, `cities`, `reviews`
- **Auth-only write** for `profiles`, `business_claims`, `reviews`, `posts`
- **Admin-only** (by email) for managing `business_claims` status

---

## Known Issues (to fix in later phases)

| Issue | Phase |
|-------|-------|
| `usePosts.ts` queries wrong column names (snake_case vs camelCase) | Phase 5 |
| `authStore.ts` inserts `email` into `profiles` (column missing) | Phase 3 |
| `useBusinessManagement.ts` writes snake_case to camelCase businesses table | Phase 6 |
| `business_claims.business_id` is uuid but `businesses.id` is text | Phase 6 |
| `increment_likes` RPC missing from live DB | Phase 1 (apply 007_functions.sql) |
| No `categories`/`governorates`/`cities` tables | Phase 1 (apply 005 + seeds) |

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
