# Database Setup — Definitive Execution Guide

**Project**: hsadukhmcclwixuntqwu  
**Status**: READY TO EXECUTE  
**Last Updated**: April 20, 2026

---

## Executive Summary

The deployed frontend expects specific database tables, RLS policies, storage buckets, and RPC functions. This guide provides the exact sequence to execute SQL files to achieve complete alignment.

**FINAL ANSWER:**
- **File 1**: `supabase/FINAL_PRODUCTION_SETUP.sql` (REQUIRED)
- **File 2**: `supabase/020_MISSING_TABLES_AND_FUNCTIONS.sql` (REQUIRED)
- **File 3**: `supabase/010_auth_trigger.sql` (RECOMMENDED, idempotent)
- **Manual**: Create 3 storage buckets in Supabase UI (OR script will attempt it)

---

## SQL Files to Run (IN ORDER)

### Step 1: FINAL_PRODUCTION_SETUP.sql (CRITICAL)
**Purpose**: Core schema, RLS policies for main tables, indexes  
**Tables Created**:
- ✅ profiles
- ✅ businesses
- ✅ posts
- ✅ comments
- ✅ claim_requests
- ✅ post_likes
- ✅ hero_slides
- ✅ features

**RLS Policies**: Complete for all 8 tables ✅  
**Indexes**: Complete ✅  
**Storage Buckets**: Noted (manual creation recommended)

**Action**: Copy entire file → Paste in Supabase SQL Editor → Run

---

### Step 2: 020_MISSING_TABLES_AND_FUNCTIONS.sql (CRITICAL)
**Purpose**: Tables + functions that frontend code actually uses but FINAL doesn't include  
**Tables Created**:
- ✅ governorates (metadata - required for business listings)
- ✅ cities (metadata - required for business listings)
- ✅ categories (metadata - required for home page)
- ✅ reviews (used in BusinessDetailModal)
- ✅ likes (frontend uses `likes` table, not `post_likes`)

**RLS Policies**: All public read + authenticated write ✅  
**RPC Functions**: 
- ✅ `increment_likes(post_id)` - called when user likes post
- ✅ `decrement_likes(post_id)` - called when user unlikes post

**Indexes**: Complete ✅  
**Seed Data**: Populated (Iraq governorates + sample categories)

**Action**: Copy entire file → Paste in Supabase SQL Editor → Run

---

### Step 3: 010_auth_trigger.sql (OPTIONAL BUT RECOMMENDED)
**Purpose**: Auto-create profiles when new auth users sign up  
**Creates**:
- ✅ Function: `handle_new_user()`
- ✅ Trigger: `on_auth_user_created` (fires on auth.users INSERT)
- ✅ RLS policies for profiles table

**Why**: Prevents authentication failures when new users sign up  
**Status**: SAFE TO RUN MULTIPLE TIMES (uses DROP IF EXISTS)

**Action**: Copy entire file → Paste in Supabase SQL Editor → Run

---

## Manual Steps (Storage Buckets)

After running SQL files, create 3 public storage buckets:

**In Supabase Dashboard:**
1. Click **Storage** (left sidebar)
2. Click **Create New Bucket**
3. Create these 3 buckets (one at a time):

| Bucket Name | Privacy | Used By |
|------------|---------|---------|
| hero-images | Public | Homepage hero section image uploads |
| feed-images | Post images | Social feed post uploads |
| business-images | Public | Business directory logos |

**OR** the SQL script will attempt to create them (may fail if you lack service role permissions).

---

## Exact Execution Sequence

```
1. Open Supabase Dashboard
   URL: https://app.supabase.com/project/hsadukhmcclwixuntqwu

2. Open SQL Editor
   Click: SQL Editor (left sidebar)

3. Run File 1: FINAL_PRODUCTION_SETUP.sql
   - Click: New Query
   - Copy: supabase/FINAL_PRODUCTION_SETUP.sql (entire contents)
   - Paste: Into SQL Editor
   - Click: Run (or Cmd+Enter)
   - Wait: ✓ Success (green checkmark)

4. Run File 2: 020_MISSING_TABLES_AND_FUNCTIONS.sql
   - Click: New Query
   - Copy: supabase/020_MISSING_TABLES_AND_FUNCTIONS.sql (entire contents)
   - Paste: Into SQL Editor
   - Click: Run
   - Wait: ✓ Success

5. Run File 3: 010_auth_trigger.sql
   - Click: New Query
   - Copy: supabase/010_auth_trigger.sql (entire contents)
   - Paste: Into SQL Editor
   - Click: Run
   - Wait: ✓ Success

6. Create Storage Buckets (Manual)
   - Click: Storage (left sidebar)
   - Click: Create Bucket
   - Name: "hero-images" → Privacy: Public → Create
   - Name: "feed-images" → Privacy: Public → Create
   - Name: "business-images" → Privacy: Public → Create

7. Verify
   - Reload app: https://belive-1cfz.vercel.app/
   - Check console (F12): No 500 errors
   - Verify: Businesses load, posts load, hero slides load
```

---

## What Gets Created / What Already Exists

### FINAL_PRODUCTION_SETUP.sql Creates:
✅ profiles table  
✅ businesses table  
✅ posts table  
✅ comments table  
✅ claim_requests table  
✅ post_likes table (NOTE: NOT used by frontend, but safe to have)  
✅ hero_slides table  
✅ features table  
✅ 8 complete RLS policy sets  
✅ Performance indexes on all tables  

