# Authentication Refactor Audit Report
**Repository:** mahdialmuntadhar1-rgb/belive  
**Date:** 2026-04-11  
**Purpose:** Analyze and plan refactoring of authentication + user/business-owner system

---

## A. Repo Audit Summary

### What is Currently Broken

1. **Signup Overloaded with Business Data**
   - **File:** `src/components/auth/AuthModal.tsx` (lines 181-190)
   - **Issue:** Business owner fields (business_name, phone, governorate, category, city, description) are sent inside `supabase.auth.signUp()` metadata
   - **Impact:** Couples authentication with business onboarding, violates separation of concerns
   - **Risk:** Business data loss if auth fails, confusing UX

2. **Reset Password Flow Incomplete**
   - **File:** `src/components/auth/AuthModal.tsx` (line 171)
   - **Issue:** Sends reset emails to `/reset-password` route but this route doesn't exist in `App.tsx`
   - **Missing:** Reset password page, update password flow, Supabase recovery session handling
   - **Impact:** Users cannot actually reset passwords

3. **Magic Link/OTP Login Unnecessary Complexity**
   - **File:** `src/components/auth/AuthModal.tsx` (lines 476-506)
   - **Issue:** Includes "Sign in with Magic Link" feature that adds complexity for Iraq users
   - **Impact:** Confusing UX, unnecessary for email/password auth focus

4. **No Backend Security (RLS)**
   - **Files:** `src/components/dashboard/BusinessDashboard.tsx` (line 98), `src/hooks/useBusinessManagement.ts`
   - **Issue:** Role checks only on frontend (`profile?.role !== 'business_owner'`)
   - **Missing:** Supabase Row Level Security (RLS) policies
   - **Impact:** Anyone with anon key could query/modify business data via direct API calls
   - **Risk:** Security vulnerability - unauthorized data access

5. **No Database Schema Files**
   - **Finding:** No `.sql` files in repository
   - **Issue:** Database schema managed directly in Supabase, no version control
   - **Impact:** Cannot audit schema, no migration history, hard to reproduce

6. **Dashboard Route Not Protected**
   - **File:** `src/App.tsx` (line 25)
   - **Issue:** Dashboard route has no authentication guard
   - **Impact:** Unauthenticated users can access dashboard URL directly
   - **Risk:** Exposes admin interface

### What is Partially Working

1. **Auth State Management**
   - **Files:** `src/hooks/useAuth.ts`, `src/stores/authStore.ts`
   - **Status:** Basic auth state works with Zustand persistence
   - **Issue:** Profile creation only happens if profile doesn't exist (useAuth.ts lines 43-54)
   - **Missing:** Profile auto-creation trigger for new users

2. **Business Management**
   - **File:** `src/hooks/useBusinessManagement.ts`
   - **Status:** CRUD operations work but lack backend enforcement
   - **Good:** Frontend checks role before operations
   - **Missing:** RLS policies to enforce ownership at database level

3. **AddBusinessModal**
   - **File:** `src/components/home/AddBusinessModal.tsx`
   - **Status:** Works for creating businesses
   - **Issue:** Requires user to be logged in but doesn't check if they're a business_owner
   - **Missing:** Role check before allowing business creation

### What is Dangerous / Fragile

1. **Frontend-Only Security**
   - **Files:** Multiple components check `profile?.role` client-side
   - **Risk:** Security vulnerability - any user can bypass frontend checks
   - **Files Affected:**
     - `BusinessDashboard.tsx:98`
     - `useBusinessManagement.ts:12`
     - `BusinessDetailModal.tsx:161, 418`
     - `HomeHeader.tsx:120`

2. **No Role Constraint in Database**
   - **Issue:** `profiles` table has no CHECK constraint on `role` column
   - **Risk:** Invalid role values can be inserted
   - **Impact:** Data integrity issues

3. **CamelCase vs SnakeCase Mismatches**
   - **Files:** `src/hooks/useBusinessManagement.ts`, `src/hooks/usePosts.ts`
   - **Issue:** Manual mapping between camelCase (frontend) and snake_case (database)
   - **Example:** `ownerId` ↔ `owner_id`, `nameAr` ↔ `name_ar`
   - **Risk:** Type errors, maintenance burden

4. **Profile Creation Race Condition**
   - **File:** `src/hooks/useAuth.ts` (lines 43-54)
   - **Issue:** Profile created client-side after signup if missing
   - **Risk:** Race condition if multiple requests happen simultaneously
   - **Better Solution:** Database trigger to auto-create profile on auth.user insert

5. **Environment Variable Validation**
   - **File:** `src/components/auth/AuthModal.tsx` (lines 164-167)
   - **Issue:** Only warns if Supabase not configured, doesn't fail clearly
   - **Risk:** Silent failures in production
   - **Impact:** Hard to debug missing credentials

### Exact Files Causing Problems

