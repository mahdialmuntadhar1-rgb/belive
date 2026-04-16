# Build Mode Migration to Supabase - Current Status

**Date:** April 16, 2026
**Status:** ✅ IMPLEMENTED

## Overview

The Build Mode has been successfully migrated from localStorage/local file system to Supabase. All editable content (hero slides, feed sections, posts) is now managed from Supabase only. No localStorage or local file fallbacks remain for production persistence.

## What Was Changed

### New Files Created

1. **supabase_schema_v2.sql** - Complete SQL schema for Build Mode migration
   - `hero_slides` table with RLS policies
   - `feed_sections` table with RLS policies
   - Updated `posts` table with new columns (post_type, is_featured, is_active, sort_order)
   - Storage bucket setup for `build-mode-images`
   - Storage policies for admin-only upload/delete
   - Functions and triggers for updated_at timestamps

2. **src/hooks/useAdminDB.ts** - Admin CRUD operations hook
   - Hero slides: fetch, add, update, delete, reorder
   - Feed sections: fetch, add, update, delete, reorder
   - Posts: fetch, add, update, delete, reorder
   - Image upload to Supabase Storage (hero, feed, posts, businesses folders)
   - Image delete from Supabase Storage

3. **src/components/home/FeedSections.tsx** - Feed sections component
   - Renders feed sections from Supabase only
   - No local fallbacks
   - Supports multiple section types (featured, trending, categories)

### Modified Files

1. **src/components/home/HeroSection.tsx**
   - Removed dependency on `heroContent.ts` local file
   - Now fetches hero slides from Supabase `hero_slides` table
   - Uses `useAdminDB.fetchHeroSlides()` hook
   - Proper language support (en, ar, ku) from Supabase fields

2. **src/hooks/usePosts.ts**
   - Added `.eq('is_active', true)` filter to only fetch active posts
   - Updated sorting to use `sort_order` when available
   - Falls back to `created_at` for backward compatibility

3. **src/components/BuildModeEditor/BuildModeEditor.tsx**
   - Changed access control from URL/localStorage to `profile.role === 'admin'`
   - Removed `canAccessBuildMode()` dependency
   - Removed disable access functionality
   - Updated footer text to reflect Supabase sync

4. **src/App.tsx**
   - Changed Build Mode access check from `canAccessBuildMode()` to `profile.role === 'admin'`
   - Removed import of `canAccessBuildMode` from buildModeAccess

5. **src/hooks/useBuildMode.ts**
   - Added deprecation comment noting this is now only for temporary editor state
   - Final persistence is handled by `useAdminDB` hook

6. **src/components/BuildModeEditor/ImageUploader.tsx**
   - Removed base64/local file system upload
   - Now uses `useAdminDB.uploadImage()` for Supabase Storage
   - Uploads to specific folders (hero, feed, posts, businesses)
   - Returns public URLs from Supabase Storage

7. **server.ts**
   - Already a Vite dev server (no Express save endpoint to remove)
   - Build Mode save endpoint was not present in current version

## What Uses Supabase Now

✅ **Hero Slides** - Loaded from `hero_slides` table only
✅ **Feed Sections** - Loaded from `feed_sections` table only
✅ **Posts** - Loaded from `posts` table with is_active filter
✅ **Image Uploads** - Stored in Supabase Storage `build-mode-images` bucket
✅ **Admin CRUD** - All operations go through Supabase via useAdminDB

## Access Control

### Frontend
- Build Mode only renders when `profile.role === 'admin'`
- `/admin` route protected by AdminRoute component
- No URL param or localStorage-based access

### Backend (Supabase RLS)
- `hero_slides`: Public read active, admin write all
- `feed_sections`: Public read active, admin write all
- `posts`: Public read active, admin write all
- Storage: Public read, admin upload/delete

## What Was Removed/Deprecated

❌ **Removed**
- Dependency on `heroContent.ts` for production hero data
- URL param based Build Mode access (`?builder=1`)
- localStorage flag for Build Mode access
- Express save endpoint (was not present in current server.ts)

⚠️ **Deprecated**
- `useBuildMode.ts` - Now only for temporary editor state, not final persistence
- `buildModeAccess.ts` functions - No longer used for access control
- `heroContent.ts` - Kept as reference but not used in production

## What Still Exists (Legacy)

- `src/hooks/useBuildMode.ts` - Used for temporary editor state in BuildModeEditor
- `src/data/heroContent.ts` - Kept as reference but not imported by HeroSection
- `src/lib/buildModeAccess.ts` - No longer used but kept for reference

## Setup Required

Before the app can run in production, you must:

1. **Execute SQL Schema**
   - Run `supabase_schema_v2.sql` in Supabase SQL editor
   - This creates tables, RLS policies, and storage setup

2. **Create Storage Bucket**
   - In Supabase Dashboard, create storage bucket named `build-mode-images`
   - Make it public (read access for all)
   - The SQL file includes storage policies

3. **Configure Environment Variables**
   - Create `.env.local` with Supabase credentials
   - See `SUPABASE_SETUP_REQUIRED.md` for details

4. **Seed Initial Data**
   - Insert sample hero slides, feed sections, and posts
   - Uncomment sample data sections in `supabase_schema_v2.sql` if needed

5. **Assign Admin Role**
   - Ensure at least one user has `role = 'admin'` in `profiles` table
   - This user can access Build Mode

## Testing

Run the runtime verification checklist in `RUNTIME_VERIFICATION_CHECKLIST.md` to validate:
- Logged out public view works
- Admin login works
- Build Mode is accessible only to admins
- Hero slides load from Supabase
- Feed sections load from Supabase
- Posts load from Supabase
- Image uploads work to Supabase Storage
- Non-admins are blocked from Build Mode

## Migration Status

✅ **COMPLETE**

All Build Mode content is now Supabase-first. The migration is implemented and ready for runtime testing.
