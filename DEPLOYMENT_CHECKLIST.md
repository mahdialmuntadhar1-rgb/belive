# Admin System - Deployment Checklist

## Pre-Deployment (Local Development)

### Code Quality
- [ ] Run TypeScript compiler: `npx tsc --noEmit`
  - Expected: 0 errors in admin components
- [ ] No console errors when admin edit button appears
- [ ] No console warnings in browser DevTools
- [ ] All imports resolve correctly

### Local Testing
- [ ] Create test admin account with role = 'admin'
- [ ] Verify edit button appears in top-right
- [ ] Click toggle to activate edit mode
- [ ] Panel opens automatically
- [ ] Can switch between tabs (Hero, Features, Posts)

### Hero Editor Testing
- [ ] Load hero slides (if no data, graceful fallback)
- [ ] Click "Edit" on a slide
- [ ] Modify title fields
- [ ] Upload new image (test different formats: jpg, png, webp)
- [ ] See image preview
- [ ] Save changes
- [ ] Verify changes persist (refresh page)
- [ ] Delete a slide (with confirmation)
- [ ] No broken layout after operations

### Features Editor Testing
- [ ] Load features list
- [ ] Create new feature with "+" button
- [ ] Select emoji icon
- [ ] Fill in 3 languages
- [ ] Save new feature
- [ ] Edit existing feature
- [ ] Toggle active/inactive
- [ ] Change sort order
- [ ] Delete feature
- [ ] Verify persistence

### Posts Editor Testing
- [ ] Load posts list
- [ ] Create new post with "+" button
- [ ] Upload image
- [ ] Write title and caption
- [ ] Set visibility status
- [ ] Save post
- [ ] Edit existing post
- [ ] Change like count
- [ ] Delete post
- [ ] Verify all changes persist

### Non-Admin User Testing
- [ ] Log out and log in as regular user
- [ ] Verify edit button does NOT appear
- [ ] Verify admin panel is NOT accessible
- [ ] See only public view of content
- [ ] No broken layout for non-admins

### Mobile Testing
- [ ] Test on mobile browser (iOS Safari, Chrome Mobile)
- [ ] Edit toggle button visible and clickable
- [ ] Admin panel responsive
- [ ] Form inputs stack properly
- [ ] Image upload works (camera option if supported)
- [ ] No off-screen elements
- [ ] Buttons clickable (no too-small touch targets)
- [ ] Landscape and portrait modes work

### Error Handling
- [ ] Intentionally break internet connection → See error message
- [ ] Upload file with invalid format → See error
- [ ] Try to save with invalid data → See validation error
- [ ] Cancel operations mid-upload → No data corruption
- [ ] Refresh page during save → Data still saved

---

## Database Preparation (Staging/Production)

### Schema Migration
- [ ] Open Supabase SQL Editor in production project
- [ ] Copy `migrations/admin_system_schema.sql`
- [ ] Review SQL script before running
- [ ] Execute migration
- [ ] Verify tables created:
  - [ ] `hero_slides` table exists
  - [ ] `features` table exists
  - [ ] `posts` table extended
  - [ ] `profiles` table has `role` column
- [ ] Verify RLS policies created:
  - [ ] Policies on `hero_slides`
  - [ ] Policies on `features`
  - [ ] Policies on `posts`
- [ ] Verify indexes created:
  - [ ] `idx_hero_slides_sort_order`
  - [ ] `idx_features_sort_order`
  - [ ] `idx_features_is_active`
  - [ ] `idx_posts_status`

### Role Assignment
- [ ] Find your user ID in `auth.users`
- [ ] Run: `UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_USER_ID';`
- [ ] Verify: `SELECT id, role FROM profiles WHERE id = 'YOUR_USER_ID';`
  - Expected: `admin` role

