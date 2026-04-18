# Surgical Audit Report - Belive App

**Date:** April 18, 2026  
**Scope:** Hero editing, Feed editing, Business owner flow, Onboarding/claim  
**Goal:** Identify what's working, what's broken, what needs minimal fixes  

---

## PART 1: HERO SECTION EDITING

### Current State
✅ **Working:**
- `useAdminDB.ts` has `fetchHeroSlides()`, `updateHeroSlide()`, `deleteHeroSlide()` methods
- `HeroSection.tsx` properly loads slides from Supabase via `useAdminDB`
- Slides render correctly with multi-language support (title_ar, title_ku, title_en)
- Auto-carousel works (5-second interval)
- Fallback when no slides (returns null gracefully)

❌ **Broken/Issues:**
1. **No inline editor in HeroSection** - Component only displays, doesn't edit
2. **AdminPanel exists but hero editor may not be wired** - HeroEditor.tsx exists but unclear if integrated properly
3. **Admin mode detection** - HomePage uses `useAdminMode()` but `HeroSection` doesn't check `isAdminEditModeActive`
4. **Potential schema mismatch** - `sort_order` vs `display_order` field naming inconsistency
5. **EditableHeroSection component** - Old build mode component still exists, may cause confusion

### What Needs Fix
1. **Low priority (already exists):** HeroEditor in admin/HeroEditor.tsx - already built
2. **Missing:** Wire HeroSection to show edit button when in admin mode
3. **Clean up:** Remove old EditableHeroSection.tsx (legacy Build Mode)
4. **Schema check:** Verify `display_order` column exists in hero_slides table

---

## PART 2: SHAKU MAKU / FEED EDITING

### Current State
✅ **Working:**
- `usePosts.ts` has `createPost()`, `updatePost()`, `deletePost()` methods
- Posts query includes `business_id` mapping
- Pagination works (hasMore, loadMore)
- Comments and likes implemented

❌ **Broken/Critical Issues:**
1. **FAKE POST AUTO-SEEDING** - `SocialFeed.tsx` imports GoogleGenAI and generates fake posts:
   - Lines 34-85: Arabic templates, comment templates, category images
   - This is the **main blocker** - fake content pollutes real feed
   - Auto-seeding logic appears to run and may create duplicate posts

2. **Feed display logic unclear** - SocialFeed uses `displayPosts` array but unclear how it's populated
   - Real posts (`realPosts`) vs generated posts (`displayPosts`) - need to determine source of truth

3. **No delete UI in SocialFeed** - Posts can be deleted via `usePosts.deletePost()` but UI may not expose it

4. **Status column filter disabled** - Line 29 in `usePosts.ts` shows commented-out `.or('status.eq.visible,status.is.null')`
   - Causes all posts (even hidden) to load

5. **No edit UI in SocialFeed** - Posts are editable but interface may not expose it

### What Needs Fix
1. **URGENT:** Remove auto-seeding logic from SocialFeed.tsx (kill GoogleGenAI, fake templates)
2. Use ONLY `realPosts` from `usePosts()` hook
3. Implement simple edit/delete buttons in SocialFeed (or use existing EditablePost component)
4. Re-enable status filter once SQL schema is confirmed
5. Verify business_id linking is correct

---

## PART 3: BUSINESS OWNER POSTING FLOW

### Current State
✅ **Working:**
- `BusinessOwnerDashboard.tsx` exists and loads business by `owner_id`
- Dashboard has "Create Post" tab and form
- Posts are saved with `business_id` field
- Business lookup by owner works

❌ **Issues:**
1. **Navigation unclear** - Business owners may not know how to reach dashboard after login
2. **Auth redirect incomplete** - AuthModal has `onLoginSuccess` callback, but HomePage may not redirect to dashboard
3. **Business link verification** - Need to confirm `owner_id` field matches `user.id` properly
4. **Post visibility** - Posts created by owner may not appear in main feed if status filter is active

### What Needs Fix
1. **Wire HomePage to redirect business_owner role to dashboard** - Check `onLoginSuccess` callback
2. **Verify owner_id is set correctly** when business is created or claimed
3. **Test posting flow** - Create post, verify it appears in feed with correct business_id

---

## PART 4: ONBOARDING / CLAIM / BUSINESS OWNER FLOW

### Current State
✅ **Working:**
- AuthModal supports `role` selection (user vs business_owner)
- Signup flow collects business info (name, phone, governorate, category, city)
- Profile creation with role assignment

❌ **Issues/Needs Verification:**
1. **Business auto-creation** - When business_owner signs up, is a business record automatically created?
   - AuthModal collects business data but unclear if it's saved to `businesses` table
   - May need to check AuthModal completion logic (lines 114+)

2. **Business claim flow** - Is there a separate "claim existing business" flow?
   - AuthModal doesn't show claim option, only signup
   - Need to verify if users can claim pre-existing businesses

3. **Profile -> Business linking** - How is `owner_id` in businesses table set?
   - Should be set to `user.id` during signup or claim
   - Needs verification in signup success handler

