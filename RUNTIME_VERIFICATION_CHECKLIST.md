# Runtime Verification Checklist - 6 Test Categories

## Prerequisites (MUST COMPLETE FIRST)

Before running these tests, you must have completed `SUPABASE_SETUP_REQUIRED.md`:

- [ ] SQL schema executed in Supabase
- [ ] Admin role set for mahdialmuntadhar1@gmail.com
- [ ] Test data inserted (3 heroes, 3 feeds, 4 posts)
- [ ] Storage bucket created
- [ ] `.env.local` file exists with correct credentials

---

## How to Start the App

```bash
cd /path/to/belive
npm run dev
```

The app will start on `http://localhost:5173` (Vite) or `http://localhost:3000` (Express).

---

## Test Category 1: Logged Out - Public View ✅

**Objective:** Verify public users see correct data and NO admin UI

### Test 1.1: Homepage Loads
```
Action:
1. Open http://localhost:5173 (or :3000)
2. Refresh page (Ctrl+F5 or Cmd+Shift+R)

Expected:
✅ Page loads without errors
✅ No "Supabase is not configured" warning
✅ Layout renders (header, hero, content, footer)
```

**Result:** __________________

### Test 1.2: Hero Section Loads
```
Action:
1. Look at the top of homepage (large image carousel)

Expected:
✅ Hero section visible
✅ Shows rotating images (3 test images)
✅ Auto-advances every 5 seconds
✅ Images are from Supabase storage (verify URL starts with hsadukhmcclwixuntqwu.supabase.co)
✅ NO "No Hero Content Available" message
```

**Result:** __________________

### Test 1.3: Feed Sections Load
```
Action:
1. Scroll down below hero section
2. Look for "Welcome to Belive", "Featured Businesses", "Explore Categories" sections

Expected:
✅ 3 feed sections visible
✅ Each has title, subtitle, content text
✅ Each has an image
✅ Sections are in correct order
✅ Layout responsive (mobile and desktop)
```

**Result:** __________________

### Test 1.4: Shaku Maku Posts Load
```
Action:
1. Scroll down further to "Shaku Maku" section
2. Look for post cards with images and captions

Expected:
✅ 4 posts visible (from test data)
✅ Posts show: image, caption, author name
✅ Posts are from Supabase (verify image URLs)
✅ NO Build Mode editor visible
```

**Result:** __________________

### Test 1.5: Build Mode Button NOT Visible
```
Action:
1. Look at header (top right)
2. Open DevTools (F12)

Expected:
✅ NO "Build Mode" button in header
✅ NO admin UI elements anywhere
✅ NO floating buttons or overlays
❌ If you see Build Mode button while logged out → FAIL
```

**Result:** __________________

### Test 1.6: Browser Console - No Errors
```
Action:
1. Open DevTools (F12)
2. Click Console tab
3. Refresh page (Ctrl+F5)
4. Watch for errors for 5 seconds

Expected:
❌ NO red error messages
❌ NO "Cannot find module" errors
❌ NO "401 Unauthorized" errors
❌ NO "404 Not Found" errors
✅ May see some yellow warnings (ok)
✅ Green messages about Supabase (ok)
```

**Result:** __________________

---

## Test Category 2: Admin Login - Build Mode Appears 🔐

**Objective:** Verify admin user can access Build Mode

### Test 2.1: Login Flow Works
```
Action:
1. Click "Login" or "Sign In" button in header
2. Complete authentication flow
3. Log in with: mahdialmuntadhar1@gmail.com
4. Complete any MFA/verification (if enabled)

Expected:
✅ Login completes successfully
✅ Redirected back to homepage
✅ Header shows user info (name or avatar)
✅ NO login errors
```

**Result:** __________________

### Test 2.2: Build Mode Button Appears
```
Action:
1. After login, look at header (top right)
2. Should see a "Build Mode" or "BUILD MODE" button

Expected:
✅ Build Mode button is visible
✅ Button is clickable
✅ Button shows even if you scroll
```

**Result:** __________________

### Test 2.3: Build Mode Editor Opens
```
Action:
1. Click the "Build Mode" button
2. Wait 2 seconds

Expected:
✅ Side panel slides in from right
✅ Panel title says "Admin Builder" or "Build Mode"
✅ Shows "Live Syncing" status
✅ Three tabs visible: Hero, Sections, Posts
✅ Tab contents show current data from Supabase
```

**Result:** __________________

### Test 2.4: Admin Dashboard Access
```
Action:
1. Click user profile (avatar/dropdown) in header
2. Click "Admin Dashboard" or similar
3. Navigate to /admin route

Expected:
✅ Admin dashboard loads
✅ Shows hero/feed/post management sections
✅ NO "Access Denied" error
✅ Can see edit forms for content
```

**Result:** __________________

---

## Test Category 3: Admin Content Editing - Persistence ✏️

**Objective:** Verify admin can edit content and changes persist