### Storage Setup
- [ ] Create bucket: `assets` (if doesn't exist)
- [ ] Create folders in `assets`:
  - [ ] `hero/`
  - [ ] `features/`
  - [ ] `posts/`
- [ ] Set bucket policies to public-read
- [ ] Test upload permissions

### Data Seeding (Optional)
- [ ] Add sample hero slides:
  ```sql
  INSERT INTO hero_slides (image_url, title_ar, title_en)
  VALUES ('https://...', 'عنوان', 'Title');
  ```
- [ ] Add sample features
- [ ] Add sample posts
- [ ] Verify they load in admin panel

---

## Code Deployment

### Git Commit
- [ ] `git status` shows only intended changes
- [ ] Review changes: `git diff`
- [ ] Stage all: `git add .`
- [ ] Commit with message:
  ```
  git commit -m "Add admin editing system - role-based inline editors for hero, features, and posts"
  ```

### Push to Repository
- [ ] Verify you're on main branch
- [ ] `git push origin main`
- [ ] Verify push succeeded
- [ ] Check GitHub repo shows new files

### Deployment Pipeline
- [ ] Pipeline triggered (Vercel, Netlify, etc.)
- [ ] Build logs show success
- [ ] No build errors
- [ ] Production URL deployed
- [ ] New deployment is live

---

## Production Verification

### Access Control
- [ ] Log in to production with admin account
- [ ] Edit button appears in top-right
- [ ] Edit mode toggle works
- [ ] Admin panel opens
- [ ] Log out
- [ ] Log in with non-admin account
- [ ] Edit button does NOT appear
- [ ] Cannot access admin panel

### Data Operations
- [ ] Can create/edit/delete hero slides
- [ ] Can upload images to Supabase Storage
- [ ] Images display in preview and on site
- [ ] Can create/edit/delete features
- [ ] Can create/edit/delete posts
- [ ] All changes visible immediately
- [ ] Changes persist after refresh

### Image Uploads
- [ ] Upload hero image → public URL returned
- [ ] Upload feature image → displays correctly
- [ ] Upload post image → displays correctly
- [ ] Check file size limits work
- [ ] Check format validation works

### Performance
- [ ] Page load time acceptable
- [ ] Admin panel loads data quickly
- [ ] Image uploads complete in reasonable time
- [ ] No lag when switching between tabs
- [ ] Database queries optimized (check RLS indexes)

### Error Scenarios
- [ ] Simulate network error → graceful error message
- [ ] Try invalid image format → error shown
- [ ] Interrupt upload → no data corruption
- [ ] Refresh during save → data still saved
- [ ] Clear cache → everything still works

---

## Documentation

### README Updates
- [ ] Add admin system section to main README
- [ ] Link to `ADMIN_QUICK_START.md`
- [ ] Document how to set admin role

### Documentation Files
- [ ] ✅ `ADMIN_SYSTEM_SETUP.md` - Complete guide
- [ ] ✅ `ADMIN_QUICK_START.md` - Quick start
- [ ] ✅ `IMPLEMENTATION_SUMMARY.md` - Technical details
- [ ] ✅ `ADMIN_SYSTEM_ARCHITECTURE.md` - Visual architecture
- [ ] ✅ `migrations/admin_system_schema.sql` - SQL script
- [ ] ✅ `DEPLOYMENT_CHECKLIST.md` - This file

### Code Documentation
- [ ] JSDoc comments in all components
- [ ] TSDoc comments in all hooks
- [ ] Inline comments for complex logic
- [ ] README in `src/components/admin/` directory

---

## Post-Deployment Monitoring

### First 24 Hours
- [ ] Monitor error logs (Supabase, application logs)
- [ ] Check for unusual database activity
- [ ] Verify RLS policies work as expected
- [ ] Test admin panel one more time
- [ ] Get feedback from admin user

### First Week
- [ ] Monitor storage usage growth
- [ ] Check for any RLS policy violations
- [ ] Verify performance metrics
- [ ] Update documentation based on usage
- [ ] Plan for any improvements

### Ongoing
- [ ] Regular backups enabled (Supabase default)
- [ ] Monitor database query performance
- [ ] Keep dependencies updated
- [ ] Review security logs quarterly
- [ ] Document any issues/resolutions

---

## Rollback Plan (If Issues)

### If Build Fails
- [ ] Revert last commit: `git revert HEAD`
- [ ] Push revert: `git push origin main`
- [ ] Pipeline will rebuild previous version
- [ ] Check deployment logs for error
- [ ] Fix issue locally
- [ ] Redeploy

### If Database Migration Fails
- [ ] Check Supabase SQL Editor for error message
- [ ] Review migration script syntax
- [ ] Drop problematic tables if needed
- [ ] Rerun migration
- [ ] Verify data integrity

### If RLS Policies Broken
- [ ] Check Supabase logs for policy errors
- [ ] Review RLS policy syntax
- [ ] Drop and recreate policies
- [ ] Test permissions again

### If Storage Bucket Issue
- [ ] Verify bucket exists and is public
- [ ] Check bucket policies in Supabase
- [ ] Recreate bucket if needed
- [ ] Test upload again

---

## Sign-Off

- [ ] I have completed all checks above
- [ ] System is production-ready
- [ ] Documentation is complete
- [ ] Team is trained on usage
- [ ] Backup plan documented

**Deployment Date:** _______________

**Deployed By:** _______________

**Reviewed By:** _______________

---

## Quick Reference

### Common Commands

**Check TypeScript**
```bash
npx tsc --noEmit
```

**Test locally**
```bash
npm run dev
```

**View database schema**
```sql
-- In Supabase SQL Editor
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
\d hero_slides  -- Describe table
```

**Check RLS policies**
```sql
SELECT * FROM pg_policies WHERE tablename = 'hero_slides';
```

**Update admin role**
```sql
UPDATE profiles SET role = 'admin' WHERE id = '...';
```

**Verify storage**
```
Supabase Dashboard → Storage → assets → check folders
```

---

## Support & Troubleshooting

### If Stuck
1. Check `ADMIN_SYSTEM_SETUP.md` Troubleshooting section
2. Review component source code
3. Check Supabase logs
4. Verify environment variables
5. Check browser console for errors

### Common Issues

**Edit button doesn't appear**
- [ ] User logged in?
- [ ] User role = 'admin'?
- [ ] Browser cache cleared?
- [ ] TypeScript compiled?

**Can't upload images**
- [ ] Storage bucket created?
- [ ] Bucket is public?
- [ ] Right bucket path?
- [ ] File size ok?
- [ ] Image format supported?

**Edits don't save**
- [ ] RLS policies created?
- [ ] User has admin role?
- [ ] Network connected?
- [ ] API errors in console?
- [ ] Database has disk space?

---

**✅ Deployment checklist complete!**

*For questions or issues, refer to documentation files.*
*For emergencies, check rollback plan above.*

---

*Last Updated: April 17, 2026*
*Status: ✅ Ready for Deployment*
