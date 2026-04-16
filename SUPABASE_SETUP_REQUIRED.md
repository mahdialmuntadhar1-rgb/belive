# Supabase Setup Required

This guide provides step-by-step instructions to set up Supabase for the Build Mode migration.

## Prerequisites

- Supabase project: https://hsadukhmcclwixuntqwu.supabase.co
- Supabase admin access
- Node.js installed

## Step 1: Execute SQL Schema

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `supabase_schema_v2.sql` from the root of this repository
5. Paste into the SQL editor
6. Click **Run** to execute the schema

This will:
- Create `hero_slides` table with RLS policies
- Create `feed_sections` table with RLS policies
- Update `posts` table with new columns
- Create storage policies for `build-mode-images` bucket
- Create functions and triggers for `updated_at` timestamps

## Step 2: Create Storage Bucket

1. In Supabase dashboard, navigate to **Storage** in the left sidebar
2. Click **New Bucket**
3. Enter bucket name: `build-mode-images`
4. Make bucket **Public** (uncheck "Private bucket")
5. Click **Create Bucket**

The SQL schema already includes storage policies, but you may need to verify them in the **Policies** tab of the storage bucket.

## Step 3: Configure Environment Variables

Create a `.env.local` file in the root of the repository with the following content:

```env
VITE_SUPABASE_URL=https://hsadukhmcclwixuntqwu.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

To get your anon key:
1. In Supabase dashboard, go to **Project Settings** → **API**
2. Copy the `anon` / `public` key
3. Paste it into `.env.local`

**Important:** `.env.local` is already in `.gitignore`, so your credentials won't be committed.

## Step 4: Seed Initial Data (Optional)

The SQL schema includes commented-out sample data. To seed initial hero slides and feed sections:

1. In Supabase SQL Editor, uncomment the sample data sections in `supabase_schema_v2.sql`
2. Run the query to insert sample data

Or manually insert data via the Supabase dashboard:
- Go to **Table Editor** → `hero_slides`
- Click **Insert Row** to add hero slides
- Repeat for `feed_sections` and `posts`

## Step 5: Assign Admin Role

To access Build Mode, a user must have `role = 'admin'` in the `profiles` table:

1. In Supabase dashboard, go to **Table Editor** → `profiles`
2. Find the user you want to make admin
3. Update the `role` column to `admin`
4. Click **Save**

Alternatively, run this SQL:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your_admin_email@example.com';
```

## Step 6: Install Dependencies

If you haven't already, install the required dependencies:

```bash
npm install
```

The project already includes `@supabase/supabase-js` in `package.json`.

## Step 7: Start Development Server

```bash
npm run dev
```

This will start the Vite dev server with the Express backend.

## Step 8: Verify Setup

Run the runtime verification checklist in `RUNTIME_VERIFICATION_CHECKLIST.md` to ensure everything is working correctly.

## Troubleshooting

### "Failed to fetch hero slides" error
- Verify `hero_slides` table exists in Supabase
- Check that RLS policies are enabled
- Ensure at least one hero slide has `is_active = true`
- Verify your `.env.local` has correct Supabase credentials

### "Failed to upload image" error
- Verify `build-mode-images` storage bucket exists
- Check that bucket is public
- Verify storage policies allow admin uploads
- Check browser console for specific error messages

### Build Mode not showing
- Verify user has `role = 'admin'` in `profiles` table
- Check that you're logged in as the admin user
- Verify `.env.local` is being loaded (check browser console for environment variables)
- Ensure you're not using the old `?builder=1` URL param (no longer works)

### Posts not loading
- Verify `posts` table has the new columns (post_type, is_featured, is_active, sort_order)
- Check that posts have `is_active = true`
- Run the SQL schema again if columns are missing

## Storage Folder Structure

The storage bucket uses the following folder structure:

```
build-mode-images/
├── hero/        # Hero slide images
├── feed/        # Feed section images
├── posts/       # Post images
└── businesses/  # Business images
```

Images are automatically organized into these folders by the `uploadImage` function in `useAdminDB.ts`.

## Next Steps

After completing setup:
1. Run the runtime verification checklist
2. Test Build Mode functionality as admin
3. Test public view as logged-out user
4. Deploy to Vercel when ready

## Support

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Check browser console for JavaScript errors
3. Verify all SQL was executed successfully
4. Ensure environment variables are set correctly