| File | Lines | Problem | Severity |
|------|-------|---------|----------|
| `src/components/auth/AuthModal.tsx` | 181-190 | Business fields in auth signup | High |
| `src/components/auth/AuthModal.tsx` | 171 | Missing reset-password route | High |
| `src/components/auth/AuthModal.tsx` | 476-506 | Unnecessary magic link | Medium |
| `src/App.tsx` | 25 | No dashboard route guard | High |
| `src/components/dashboard/BusinessDashboard.tsx` | 98 | Frontend-only role check | High |
| `src/hooks/useBusinessManagement.ts` | 12 | Frontend-only role check | High |
| `src/hooks/useAuth.ts` | 43-54 | Client-side profile creation | Medium |
| `src/components/home/AddBusinessModal.tsx` | 44-47 | No role check | Medium |

---

## B. Refactor Plan

### Auth Flow

**Current:**
```
Signup → Send email, password, full_name, role + business fields → Supabase Auth
Login → Email, password → Supabase Auth
Forgot Password → Send email → Redirect to /reset-password (missing)
```

**Refactored:**
```
Signup → Send email, password, full_name, role only → Supabase Auth → Trigger creates profile
Login → Email, password → Supabase Auth
Forgot Password → Send email → Redirect to /reset-password → Update password
```

**Changes:**
1. Remove business fields from `signUp()` metadata
2. Create database trigger to auto-create profile row on auth.user insert
3. Implement `/reset-password` route and page
4. Remove magic link/OTP login option
5. Add clear error if Supabase credentials missing

### Profile Flow

**Current:**
```
Auth → useAuth checks if profile exists → Creates profile client-side if missing
```

**Refactored:**
```
Auth → Database trigger creates profile row automatically → useAuth fetches profile
```

**Changes:**
1. Create `handle_new_user()` PostgreSQL function
2. Create trigger on `auth.users` to call function
3. Profile includes: id (auth.uid), email, full_name, role, created_at, updated_at
4. Add CHECK constraint on role: `role IN ('user', 'business_owner')`

### Business Onboarding Flow

**Current:**
```
Signup (as business_owner) → Business fields collected in auth modal → Lost if auth fails
```

**Refactored:**
```
Signup → Role = 'business_owner' → Login → Dashboard → "Create Business" button → AddBusinessModal
```

**Changes:**
1. Remove business fields from signup form
2. After login, business owners see "Create Business" CTA in dashboard
3. AddBusinessModal already exists, just needs role check
4. Business data collected AFTER authentication succeeds

### Permissions Model

**Current:**
- Frontend checks `profile?.role === 'business_owner'` before allowing actions
- No backend enforcement

**Refactored:**
- Frontend checks remain for UX
- Backend RLS policies enforce permissions at database level
- Only business owners can insert/update businesses they own
- Only business owners can insert/update posts
- Authenticated users can comment/like
- Public can read businesses, posts, comments

**RLS Policies to Add:**

**profiles table:**
- Users can read own profile
- Users can update own profile (full_name, avatar_url)
- Service role can do everything

**businesses table:**
- Public can read
- Business owners can insert (owner_id = auth.uid())
- Business owners can update businesses where owner_id = auth.uid()

**posts table:**
- Public can read
- Business owners can insert (must own business)
- Business owners can update posts where business.owner_id = auth.uid()

**comments table:**
- Public can read
- Authenticated users can insert (user_id = auth.uid())
- Users can update own comments

**likes table:**
- Public can read
- Authenticated users can insert/delete own likes

---

## C. Code Changes

### 1. Refactor Auth Modal

**File:** `src/components/auth/AuthModal.tsx`

**Changes:**
- Remove business owner fields from signup form (lines 318-393)
- Keep only: email, password, full_name, role selector
- Remove magic link button (lines 462-506)
- Update signUp call to only send: email, password, full_name, role
- Add better error handling for missing Supabase config

### 2. Create Reset Password Page

**New File:** `src/pages/ResetPassword.tsx`

**Content:**
- Form to enter new password
- Call `supabase.auth.updateUser({ password })`
- Show success message
- Redirect to login after success

### 3. Add Reset Password Route

**File:** `src/App.tsx`

**Changes:**
- Add route: `<Route path="/reset-password" element={<ResetPassword />} />`

### 4. Update useAuth Hook

**File:** `src/hooks/useAuth.ts`

**Changes:**
- Remove client-side profile creation (lines 43-54)
- Profile will be created by database trigger
- Keep profile fetching logic

### 5. Add Dashboard Route Guard

**File:** `src/App.tsx`

**Changes:**
- Create ProtectedRoute component
- Wrap dashboard route with authentication check
- Redirect to login if not authenticated
- Show "access denied" if not business_owner

### 6. Update AddBusinessModal

**File:** `src/components/home/AddBusinessModal.tsx`

**Changes:**
- Add role check before allowing business creation
- Show error if user is not business_owner

### 7. Create ProtectedRoute Component

**New File:** `src/components/common/ProtectedRoute.tsx`

**Content:**
- Check authentication
- Check role if required
- Redirect or show access denied

---

## D. SQL Migrations

### Migration 1: Profiles Table Schema

```sql
-- Create or update profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'business_owner')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can do everything"
  ON public.profiles FOR ALL
  USING (auth.role() = 'service_role');
```

