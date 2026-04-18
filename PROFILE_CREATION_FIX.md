# Profile Creation Fix - Surgical Deployment

**Date:** April 18, 2026  
**Issue:** Auth user created but profiles row not auto-created reliably after signup  
**Root Cause:** No Postgres auth trigger to auto-create profiles when auth.users row is created  
**Solution:** Minimal - add auth trigger + fallback safety checks

---

## EXACT FIX APPLIED

### 1. **New File: `supabase/010_auth_trigger.sql`**

Creates a Postgres trigger that auto-creates a `profiles` row when:
- New user signs up via `supabase.auth.signUp()`
- Auth trigger fires, extracts metadata (full_name, role) from raw_user_meta_data
- Inserts into profiles table with proper role assignment
- Uses ON CONFLICT to prevent duplicates

**What it does:**
- Trigger name: `on_auth_user_created`
- Function: `handle_new_user()` 
- Extracts `role` from signup metadata
- Sets `full_name` from signup metadata
- Creates profile row instantly when user signs up
- Falls back to update if row already exists

### 2. **File Changed: `src/components/auth/AuthModal.tsx`**

After signup completes:
- Polls for profile creation (up to 5 attempts, 500ms each = 2.5 seconds wait)
- If profile exists, updates role to `business_owner` if needed
- If profile still doesn't exist, creates it as direct fallback
- Only then creates business record if business_owner role
- Ensures profile is guaranteed to exist before returning from signup

**Lines added:** ~50 lines

**Key changes:**
- Lines 128-187: New profile verification + creation logic
- Polls for profile instead of assuming auth trigger works
- Direct insert fallback if trigger doesn't fire
- Safer, no breaking changes to existing signup flow

### 3. **File Changed: `src/hooks/useAuth.ts`**

Enhanced fallback profile creation:
- When profile lookup fails (PGRST116 error), creates profile directly
- Sets default role='user' and full_name from signup metadata
- Proper error handling and logging
- Ensures user can log in even if auth trigger fails

**Lines changed:** Lines 42-61 expanded with better error handling

---

## HOW PROFILE CREATION NOW WORKS

### **Flow 1: Best Case (Auth Trigger Works)**
```
1. User signup with metadata (full_name, role)
2. Auth trigger fires immediately → profiles row created
3. AuthModal polls and finds profile
4. AuthModal creates business record (if business_owner)
5. Signup complete ✅
```

### **Flow 2: Trigger Delayed (AuthModal Fallback)**
```
1. User signup
2. Auth trigger delayed/slow
3. AuthModal polls, doesn't find profile immediately
4. After retries, AuthModal creates it directly
5. Signup complete ✅
```

### **Flow 3: Trigger Never Fires (useAuth.ts Fallback)**
```
1. User signup
2. Auth trigger doesn't fire for some reason
3. AuthModal creates profile fallback
4. User logs in later
5. useAuth.ts also checks and creates profile if needed
6. Triple safety net ✅
```

---

## DEPLOYMENT STEPS

### Step 1: Run Auth Trigger Migration
**Go to:** Supabase Dashboard → SQL Editor → New Query

**Copy-paste entire contents of:** `supabase/010_auth_trigger.sql`

**Run the migration**
- Expected: No errors
- Creates function `handle_new_user()`
- Creates trigger `on_auth_user_created`
- Creates RLS policies on profiles