### Test 3.1: Hero Image Upload
```
Action:
1. In Build Mode, click Hero tab
2. Click "Upload" or "Add Image" button
3. Select a JPG or PNG from your computer
4. Wait for upload to complete
5. Refresh page (Ctrl+F5)

Expected:
✅ Image appears in hero list immediately after upload
✅ Image is from Supabase storage (URL shows build-mode-images/hero/)
✅ Image appears on homepage (slides through rotation)
✅ After refresh: image STILL there
✅ NO upload errors in console
```

**Result:** __________________

### Test 3.2: Edit Feed Section Title
```
Action:
1. In Build Mode, click Sections tab
2. Find a feed section (e.g., "Welcome to Belive")
3. Click edit/pencil icon
4. Change title to "Test Title [timestamp]"
5. Click Save
6. Refresh page

Expected:
✅ Title updates immediately in editor
✅ Closes edit mode
✅ Shows "Live" sync indicator
✅ After refresh: title is STILL changed
✅ Homepage shows updated title
```

**Result:** __________________

### Test 3.3: Edit Post Caption
```
Action:
1. In Build Mode, click Posts tab
2. Find a post (e.g., "Freshly brewed coffee")
3. Click edit/pencil icon
4. Change caption to "Test caption [timestamp]"
5. Click Save
6. Refresh page

Expected:
✅ Caption updates in editor immediately
✅ After refresh: caption is STILL changed
✅ Shaku Maku section on homepage shows updated caption
```

**Result:** __________________

### Test 3.4: Delete Content
```
Action:
1. In Build Mode, click any tab (Hero/Sections/Posts)
2. Find an item
3. Click Delete/Trash icon
4. Confirm deletion

Expected:
✅ Item disappears from editor immediately
✅ Refresh page: item STILL gone
✅ Homepage no longer shows deleted item
```

**Result:** __________________

### Test 3.5: Reorder Content
```
Action:
1. In Build Mode, find hero slide list
2. Click up/down arrows to reorder
3. Note the new order
4. Refresh page

Expected:
✅ Order changes immediately in editor
✅ After refresh: order is STILL the same
✅ Homepage shows items in new order
```

**Result:** __________________

---

## Test Category 4: Public Verification - Changes Visible 👁️

**Objective:** Verify public users see admin changes

### Test 4.1: Open Incognito Window
```
Action:
1. While logged in as admin in one window
2. Open ANOTHER window in Incognito/Private mode
3. Navigate to http://localhost:5173

Expected:
✅ Can view site without login
✅ Should see ALL changes made by admin
✅ Images uploaded by admin are visible
✅ Text edits by admin are visible
```

**Result:** __________________

### Test 4.2: Compare Admin vs Public
```
Action:
1. Make a change as admin (e.g., change hero image or post caption)
2. Without refreshing, open Incognito window
3. Compare what you see

Expected:
✅ Changes appear in both windows
✅ No lag or delay
✅ Data is consistent
```

**Result:** __________________

### Test 4.3: Verify NO Admin UI in Public View
```
Action:
1. In Incognito window (logged out)
2. Check:
   - Header: NO Build Mode button
   - Page: NO editor panels
   - Console: NO admin-related errors

Expected:
❌ NO Build Mode button visible
❌ NO admin UI anywhere
✅ Clean, public-only interface
```

**Result:** __________________

---

## Test Category 5: Security - Non-Admin Blocked 🔒

**Objective:** Verify non-admin users cannot access Build Mode

### Test 5.1: Different User Cannot Access Build Mode
```
Action:
1. Log out from admin account
2. Create or log in with a DIFFERENT email (not the admin email)
3. Check header for Build Mode button

Expected:
❌ Build Mode button is NOT visible
✅ Regular app features still work
❌ If you see Build Mode button → SECURITY FAILURE
```

**Result:** __________________

### Test 5.2: Non-Admin Cannot Access /admin Route
```
Action:
1. While logged in as non-admin user
2. Manually navigate to http://localhost:5173/admin
3. Wait for page to load

Expected:
✅ See "Access Denied" message
✅ Redirected away from admin page
❌ If you see admin dashboard → SECURITY FAILURE
```

**Result:** __________________

### Test 5.3: Database Blocks Non-Admin Writes
```
Action:
1. Open DevTools Console (F12)
2. While logged in as NON-ADMIN, try to run:
```
```javascript
// Try to insert a post (should fail)
const supabase = window.__SUPABASE__; // (if exposed)
// Or just trigger an edit in the UI
```

Expected:
❌ If they try to save, Supabase RLS blocks it
✅ See error: "new row violates row level security policy"
```

**Result:** __________________

### Test 5.4: Verify RLS Policy Active
```
Action:
1. In Supabase Dashboard
2. Go to Authentication → Policies
3. Check hero_slides, feed_sections, posts tables
4. Verify policies exist

