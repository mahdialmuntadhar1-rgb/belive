# ⚠️ CRITICAL: Supabase Setup Required BEFORE Runtime Tests

## Current Status

Your app is **correctly connected to Supabase** but the database is **empty**. This is why you see:
- ✅ "Supabase is not configured" message **GONE** (env vars now loaded)
- ❌ "No Hero Content Available" (hero_slides table is empty)

## What This Means

```
✅ Supabase connection: WORKING
✅ Environment variables: LOADING correctly
✅ Frontend code: CORRECT
❌ Database tables: EMPTY (no test data)
```

You need to:
1. Run the SQL schema in Supabase
2. Insert test data into tables
3. Then hero/feed/posts will load

---

## Step 1: Run SQL Schema in Supabase (REQUIRED)

### How to Execute

1. Go to: https://supabase.com/dashboard
2. Click your project: `hsadukhmcclwixuntqwu`
3. Left sidebar → SQL Editor
4. Click "New Query"
5. **Copy the ENTIRE contents of this file:**
   ```
   /sessions/vibrant-gallant-meitner/mnt/belive/supabase_schema_v2.sql
   ```
6. Paste it into the SQL Editor
7. Click "Run" (green button)
8. Wait for completion (should say "0 rows returned" or show success messages)

### Expected Output
```
CREATE TABLE
CREATE INDEX
CREATE TRIGGER
CREATE POLICY
...
(No errors)
```

### Verify Tables Exist
After running schema, check:
1. Click "Schemas" in left sidebar
2. Expand "public"
3. You should see these tables:
   - ✅ `hero_slides`
   - ✅ `feed_sections`
   - ✅ `posts`
   - ✅ `profiles`
   - ✅ `businesses`

---

## Step 2: Set Admin Role (REQUIRED)

1. In SQL Editor, create new query
2. Paste this:
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'mahdialmuntadhar1@gmail.com';
```
3. Click Run

**This sets your email to admin role so Build Mode will work.**

---

## Step 3: Insert Test Data (REQUIRED FOR TESTING)

### Insert Test Hero Slide

```sql
INSERT INTO public.hero_slides (image_url, sort_order, is_active)
VALUES 
  ('https://images.unsplash.com/photo-1557821552-17105176677c?w=1200', 0, true),
  ('https://images.unsplash.com/photo-1599720032805-3d90fc1df8b9?w=1200', 1, true),
  ('https://images.unsplash.com/photo-1553531088-189a835e8e8f?w=1200', 2, true);
```

Copy, paste, and Run.

**After this:** Hero section will show 3 images rotating.

---

### Insert Test Feed Sections

```sql
INSERT INTO public.feed_sections (title, subtitle, content, image_url, sort_order, visibility)
VALUES
  (
    'Welcome to Belive',
    'Premium Iraqi Business Directory',
    'Discover and connect with the finest businesses in Iraq. From restaurants to hotels, pharmacies to gyms, find everything you need.',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
    0,
    true
  ),
  (
    'Featured Businesses',
    'Top rated establishments',
    'Check out our most popular businesses, rated by our community.',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
    1,
    true
  ),
  (
    'Explore Categories',
    'Browse by industry',
    'Food, Hotels, Services, Shopping, and more. Everything organized for your convenience.',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
    2,
    true
  );
```

Copy, paste, and Run.

**After this:** Feed sections will show below hero.

---

### Insert Test Posts (Shaku Maku)

```sql
INSERT INTO public.posts (image_url, caption, author_name, post_type, is_featured, is_active, sort_order)
VALUES
  (
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
    'Freshly brewed morning coffee ☕ Join us for the best coffee in Baghdad!',
    'Café Mahdi',
    'shaku_maku',
    true,
    true,
    0
  ),
  (
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
    'Excellence in service - That is our promise 🏆',
    'Premium Hotel',
    'shaku_maku',
    true,
    true,
    1
  ),
  (
    'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=500',
    'Transform your fitness journey with us 💪',
    'Elite Gym',
    'postcard',
    false,
    true,
    0
  ),
  (
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
    'Your health is our priority 🏥',
    'Central Pharmacy',
    'postcard',
    false,
    true,
    1
  );