**Verify:** 
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
-- Should return 1 row
```

### Step 2: Deploy Code Changes
```bash
git add supabase/010_auth_trigger.sql src/components/auth/AuthModal.tsx src/hooks/useAuth.ts
git commit -m "Fix: Add auth trigger for auto-profile creation + signup safeguards"
git push origin main
```

Pipeline will deploy automatically.

### Step 3: Test Signup Flow
1. Open app in private/incognito browser
2. Click "Sign Up"
3. Select "Business Owner" role
4. Fill form:
   - Email: `test-biz-001@example.com`
   - Password: `Test123456!`
   - Full Name: `Test Owner`
   - Business Name: `Test Cafe`
   - Phone: `+964 123 456 7890`
   - Governorate: `Baghdad`
   - Category: `Cafe`
   - City: `Baghdad`
   - Description: `Test cafe business`
5. Submit signup
6. Check Supabase:
   ```sql
   -- Check if profile was created
   SELECT id, full_name, role FROM profiles 
   WHERE email = 'test-biz-001@example.com';
   
   -- Expected: 1 row with role='business_owner'
   
   -- Check if business was created
   SELECT id, name, owner_id FROM businesses 
   WHERE name = 'Test Cafe';
   
   -- Expected: 1 row with owner_id=user.id
   ```
7. Check browser console for any errors (should be none)
8. User should see "Account created! Please check email..." message
9. Log out, then log in with same credentials
10. Should be redirected to `/my-business` dashboard
11. Business dashboard should load and show business details

---

## WHAT WAS NOT CHANGED

- ✅ Auth flow itself (signUp/signIn) - no changes
- ✅ Homepage navigation - no changes
- ✅ Business management - no changes
- ✅ Feed/posts - no changes
- ✅ Hero editing - no changes
- ✅ Admin system - no changes

**Only added:**
1. Auth trigger to create profiles automatically
2. Signup safeguards to ensure profile exists
3. Enhanced fallback in useAuth.ts

---

## FILES MODIFIED SUMMARY

| File | Change | Type |
|------|--------|------|
| `supabase/010_auth_trigger.sql` | NEW | Auth trigger + RLS |
| `src/components/auth/AuthModal.tsx` | Modified | +50 lines signup safeguard |
| `src/hooks/useAuth.ts` | Modified | Better fallback logic |

**Total lines added:** ~100
**Total lines removed:** 0
**Net impact:** Minimal, surgical

---

## ROLLBACK IF NEEDED

If auth trigger causes problems:

```sql
-- Drop the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function
DROP FUNCTION IF EXISTS public.handle_new_user();
```

Then redeploy code without the safeguards and fallback to direct profile creation in AuthModal.

---

## TESTS TO RUN

### Test 1: New Business Owner Signup
- [ ] Sign up as business_owner
- [ ] Profile created with role='business_owner'
- [ ] Business record created with owner_id=user.id
- [ ] Redirect to /my-business works
- [ ] Dashboard loads business details

### Test 2: Regular User Signup
- [ ] Sign up as regular user
- [ ] Profile created with role='user'
- [ ] No business record created
- [ ] No redirect (stays on home)

### Test 3: Login After Signup
- [ ] Sign up with business_owner role
- [ ] Log out
- [ ] Log in with same credentials
- [ ] Redirected to /my-business
- [ ] Dashboard accessible

### Test 4: Profile Mutation After Signup
- [ ] Verify profile can be updated
- [ ] Verify role can be changed (if needed)
- [ ] Verify full_name can be changed

### Test 5: Business Owner Can Post
- [ ] Create post from /my-business
- [ ] Post appears in main feed
- [ ] Post has correct business_id
- [ ] Post persists after refresh

---

## MONITORING

After deployment, check:
1. Auth logs in Supabase - any trigger errors?
2. Database logs - profile creation errors?
3. Browser console - any async errors?
4. User signup success rate - does it improve?

---

## NEXT STEPS IF ISSUES OCCUR

1. Check Supabase logs for trigger errors
2. Verify profiles table RLS policies allow trigger insertion
3. Check if metadata is being passed correctly in signUp()
4. Review browser console for race conditions
5. May need to increase poll timeout in AuthModal

---

**Status:** Ready to deploy  
**Risk Level:** LOW (auth trigger is standard Supabase pattern, multiple fallbacks)  
**Token Efficiency:** ✅ Minimal, surgical changes only
