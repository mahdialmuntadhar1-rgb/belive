# Belive Production Setup Guide

This guide walks you through deploying Belive to production. All database migrations and security policies are included in `supabase/FINAL_PRODUCTION_SETUP.sql`.

## Prerequisites

- Supabase project created (https://supabase.com)
- Vercel account configured
- Git repository pushed to GitHub
- Environment variables ready

## Step 1: Database Setup (Supabase)

### 1a. Run the Production Schema Migration

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query** (or **+** button)
4. Copy the entire contents of `supabase/FINAL_PRODUCTION_SETUP.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)

This creates:
- All 8 tables (profiles, businesses, posts, comments, claim_requests, post_likes, hero_slides, features)
- All indexes for performance
- Row Level Security (RLS) policies
- Auth trigger (if needed - see step 1c below)

**Expected output:** No errors. All tables, indexes, and policies should be created.

### 1b. Create Storage Buckets

Storage buckets must be created in the Supabase UI (not via SQL).

1. Go to **Storage** (left sidebar) → **Buckets**
2. Click **New bucket** for each:

**Bucket 1: feed-images**
- Name: `feed-images`
- Public/Private: **Public** ✓
- Click **Create bucket**

**Bucket 2: business-images**
- Name: `business-images`
- Public/Private: **Public** ✓
- Click **Create bucket**

Both buckets must be public so users can view images without authentication.

### 1c. Create Auth Trigger for Profile Auto-Creation (Optional but Recommended)

If you want profiles to auto-create on signup, add this SQL function in the SQL Editor:

```sql
-- Create a function to auto-create profiles
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

Run this in the SQL Editor to enable automatic profile creation on user signup.

---

## Step 2: Environment Variables (Vercel)

### 2a. Get Your Supabase Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (the `https://...supabase.co` URL)
   - **Anon Key** (the long public key for client-side auth)
   - **Service Role Key** (keep this secret, only for backend)

### 2b. Add to Vercel

1. Go to your Vercel project dashboard
2. Settings → **Environment Variables**
3. Add these:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Service Role Key |

4. Select environments where these apply: **Production**, **Preview**, **Development**
5. Click **Save**

### 2c. Remove Local .env File

If you have `.env.local` in your repo with real credentials:
- Delete it immediately
- Run `git rm --cached .env.local` to remove from git history
- Commit: `git commit -m "Remove exposed credentials"`

Never commit real credentials to git.

---

## Step 3: Create Admin User

After your first user signs up through the app:

1. Go to Supabase **Auth** → **Users**
2. Find your user in the list
3. Copy their User ID (the UUID)
4. Go to **SQL Editor**
5. Run this query (replace `YOUR_USER_ID` with the copied UUID):

```sql
UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_USER_ID';
```

This grants admin access to that user. They can now access `/admin` dashboard.

---

## Step 4: Deploy to Vercel

### 4a. Connect GitHub Repository

1. Go to Vercel dashboard
2. Click **New Project**
3. Import your GitHub repository
4. Vercel auto-detects it's a Vite project

### 4b. Configure Build Settings

Vercel should auto-configure these, but verify:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4c. Deploy

1. Click **Deploy**
2. Wait for build to complete (usually 2-3 minutes)
3. Vercel provides a production URL (e.g., `https://yourapp.vercel.app`)

Vercel automatically uses the Environment Variables you set in Step 2.

---

## Step 5: Verification Checklist

After deployment, verify these work:

- [ ] **Public Home Page**: Can see businesses, posts, hero carousel
- [ ] **Sign Up**: New user creates account successfully
- [ ] **Post Creation**: Business owner can create posts with images (uploads to feed-images)
- [ ] **Business Profile**: Business owner can update business image (uploads to business-images)
- [ ] **Admin Dashboard**: Admin can see real statistics (not mock data)
- [ ] **Post Visibility**: Hidden posts don't appear in public feed
- [ ] **Role-based Access**: Only business owners can edit their business; only admins access `/admin`

---

## Troubleshooting

### "Permission denied" on storage upload
- Verify buckets are created and set to **Public**
- Verify RLS policies allow authenticated users to upload

### "Row Level Security (RLS) violation"
- Check that the logged-in user matches the role requirement
- Verify RLS policies are enabled on the table
- Run FINAL_PRODUCTION_SETUP.sql again to ensure all policies exist

### "Anon key is invalid"
- Copy the exact Anon Key from Supabase Settings → API
- Verify it's set in Vercel Environment Variables
- Redeploy after adding variables

### "No posts appear in feed"
- Verify posts have `status = 'visible'` in the database
- Check RLS policy: "Public can read visible posts"

### "Build fails with missing environment variables"
- Ensure all three env vars are set in Vercel
- Redeploy after adding them (previous deploy won't see them)

---

## Production Security Checklist

- [ ] RLS policies enabled on all tables ✓ (FINAL_PRODUCTION_SETUP.sql)
- [ ] Storage buckets are public ✓ (Step 1b)
- [ ] Admin role only in database (no email-based fallback) ✓
- [ ] Post visibility filtering enforced ✓
- [ ] Business ownership checked on updates ✓
- [ ] No hardcoded credentials in codebase ✓
- [ ] Environment variables used for all secrets ✓
- [ ] Auth trigger enabled for auto-profile creation ✓

---

## Next Steps

1. **Monitor**: Check Vercel analytics and Supabase logs for errors
2. **Scale**: As users grow, monitor Supabase compute usage
3. **Backup**: Enable Supabase automated backups (Settings → Database)
4. **Custom Domain**: Add your domain in Vercel Settings → Domains

---

## Support

For issues:
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **React/Vite**: https://vitejs.dev