### 020_MISSING_TABLES_AND_FUNCTIONS.sql Creates:
✅ governorates table (MISSING from FINAL)  
✅ cities table (MISSING from FINAL)  
✅ categories table (MISSING from FINAL)  
✅ reviews table (MISSING from FINAL)  
✅ likes table (Frontend uses this, FINAL uses post_likes)  
✅ RLS policies for all 5 tables  
✅ increment_likes() RPC function  
✅ decrement_likes() RPC function  
✅ Indexes on all 5 tables  
✅ Seed data: 18 Iraq governorates + 5 sample categories  

### 010_auth_trigger.sql Creates:
✅ handle_new_user() function  
✅ on_auth_user_created trigger  
✅ RLS policies for profiles (overlaps with FINAL, safe)  

### Storage Buckets (Manual):
✅ hero-images (Public)  
✅ feed-images (Public)  
✅ business-images (Public)  

---

## Why This Order?

1. **FINAL_PRODUCTION_SETUP.sql FIRST**
   - Creates core tables profiles, businesses, posts
   - Sets up foundational RLS policies
   - Creates indexes
   - Other files depend on these

2. **020_MISSING_TABLES_AND_FUNCTIONS.sql SECOND**
   - References tables from FINAL (businesses, posts, auth.users)
   - Creates RPC functions for likes counting
   - Safe to run after FINAL exists

3. **010_auth_trigger.sql THIRD**
   - Depends on profiles table existing (created by FINAL)
   - Idempotent (safe to re-run)
   - Sets up signup automation

4. **Storage Buckets LAST**
   - Independent of SQL files
   - Uploaded images reference these bucket names
   - Can be created in UI while running SQL

---

## Verification Checklist

After executing all SQL files:

### Run This Verification Query
```sql
-- Copy this into a new SQL query and run it
SELECT 'profiles' AS table_name, COUNT(*) AS row_count FROM profiles
UNION ALL SELECT 'businesses', COUNT(*) FROM businesses
UNION ALL SELECT 'posts', COUNT(*) FROM posts
UNION ALL SELECT 'governorates', COUNT(*) FROM governorates
UNION ALL SELECT 'cities', COUNT(*) FROM cities
UNION ALL SELECT 'categories', COUNT(*) FROM categories
UNION ALL SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL SELECT 'likes', COUNT(*) FROM likes
UNION ALL SELECT 'hero_slides', COUNT(*) FROM hero_slides;
```

Expected result: 8 rows showing table names and record counts (mostly 0, governorates/categories have seed data)

### In Browser
- [ ] Reload app: https://belive-1cfz.vercel.app/
- [ ] Open DevTools: F12 → Console
- [ ] Check: NO 500 errors
- [ ] Verify: Businesses list loads
- [ ] Verify: Social feed loads
- [ ] Verify: Hero slide displays
- [ ] Verify: Categories show in homepage

---

## Troubleshooting

### Error: "relation 'X' does not exist"
- **Cause**: Running file 2 before file 1, or file 1 didn't complete
- **Fix**: Verify file 1 completed successfully, then re-run file 2

### Error: "permission denied for schema public"
- **Cause**: Not logged in as Supabase project owner
- **Fix**: Log out and log back in, ensure you're project owner

### Error: "FATAL: too many connections"
- **Cause**: Supabase connection limit hit (rare)
- **Fix**: Wait 5 minutes, try again

### Storage buckets fail to create via SQL
- **Cause**: Missing service role permissions
- **Fix**: Create buckets manually in Supabase UI (Storage → Create Bucket)

### App still shows 500 errors after setup
- **Cause**: RLS policies blocking queries (rare if script succeeds)
- **Fix**: Check console for specific error message, check RLS policies in Supabase dashboard

---

## Files Committed to GitHub

These files are in your repo, ready to copy:
- `supabase/FINAL_PRODUCTION_SETUP.sql` ✅
- `supabase/020_MISSING_TABLES_AND_FUNCTIONS.sql` ✅ (just created)
- `supabase/010_auth_trigger.sql` ✅

All committed to branch: `main`

---

## PRODUCTION READINESS

**After Running This Setup:**
- ✅ All 13 tables exist with correct columns
- ✅ All RLS policies allow correct access levels
- ✅ All indexes created for performance
- ✅ RPC functions for likes counting
- ✅ Storage buckets ready for image uploads
- ✅ Auth trigger auto-creates user profiles
- ✅ Seed data populated (governorates, categories)

**System Status**: PRODUCTION READY

**Frontend Deployment**: https://belive-1cfz.vercel.app/ (already live, waiting for DB)

---

## Time to Complete

| Step | Time | Task |
|------|------|------|
| 1 | 2 min | Run FINAL_PRODUCTION_SETUP.sql |
| 2 | 1 min | Run 020_MISSING_TABLES_AND_FUNCTIONS.sql |
| 3 | 30 sec | Run 010_auth_trigger.sql |
| 4 | 1 min | Create 3 storage buckets |
| 5 | 1 min | Verify in app |
| **Total** | **~6 minutes** | **Full setup** |

---

## Support

If any step fails:
1. Note the error message exactly
2. Check troubleshooting section above
3. Verify you're in correct Supabase project (hsadukhmcclwixuntqwu)
4. Try running SQL file again (scripts use DROP IF EXISTS, so idempotent)

All scripts are SAFE to re-run multiple times.

---

**Status**: Ready to execute. No code redesign needed. Just database configuration.
