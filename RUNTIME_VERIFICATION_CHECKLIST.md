# Runtime Verification Checklist

Use this checklist to validate that the Build Mode migration to Supabase is working correctly.

## Prerequisites

- Supabase schema executed (`supabase_schema_v2.sql`)
- Storage bucket `build-mode-images` created
- `.env.local` configured with Supabase credentials
- At least one user has `role = 'admin'` in `profiles` table
- Dev server running (`npm run dev`)

## Test 1: Logged Out Public View

**Objective:** Verify the app loads correctly for anonymous users

### Steps
1. Open browser in incognito/private mode
2. Navigate to `http://localhost:3000`
3. Verify homepage loads without errors

### Expected Results
- ✅ Homepage loads successfully
- ✅ Hero section displays slides from Supabase (or empty if no data)
- ✅ No Build Mode toggle visible
- ✅ No admin FAB visible
- ✅ No console errors related to Supabase

### Evidence
- [ ] Screenshot of homepage
- [ ] Browser console log (no errors)
- [ ] Network tab (successful Supabase queries)

**Status:** ___ PASS / FAIL / BLOCKED

---

## Test 2: Admin Login

**Objective:** Verify admin user can log in and access admin features

### Steps
1. Log in with admin account (role = 'admin')
2. Navigate to homepage
3. Verify admin FAB appears
4. Click admin FAB to navigate to `/admin`

### Expected Results
- ✅ Login successful
- ✅ Admin FAB visible in bottom-right corner
- ✅ Clicking FAB navigates to `/admin`
- ✅ Admin dashboard loads
- ✅ No console errors

### Evidence
- [ ] Screenshot of homepage with admin FAB
- [ ] Screenshot of admin dashboard
- [ ] Browser console log (no errors)

**Status:** ___ PASS / FAIL / BLOCKED

---

## Test 3: Build Mode Access

**Objective:** Verify Build Mode is accessible only to admins

### Steps
1. As logged-in admin, look for Build Mode toggle in header
2. Click Build Mode toggle to enable
3. Verify Build Mode editor panel opens

### Expected Results
- ✅ Build Mode toggle visible in header
- ✅ Clicking toggle enables Build Mode
- ✅ Build Mode editor panel slides in from right
- ✅ Editor shows "Admin-only access" message
- ✅ No URL param `?builder=1` needed

### Evidence
- [ ] Screenshot of Build Mode toggle
- [ ] Screenshot of Build Mode editor panel
- [ ] Browser console log (no errors)

**Status:** ___ PASS / FAIL / BLOCKED

---

## Test 4: Hero Slides from Supabase

**Objective:** Verify hero slides load from Supabase hero_slides table

### Steps
1. In Supabase dashboard, check `hero_slides` table
2. Verify at least one slide with `is_active = true`
3. On homepage, inspect hero section
4. Check browser Network tab for Supabase query

### Expected Results
- ✅ Hero slides exist in Supabase table
- ✅ Network tab shows query to `hero_slides` table
- ✅ Hero section displays slides from Supabase
- ✅ No dependency on `heroContent.ts` file
- ✅ Language switching works (en/ar/ku)

### Evidence
- [ ] Supabase table screenshot (hero_slides)
- [ ] Network tab screenshot (Supabase query)
- [ ] Browser console log (successful fetch)
- [ ] Code inspection: HeroSection.tsx uses `useAdminDB.fetchHeroSlides()`

**Status:** ___ PASS / FAIL / BLOCKED

---

## Test 5: Feed Sections from Supabase

**Objective:** Verify feed sections load from Supabase feed_sections table

### Steps
1. In Supabase dashboard, check `feed_sections` table
2. Verify at least one section with `is_active = true`
3. On homepage, scroll to feed section area
4. Check browser Network tab for Supabase query

### Expected Results
- ✅ Feed sections exist in Supabase table
- ✅ Network tab shows query to `feed_sections` table
- ✅ Feed sections display on homepage
- ✅ FeedSections.tsx component is used

### Evidence
- [ ] Supabase table screenshot (feed_sections)
- [ ] Network tab screenshot (Supabase query)
- [ ] Browser console log (successful fetch)

**Status:** ___ PASS / FAIL / BLOCKED

---

## Test 6: Posts from Supabase

**Objective:** Verify posts load from Supabase posts table with is_active filter

