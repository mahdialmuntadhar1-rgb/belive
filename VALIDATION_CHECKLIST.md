# MyCity & Shakumaku - Validation Checklist

**Status:** Fixes applied - waiting for database configuration

---

## MYCITY VALIDATION

### ✅ FIXED: Featured Section Data Loss
- **File:** `src/hooks/useFeaturedBusinesses.ts` (NEW)
- **File:** `src/components/home/DirectoryTabPanel.tsx`
- **Change:** Featured businesses now fetched independently of pagination
- **Result:** Featured section shows available featured businesses regardless of pagination state
- **Test:** Load page → Featured section should show all featured businesses (up to 10)

### ⚠️ PARTIAL: Search + Category Filter
- **File:** `src/hooks/useBusinesses.ts`
- **Status:** Code structure is correct, OR filter applied to search only
- **Note:** Behavior depends on Supabase query execution - verify category field matches CATEGORIES IDs
- **Test:** Select category "cafe" + search "coffee" → should return cafes with "coffee" in name/description

### ⚠️ KNOWN: Pagination-Category Mismatch
- **Issue:** Page-based fetch (24 items) vs category grouping (3 per category) are orthogonal
- **Status:** This is architectural - no surgical fix without redesign
- **Workaround:** Category "Load More" reveals more from current page; global "Load More" fetches next page
- **Action:** Acceptable behavior but users should understand both load more buttons have different scope

---

## SHAKUMAKU VALIDATION

### ✅ FIXED: Missing Table Exception Handling
- **File:** `src/hooks/usePosts.ts`
- **Changes:**
  - PAGE_SIZE increased from 10 → 20 (better initial volume)
  - Added explicit error logging for missing business_postcards table
  - Console will show: `❌ CRITICAL: business_postcards table missing or schema mismatch`
- **Test:** Open Shakumaku tab → check console for errors

### ✅ FIXED: Error Visibility
- **File:** `src/components/home/SocialFeed.tsx`
- **Changes:**
  - If business_postcards table is missing: shows error message "business_postcards table may be missing from database"
  - Fallback posts only generated if error is NULL (table exists but empty)
- **Test:** Open Shakumaku tab → if table missing, shows clear error instead of silent fallback

### ✅ IMPROVED: Fallback Logic
- **File:** `src/components/home/SocialFeed.tsx`
- **Changes:**
  - Fallback now checks `error` state - won't use generated posts if real fetch failed
  - Dependencies updated to include `postsLoading` and `error`
- **Test:** If business_postcards table missing → shows error, not generated posts

---

## DATA PIPELINE VALIDATION

### ⚠️ CRITICAL: business_postcards Table Status
**BLOCKER FOR SHAKUMAKU:**
- Migration file created: `supabase/migrations/001_relax_business_postcards_constraints.sql`
- Migration NOT YET APPLIED to Supabase
- Table likely missing
- Seed script created but can't run until table exists

**Action Required:**
```sql
-- Run in Supabase SQL Editor to create/modify table
ALTER TABLE business_postcards
  ALTER COLUMN category_tag DROP NOT NULL,
  ALTER COLUMN neighborhood DROP NOT NULL,
  ALTER COLUMN governorate DROP NOT NULL,
  ALTER COLUMN city DROP NOT NULL,
  ALTER COLUMN lat DROP NOT NULL,
  ALTER COLUMN lng DROP NOT NULL,
  ALTER COLUMN rating DROP NOT NULL,
  ALTER COLUMN address DROP NOT NULL;

NOTIFY pgrst, 'reload schema';
```

### ⚠️ VERIFY: Database Schema
- Confirm `businesses.category` field values match CATEGORIES constant IDs
- Confirm `business_postcards` table exists with columns:
  - `id`, `business_id`, `caption`, `image_url`, `likes_count`, `created_at`, `title`, `city`, `governorate`, `category_tag`, etc.
- Confirm nullable constraints applied

### ⚠️ VERIFY: Search Behavior
- Select category "cafe"
- Search "coffee"
- Should see: cafes with "coffee" in name/description
- If behavior is wrong: issue is in category filter logic

---

## POST-FIX TESTING CHECKLIST

### MyCity Tab
- [ ] Load page → displays businesses grouped by category
- [ ] Each category shows 3 items initially
- [ ] Click "Load More" in category → expands to 6 items
- [ ] Featured section shows featured businesses (not empty if they exist)
- [ ] Select city filter → businesses update correctly
- [ ] Select category filter → shows only that category
- [ ] Search for business name → returns matching businesses
- [ ] Click global "Load More" → fetches next 24 businesses

### Shakumaku Tab
- [ ] Load page → shows posts from business_postcards table
- [ ] Shows ~20 posts initially (PAGE_SIZE=20)
- [ ] Each post has: caption, image, likes, author name
- [ ] Captions are in Arabic if posts were seeded
- [ ] Click "Load More" → loads next 20 posts
- [ ] If table missing: shows error message (not silent fallback)
- [ ] If table exists but empty: shows generated posts from businesses

### Error Handling
- [ ] Open DevTools Console
- [ ] Check for errors about missing tables
- [ ] Verify no "TypeError: Cannot read property..." errors
- [ ] Verify no infinite loops (Network tab should show finite requests)

---

## SUMMARY

### Fixed Issues
1. ✅ Featured section now independent of pagination
2. ✅ Explicit error handling for missing business_postcards table
3. ✅ Better error visibility in UI
4. ✅ Improved initial volume for Shakumaku (PAGE_SIZE 10→20)
5. ✅ Fixed fallback logic to not hide errors

### Remaining Actions
1. ⏳ **CRITICAL:** Apply database migration to create/modify business_postcards table
2. ⏳ Run seed script to populate 50 sample posts
3. ⏳ Verify database schema matches expected columns

### Known Limitations (Architectural)
- Pagination (24 items/page) doesn't align with category grouping (3 per category)
- This is by design and acceptable with both "Load More" options available
- Upgrading would require fetching all businesses or restructuring queries (redesign)

---

## DEPLOYMENT CHECKLIST

Before going live:
1. [ ] Confirm business_postcards table exists with correct schema
2. [ ] Run seed script: `npx ts-node scripts/seed-business-postcards.ts`
3. [ ] Test MyCity → All categories show businesses
4. [ ] Test MyCity → Featured section populated
5. [ ] Test Shakumaku → Shows 20+ posts
6. [ ] Test Shakumaku → No error messages in console
7. [ ] Test Search → Works within selected category
8. [ ] Test Load More → Pagination works on both tabs