4. **Dashboard access** - After signup/claim, can owner reach dashboard?
   - HomePage redirects to `/my-business` for business_owner role
   - Need to verify `/my-business` route exists or maps to BusinessOwnerDashboard

### What Needs Fix
1. **Verify business creation** - Check if signUp() actually creates business record
2. **Check route mapping** - Ensure `/my-business` -> `BusinessOwnerDashboard`
3. **Test end-to-end:** signup as business_owner → see dashboard → create post → see post in feed

---

## FILES ANALYSIS

### Files That Need Changes
| File | Issue | Action |
|------|-------|--------|
| `src/components/home/SocialFeed.tsx` | **CRITICAL:** Fake post generation | Remove GoogleGenAI import, fake templates, auto-seeding logic |
| `src/pages/HomePage.tsx` | Missing redirect | Add business_owner redirect to `/my-business` in onLoginSuccess |
| `src/components/home/HeroSection.tsx` | No edit UI when admin | Add edit button visibility check + edit modal trigger |
| `src/hooks/usePosts.ts` | Status filter disabled | Re-enable status filter (line 29) |
| `src/components/buildMode/EditableHeroSection.tsx` | Old system | Remove (conflicts with new admin system) |
| `src/components/buildMode/EditablePost.tsx` | Old system | Keep if needed, but clarify usage |
| `src/components/auth/AuthModal.tsx` | Business creation unclear | Verify business record is actually created in signup |

### Files That Are OK (Don't Touch)
- `src/hooks/useAdminDB.ts` - Already comprehensive
- `src/components/admin/HeroEditor.tsx` - Already built
- `src/components/admin/PostsEditor.tsx` - Already built
- `src/hooks/useAdminMode.ts` - Already built
- `src/pages/BusinessOwnerDashboard.tsx` - Core logic works
- `src/hooks/useBuildMode.ts` - Minimal, doesn't interfere

---

## CRITICAL FINDINGS

### 🔴 BLOCKER 1: Fake Post Generation
**File:** `SocialFeed.tsx` lines 34-100  
**Problem:** Auto-seeding creates fake posts that clutter the real feed  
**Impact:** Can't trust feed data, users see spam, testing is impossible  
**Fix:** Delete entire fake generation logic, use only `realPosts`

### 🔴 BLOCKER 2: No Edit UI for Feed
**File:** `SocialFeed.tsx`  
**Problem:** Posts are queryable but no edit/delete buttons visible  
**Impact:** Business owners can't edit their posts from feed  
**Fix:** Add edit/delete button overlay (can reuse EditablePost component)

### 🟡 ISSUE 3: Hero Editing Not Wired
**File:** `HeroSection.tsx`  
**Problem:** No edit button, admin mode not detected  
**Impact:** Hero can't be edited on homepage (admin panel exists but not accessible from hero)  
**Fix:** Add edit button that opens admin panel or inline editor

### 🟡 ISSUE 4: Business Owner Redirect Missing
**File:** `HomePage.tsx`  
**Problem:** `onLoginSuccess` callback exists but may not redirect  
**Impact:** Business owner logs in, stays on homepage instead of going to dashboard  
**Fix:** Check HomePage onLoginSuccess callback, ensure business_owner redirects to `/my-business`

### 🟡 ISSUE 5: Business Creation in Signup
**File:** `AuthModal.tsx`  
**Problem:** Business data collected but unclear if saved to `businesses` table  
**Impact:** Owner may create account but business record doesn't exist  
**Fix:** Verify signUp() actually calls business insert (need to check completion)

---

## MINIMAL FIXES CHECKLIST

**To make hero editing work:**
- [ ] Remove old `EditableHeroSection.tsx`
- [ ] Verify hero_slides table has `display_order` column
- [ ] Add edit button to HeroSection when admin mode active
- [ ] Confirm HeroEditor in AdminPanel loads/saves hero slides

**To make feed editing work:**
- [ ] REMOVE fake post generation logic from SocialFeed.tsx
- [ ] Add edit/delete buttons to post cards
- [ ] Re-enable status filter in usePosts.ts
- [ ] Test add/edit/delete workflow

**To make business owner posting work:**
- [ ] Verify owner_id is set in businesses table during signup
- [ ] Test business owner login → see dashboard
- [ ] Test create post → appears in feed with business_id

**To fix onboarding/claim flow:**
- [ ] Verify business record created during signup
- [ ] Check HomePage redirects business_owner to /my-business
- [ ] Test end-to-end signup flow
- [ ] (Optional) Add claim existing business option if needed

---

## What's NOT Needed
- No admin dashboard rebuild (AdminPanel already exists)
- No new CMS (useAdminDB already handles all CRUD)
- No new posting component (EditablePost + PostsEditor exist)
- No schema changes (tables already exist)

---

## Next Steps (In Order)
1. Remove fake post generation from SocialFeed.tsx (CRITICAL)
2. Add hero edit button to HeroSection
3. Add feed post edit/delete UI
4. Test business owner flow end-to-end
5. Verify onboarding creates business record

**Estimated Time:** 2-3 hours for surgical fixes  
**Token Cost:** Minimal (targeted edits only)