### Steps
1. In Supabase dashboard, check `posts` table
2. Verify posts have `is_active = true`
3. Navigate to Social Feed tab
4. Check browser Network tab for Supabase query

### Expected Results
- ✅ Posts exist in Supabase table
- ✅ Network tab shows query to `posts` table with `is_active=true` filter
- ✅ Posts display in Social Feed
- ✅ Only active posts are shown (inactive posts filtered out)

### Evidence
- [ ] Supabase table screenshot (posts)
- [ ] Network tab screenshot (Supabase query with filter)
- [ ] Browser console log (successful fetch)

**Status:** ___ PASS / FAIL / BLOCKED

---

## Test 7: Image Upload to Supabase Storage

**Objective:** Verify image uploads go to Supabase Storage, not local file system

### Steps
1. As admin, enable Build Mode
2. Open hero slide editor
3. Upload a new image
4. Check Supabase Storage for uploaded file
5. Check browser Network tab for upload request

### Expected Results
- ✅ Image upload succeeds
- ✅ Network tab shows upload to Supabase Storage
- ✅ File appears in Supabase Storage `build-mode-images/hero/` folder
- ✅ Public URL returned and saved to database
- ✅ No local file system write

### Evidence
- [ ] Supabase Storage screenshot (uploaded file)
- [ ] Network tab screenshot (upload request)
- [ ] Browser console log (successful upload)
- [ ] Code inspection: ImageUploader.tsx uses `useAdminDB.uploadImage()`

**Status:** ___ PASS / FAIL / BLOCKED

---

## Test 8: Non-Admin Blocked from Build Mode

**Objective:** Verify non-admin users cannot access Build Mode

### Steps
1. Log out as admin
2. Log in as regular user (role != 'admin')
3. Navigate to homepage
4. Try to access Build Mode via URL (`?builder=1` or direct route)
5. Check if Build Mode toggle appears

### Expected Results
- ✅ Build Mode toggle NOT visible
- ✅ Build Mode editor panel does NOT open
- ✅ URL param `?builder=1` does NOT enable Build Mode
- ✅ Access denied message or silent fail
- ✅ No localStorage-based access

### Evidence
- [ ] Screenshot of homepage (no Build Mode toggle)
- [ ] Browser console log (access denied or no access)
- [ ] Code inspection: BuildModeEditor.tsx checks `profile.role === 'admin'`

**Status:** ___ PASS / FAIL / BLOCKED

---

## Test 9: Console and Network Health

**Objective:** Verify no errors in console or network failures

### Steps
1. Open browser DevTools
2. Navigate to Console tab
3. Navigate to Network tab
4. Perform all above tests
5. Check for errors throughout

### Expected Results
- ✅ No console errors (red text)
- ✅ No network failures (404, 500, etc.)
- ✅ All Supabase queries successful (200 OK)
- ✅ No localStorage warnings for Build Mode
- ✅ No deprecated API warnings

### Evidence
- [ ] Console log screenshot (clean)
- [ ] Network tab screenshot (all successful)
- [ ] List of any warnings/errors found

**Status:** ___ PASS / FAIL / BLOCKED

---

## Test 10: Admin Dashboard Access

**Objective:** Verify `/admin` route is protected

### Steps
1. As logged-out user, try to access `http://localhost:3000/admin`
2. Verify redirect to login or home
3. As admin, access `http://localhost:3000/admin`
4. Verify dashboard loads

### Expected Results
- ✅ Non-admins redirected from `/admin`
- ✅ Admins can access `/admin`
- ✅ AdminRoute component working correctly

### Evidence
- [ ] Screenshot of redirect (non-admin)
- [ ] Screenshot of admin dashboard (admin)
- [ ] Browser console log (no errors)

**Status:** ___ PASS / FAIL / BLOCKED

---

## Summary

### Total Tests: 10
### Passed: ___
### Failed: ___
### Blocked: ___

### Critical Blockers
- [ ] List any critical issues preventing deployment

### Non-Critical Issues
- [ ] List any minor issues to address later

### Overall Status
- ___ READY FOR DEPLOYMENT
- ___ NEEDS FIXES BEFORE DEPLOYMENT
- ___ MAJOR ISSUES - DO NOT DEPLOY

---

## Notes

Add any additional observations or issues found during testing:

- 
- 
- 

---

## Sign-off

**Tester:** _______________
**Date:** _______________
**Result:** _______________