Expected:
✅ See "Admin All Hero" policy exists
✅ See "Public Read Hero" policy exists
✅ See similar for other tables
✅ RLS is ENABLED on each table
```

**Result:** __________________

---

## Test Category 6: Console & Runtime - No Errors 🐛

**Objective:** Verify no runtime errors exist

### Test 6.1: Console on Page Load
```
Action:
1. Open DevTools (F12) → Console tab
2. Refresh page (Ctrl+F5)
3. Wait 5 seconds, watch console output

Expected:
✅ Page loads completely
❌ NO red error messages
❌ NO "Cannot find module" errors
❌ NO "401 Unauthorized" (auth should work)
❌ NO "404 Not Found" (all assets found)
❌ NO "Uncaught" exceptions
✅ May see yellow warnings (ok)
```

**Result:** __________________

### Test 6.2: Check Network Tab for Errors
```
Action:
1. Open DevTools → Network tab
2. Refresh page
3. Look at all requests

Expected:
✅ All requests are 200 OK (green)
❌ NO 401 responses
❌ NO 404 responses
❌ NO 500 errors
✅ Supabase requests (https://hsadukhmcclwixuntqwu.supabase.co) succeed
```

**Result:** __________________

### Test 6.3: Supabase Connection Health
```
Action:
1. Open DevTools → Network tab
2. Watch for Supabase API calls
3. Click "Build Mode" button to trigger data fetch

Expected:
✅ Supabase API calls succeed (200 status)
✅ Responses include JSON data
✅ Response times < 2 seconds
❌ NO connection timeouts
```

**Result:** __________________

### Test 6.4: Storage Upload Diagnostics
```
Action:
1. In Build Mode, click Hero tab
2. Upload an image
3. Watch Network tab

Expected:
✅ POST to /storage/v1/object/build-mode-images/ succeeds (200)
✅ GET to public URL works
✅ Image displays on page
```

**Result:** __________________

---

## Summary: Checklist for Final Approval

### Test Category 1: Logged Out (5 tests)
- [ ] 1.1: Homepage loads ✅
- [ ] 1.2: Hero loads ✅
- [ ] 1.3: Feed sections load ✅
- [ ] 1.4: Posts load ✅
- [ ] 1.5: Build Mode button hidden ✅
- [ ] 1.6: No console errors ✅

**Category 1 Status:** _____ (PASS/FAIL)

### Test Category 2: Admin Login (4 tests)
- [ ] 2.1: Login works ✅
- [ ] 2.2: Build Mode button appears ✅
- [ ] 2.3: Editor opens ✅
- [ ] 2.4: Admin dashboard accessible ✅

**Category 2 Status:** _____ (PASS/FAIL)

### Test Category 3: Admin Editing (5 tests)
- [ ] 3.1: Hero upload persists ✅
- [ ] 3.2: Feed edit persists ✅
- [ ] 3.3: Post edit persists ✅
- [ ] 3.4: Delete works ✅
- [ ] 3.5: Reorder works ✅

**Category 3 Status:** _____ (PASS/FAIL)

### Test Category 4: Public Verification (3 tests)
- [ ] 4.1: Changes visible in public ✅
- [ ] 4.2: Data consistent ✅
- [ ] 4.3: No admin UI in public ✅

**Category 4 Status:** _____ (PASS/FAIL)

### Test Category 5: Security (4 tests)
- [ ] 5.1: Non-admin blocked ✅
- [ ] 5.2: /admin blocked ✅
- [ ] 5.3: RLS blocks writes ✅
- [ ] 5.4: Policies active ✅

**Category 5 Status:** _____ (PASS/FAIL)

### Test Category 6: Console (4 tests)
- [ ] 6.1: No console errors ✅
- [ ] 6.2: No network errors ✅
- [ ] 6.3: Supabase healthy ✅
- [ ] 6.4: Storage upload works ✅

**Category 6 Status:** _____ (PASS/FAIL)

---

## Final Approval: READ TO PUSH?

### All Tests Must Pass:
- [ ] Category 1: PASS ✅
- [ ] Category 2: PASS ✅
- [ ] Category 3: PASS ✅
- [ ] Category 4: PASS ✅
- [ ] Category 5: PASS ✅
- [ ] Category 6: PASS ✅

### Only if ALL are PASS:

**DECISION:** 

🟢 **READY FOR PUSH** - All systems verified working

OR

🔴 **ISSUES FOUND** - Describe below:

```
Issues found:
1. 
2. 
3.

Actions to fix:
1. 
2. 
3.
```

---

## Push Checklist (After All Tests Pass)

```bash
# Stage all changes
git add -A

# Commit with message
git commit -m "Stabilize Build Mode system - Supabase fully connected

- .env.local configured with Supabase credentials
- All data loads from Supabase (hero, feed, posts)
- Admin access control via role-based RLS
- Image upload to Supabase storage working
- Runtime verified: all 6 test categories pass
- No console errors, no network failures
- Production-ready for deployment"

# Push to GitHub
git push origin main

# Vercel will auto-deploy
```

---

**Once you complete all 6 test categories, report back with:**
1. Which tests passed/failed
2. Any error messages (if failures)
3. Final status: READY FOR PUSH or ISSUES FOUND
