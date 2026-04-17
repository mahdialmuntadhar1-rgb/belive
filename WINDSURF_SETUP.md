# Windsurf Setup Guide - Belive Project

Complete setup to run the Belive project locally in Windsurf.

## Quick Overview
- **Total Time:** 5 minutes (already automated most steps)
- **Prerequisites:** Node.js installed, Supabase account
- **Difficulty:** Beginner-friendly

---

## ✅ Already Done For You

- ✅ Dependencies installed (`npm install` completed)
- ✅ Environment variables configured (`.env.local` exists with Supabase credentials)
- ✅ Development server started (running on http://localhost:3000)

---

## What's Left For You (5 minutes)

Only these 3 Supabase steps require manual browser access:

---

## Step 1: Run SQL Schema in Supabase (3 minutes)

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (or create a new one)
3. Go to **SQL Editor** (left sidebar)
4. Open the file: `supabase_schema_v2.sql` in Windsurf
5. Copy the entire SQL content
6. Paste into Supabase SQL Editor
7. Click **Run** to execute

This creates:
- `hero_slides` table (for homepage hero content)
- `feed_sections` table (for feed sections)
- Updates `posts` table with new columns
- Row Level Security (RLS) policies
- Storage bucket policies

**Note:** You'll also need to manually create a storage bucket named `build-mode-images` in Supabase Dashboard > Storage.

---

## Step 2: Create Admin User (1 minute)

1. In Supabase Dashboard, go to **Authentication** > **Users**
2. Click **Add User** > **Create New User**
3. Enter email: `mahdialmuntadhar1@gmail.com` (or your email)
4. Set a password
5. Click **Create**

Then set the user as admin:
1. Go to **Table Editor** > **profiles** table
2. Find your user and set `role` to `admin`
3. Or run this in SQL Editor:

```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your_email@example.com';
```

---

## Step 3: Test the Application (1 minute)

Open your browser and visit:

**Main Homepage:** http://localhost:3000

**Admin Dashboard:** http://localhost:3000/admin
- Only accessible if you're logged in as admin
- In DEV mode, admin panel is always visible

**Key Features to Test:**
- ✅ Homepage loads with hero section
- ✅ Admin FAB (floating action button) appears in bottom-right
- ✅ Click admin FAB to access Admin Dashboard
- ✅ Admin Dashboard shows business listings, claims, and Shaku Maku admin
- ✅ Build Mode Editor appears (if you're admin)

---

## ✅ Done!

The development server is already running in the background. After you complete the 3 Supabase steps above, your app will be fully functional.

If you're logged in as admin:
1. Look for the Build Mode Editor (floating panel)
2. It should allow you to edit hero slides and feed sections
3. Changes are saved directly to Supabase

---

## Quick Command Reference

```bash
# Restart dev server (if needed)
npm run dev

# Stop server: Press Ctrl+C in terminal
```

---

**That's it!** 🚀

Complete the 3 Supabase steps above and your app is ready to use.