### Migration 2: Profile Auto-Creation Trigger

```sql
-- Function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Migration 3: Businesses Table RLS

```sql
-- Enable RLS on businesses if not already enabled
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view businesses" ON public.businesses;
DROP POLICY IF EXISTS "Business owners can insert businesses" ON public.businesses;
DROP POLICY IF EXISTS "Business owners can update own businesses" ON public.businesses;

-- RLS Policies
CREATE POLICY "Public can view businesses"
  ON public.businesses FOR SELECT
  USING (true);

CREATE POLICY "Business owners can insert businesses"
  ON public.businesses FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Business owners can update own businesses"
  ON public.businesses FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Service role can do everything"
  ON public.businesses FOR ALL
  USING (auth.role() = 'service_role');
```

### Migration 4: Posts Table RLS

```sql
-- Enable RLS on posts if not already enabled
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view posts" ON public.posts;
DROP POLICY IF EXISTS "Business owners can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Business owners can update own posts" ON public.posts;

-- RLS Policies
CREATE POLICY "Public can view posts"
  ON public.posts FOR SELECT
  USING (true);

CREATE POLICY "Business owners can insert posts"
  ON public.posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = posts.businessId
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can update own posts"
  ON public.posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = posts.businessId
      AND businesses.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = posts.businessId
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Service role can do everything"
  ON public.posts FOR ALL
  USING (auth.role() = 'service_role');
```

### Migration 5: Comments Table RLS

```sql
-- Enable RLS on comments if not already enabled
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;

-- RLS Policies
CREATE POLICY "Public can view comments"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can do everything"
  ON public.comments FOR ALL
  USING (auth.role() = 'service_role');
```

### Migration 6: Likes Table RLS

```sql
-- Enable RLS on likes if not already enabled
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view likes" ON public.likes;
DROP POLICY IF EXISTS "Authenticated users can insert likes" ON public.likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON public.likes;

-- RLS Policies
CREATE POLICY "Public can view likes"
  ON public.likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert likes"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can do everything"
  ON public.likes FOR ALL
  USING (auth.role() = 'service_role');
```

### Migration 7: Updated Timestamp Trigger

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

---

## E. Final Verification Checklist

### Authentication Flow
- [ ] User signup with email + password works
- [ ] Business owner signup with email + password works
- [ ] Login with email + password works
- [ ] Forgot password sends email
- [ ] Reset password page loads
- [ ] Reset password updates password successfully
- [ ] User is redirected to login after password reset

### Profile Flow
- [ ] Profile row auto-created on signup
- [ ] Profile has correct role ('user' or 'business_owner')
- [ ] Profile contains full_name from signup
- [ ] Profile fetches correctly on login
- [ ] Profile updates work

### Business Onboarding Flow
- [ ] Business owner can access dashboard
- [ ] Regular user cannot access dashboard (access denied)
- [ ] Dashboard shows "Create Business" option
- [ ] AddBusinessModal opens
- [ ] Business creation works
- [ ] Business is associated with owner_id
- [ ] Owner can only see their own businesses

### Permissions Model
- [ ] Public can read businesses
- [ ] Public can read posts
- [ ] Public can read comments
- [ ] Authenticated users can comment
- [ ] Authenticated users can like/unlike
- [ ] Business owners can create businesses
- [ ] Business owners can update their own businesses
- [ ] Business owners cannot update others' businesses
- [ ] Business owners can create posts
- [ ] Business owners can update their own posts
- [ ] Business owners cannot update others' posts
- [ ] Regular users cannot create businesses
- [ ] Regular users cannot create posts

### Security
- [ ] RLS policies are enabled on all tables
- [ ] Frontend role checks still work for UX
- [ ] Backend RLS enforces permissions
- [ ] Direct API calls without auth fail appropriately
- [ ] Service role can bypass RLS (for admin operations)

### Environment
- [ ] App fails clearly if Supabase credentials missing
- [ ] Environment variables are documented
- [ ] No hardcoded credentials in code

### UI/UX
- [ ] Auth modal is clean and simple
- [ ] Magic link removed
- [ ] Business fields removed from signup
- [ ] Reset password flow is clear
- [ ] Dashboard shows clear access denied for non-owners
- [ ] Error messages are user-friendly

---

## Summary

**Critical Issues Found:**
1. Business data mixed with auth signup (data loss risk)
2. Missing reset-password flow (password recovery broken)
3. No backend security (RLS) - major security vulnerability
4. Dashboard route unprotected
5. No database schema version control

**Refactor Priority:**
1. **HIGH:** Implement RLS policies (security critical)
2. **HIGH:** Remove business fields from signup (data integrity)
3. **HIGH:** Create reset-password flow (user requirement)
4. **HIGH:** Protect dashboard route (security)
5. **MEDIUM:** Remove magic link (UX simplification)
6. **MEDIUM:** Add profile auto-creation trigger (data integrity)

**Estimated Implementation Time:**
- SQL migrations: 30 minutes
- Code changes: 2 hours
- Testing: 1 hour
- **Total: ~3.5 hours**