```

Copy, paste, and Run.

**After this:** Shaku Maku posts will show in the feed.

---

## Step 4: Create Admin User Profile (IMPORTANT)

If your user doesn't have a profile yet, create it:

```sql
-- Insert a profile for your admin email
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
VALUES 
  (auth.uid(), 'mahdialmuntadhar1@gmail.com', 'Admin User', 'admin', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

**Note:** This assumes you've already signed up with that email in Supabase Auth.

---

## Step 5: Verify Storage Bucket (REQUIRED)

Build Mode uploads images to Supabase storage.

1. Go to: Supabase Dashboard → Storage (left sidebar)
2. Check if bucket `build-mode-images` exists
3. If NOT, create it:
   - Click "Create bucket"
   - Name: `build-mode-images`
   - Set to PUBLIC
   - Click Create

---

## Checklist Before Testing

- [ ] Ran `supabase_schema_v2.sql` in SQL Editor
- [ ] Ran admin role update for mahdialmuntadhar1@gmail.com
- [ ] Inserted test hero slides (3 images)
- [ ] Inserted test feed sections (3 sections)
- [ ] Inserted test posts (4 posts)
- [ ] Created admin profile
- [ ] Verified storage bucket `build-mode-images` exists and is public
- [ ] Verified these tables in Schema:
  - [ ] hero_slides (has 3 rows)
  - [ ] feed_sections (has 3 rows)
  - [ ] posts (has 4 rows)
  - [ ] profiles (has your email with role='admin')

---

## What Happens After Setup

Once you complete these steps:

1. **Homepage will show:**
   - ✅ Hero section with 3 rotating images
   - ✅ Feed sections below hero
   - ✅ Shaku Maku posts

2. **Admin (mahdialmuntadhar1@gmail.com) will be able to:**
   - ✅ See Build Mode button in header
   - ✅ Open editor panel
   - ✅ Upload new hero images
   - ✅ Edit feed sections
   - ✅ Edit/add posts
   - ✅ Changes persist to Supabase

3. **Public users will see:**
   - ✅ All content from Supabase
   - ❌ NO Build Mode button
   - ❌ NO admin UI

---

## If You Don't See Changes After Setup

**Problem:** Ran SQL but still seeing "No Hero Content Available"

**Solution:**
1. Refresh page (Ctrl+F5 or Cmd+Shift+R)
2. Check browser console (F12 → Console tab)
3. Look for any error messages
4. If you see a `400` error, the table probably doesn't exist or schema didn't run completely
5. Go back to Supabase → SQL Editor → Run schema again

---

## CRITICAL: Env Vars Updated ✅

Your `.env.local` now has:
```
VITE_BUILD_MODE=true
VITE_ADMIN_EMAIL=mahdialmuntadhar1@gmail.com
VITE_SUPABASE_URL=https://hsadukhmcclwixuntqwu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Connection is WORKING.** You just need data in the tables.

---

## Next: Start App After Supabase Setup

Once you complete the SQL schema and insert test data:

```bash
npm run dev
```

Then test:
1. ✅ Homepage loads
2. ✅ Hero shows 3 images
3. ✅ Feed sections show
4. ✅ Posts show
5. ✅ Log in as admin
6. ✅ Build Mode button appears
7. ✅ Editor opens
8. ✅ Upload hero image works
9. ✅ Edits persist

---

**DO NOT SKIP THESE STEPS.** The app is connected, but the database is empty. You must populate it first.

After completing this, report back with:
- "All SQL schemas executed successfully"
- "Test data inserted (3 heroes, 3 feeds, 4 posts)"
- "Tables verified in Supabase"

Then I'll guide you through runtime testing.
