# Admin Editing System Setup Guide

## Overview

This document covers the complete setup for the production-ready owner editing system for the Iraqi business directory platform. The system is built entirely on Supabase with **zero external dependencies** and focuses on a lightweight, role-based inline editing experience.

## Architecture

- **Authorization**: Based on `profile.role === 'admin'` only
- **Source of Truth**: Supabase tables (no localStorage, no URL params)
- **Storage**: Supabase Storage for image uploads
- **UX**: Lightweight toggle + modal editor on demand
- **Integration**: Integrated directly into HomePage.tsx

## Key Files

### Hooks
- `src/hooks/useAdminMode.ts` - Role-based access control and edit mode toggle
- `src/hooks/useAdminStorage.ts` - Supabase Storage image upload integration

### Components
- `src/components/admin/AdminEditToggle.tsx` - Floating toggle button (top-right)
- `src/components/admin/AdminPanel.tsx` - Main editor modal with tabs
- `src/components/admin/AdminEditableSection.tsx` - Wrapper for inline editable sections
- `src/components/admin/HeroEditor.tsx` - Hero slides editor
- `src/components/admin/FeaturesEditor.tsx` - Features section editor
- `src/components/admin/PostsEditor.tsx` - Feed posts editor
- `src/components/admin/SimpleTextEditor.tsx` - Reusable text/textarea editor

## Database Schema

### Required Tables & Columns

#### 1. `hero_slides` Table
```sql
CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  title_ar TEXT,
  title_ku TEXT,
  title_en TEXT,
  subtitle_ar TEXT,
  subtitle_ku TEXT,
  subtitle_en TEXT,
  cta_text TEXT,
  cta_link TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. `features` Table
```sql
CREATE TABLE IF NOT EXISTS features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar TEXT,
  title_ku TEXT,
  title_en TEXT,
  description_ar TEXT,
  description_ku TEXT,
  description_en TEXT,
  icon TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. Extend `posts` Table (if needed)
```sql
ALTER TABLE posts ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'visible';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
```

#### 4. Update `profiles` Table (for role-based access)
```sql
-- Ensure profiles table has role column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Set role to 'admin' for the owner
UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_USER_ID_HERE';
```

## Supabase Storage Buckets

Create these storage buckets (or use existing):

```
- assets/
  - hero/         (hero slide images)
  - features/     (feature images)
  - posts/        (feed post images)
  - businesses/   (business images)
```

All buckets should have **public** access (via RLS policies).

## RLS Policies (Security)

### For `hero_slides` table:
```sql
-- Allow authenticated admins to read
CREATE POLICY "Allow admins to read hero slides"
  ON hero_slides FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow only admins to update
CREATE POLICY "Allow admins to update hero slides"
  ON hero_slides FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow only admins to delete
CREATE POLICY "Allow admins to delete hero slides"
  ON hero_slides FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow only admins to insert
CREATE POLICY "Allow admins to insert hero slides"
  ON hero_slides FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

### For `features` table:
Apply the same pattern as `hero_slides`.

### For `posts` table (update):
```sql
-- Update existing policies to allow admins
CREATE POLICY "Allow admins to manage posts"
  ON posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

## How It Works

### 1. Accessing Edit Mode

1. **User logs in** with admin role
2. **Toggle button appears** in top-right (blue "Edit" button)
3. **Clicking** toggle turns on edit mode (button turns red)
4. **Admin panel opens** automatically or can be clicked
5. **Select tab** to edit (Hero, Features, Posts)
6. **Edit, save, and changes persist** to Supabase immediately

### 2. Edit Workflow

**Hero Slides:**
- View list of all slides
- Click "Edit" to modify slide
- Upload new image via Supabase Storage
- Edit multi-language titles and subtitles
- Edit CTA text and link
- Save changes to database
- Delete slides if needed
- Changes appear immediately on front-end

**Features:**
- Similar workflow to hero slides
- Add new features with "New" button
- Select emoji icons
- Manage sort order
- Toggle active/inactive status
- Auto-save to database

**Posts:**
- Create new posts for Shaku Maku feed
- Upload image via Supabase Storage
- Write title and caption
- Toggle visibility status
- Manage like counts
- Delete posts

### 3. Image Upload Flow

1. User clicks "Upload Image" button
2. File selected from device
3. `useAdminStorage` hook uploads to Supabase Storage
4. Public URL returned automatically
5. Image displayed in preview
6. Save button persists URL to database

## Security Considerations

✅ **What's Protected:**
- Only users with `profile.role === 'admin'` can access edit controls
- All edit UI is conditionally rendered
- Non-admins see zero edit controls
- Supabase RLS policies enforce server-side validation
- No service role keys exposed in frontend

❌ **What NOT to Do:**
- Don't rely on hiding UI alone (RLS is the real security)
- Don't expose `VITE_SUPABASE_SERVICE_ROLE_KEY`
- Don't use localStorage for auth state (use Supabase Auth)
- Don't trust client-side role checks alone

## Integration with HomePage

The admin system is fully integrated into `HomePage.tsx`:

```tsx
<AdminEditToggle onOpenPanel={() => setIsAdminPanelOpen(true)} />
<AdminPanel isOpen={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} />
```

When admin clicks toggle:
1. Edit mode activates
2. Panel opens automatically
3. Admin can switch between tabs and edit content
4. All changes save directly to Supabase
5. Close button dismisses panel

## Deployment Checklist

- [ ] Database tables created (`hero_slides`, `features`, extended `posts`)
- [ ] Storage buckets created (`assets/hero/`, `assets/features/`, `assets/posts/`)
- [ ] RLS policies applied to all tables
- [ ] Admin user role set in `profiles` table
- [ ] Environment variables configured (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [ ] Tested edit mode locally
- [ ] Tested image uploads to Storage
- [ ] Verified non-admin users see no edit controls
- [ ] Deployed to production

## Mobile Responsiveness

The editor adapts cleanly to mobile:
- Admin toggle stays fixed top-right
- Modal editor is responsive width
- Tabs scroll horizontally on small screens
- Form inputs stack properly
- Image uploads work via mobile cameras
- No overlapping or off-screen content

## Future Enhancements

Potential additions (not in initial MVP):
- Category management inline
- Business featured/homepage ordering
- SEO metadata editing
- Analytics dashboard
- Edit history / version control
- Collaborative editing
- Scheduled content publishing

## Troubleshooting

**Admin toggle doesn't appear:**
- Verify user is logged in
- Check `profile.role === 'admin'` in database
- Inspect browser console for errors

**Images don't upload:**
- Verify Storage bucket exists and is public
- Check bucket permissions/RLS
- Ensure file size is reasonable
- Try different image format

**Edits don't persist:**
- Verify RLS policies allow INSERT/UPDATE
- Check browser console for API errors
- Verify user role in profiles table
- Check network tab for failed requests

**Panel doesn't open:**
- Toggle button should open automatically
- If not, manually click toggle again
- Check z-index conflicts (panel is z-50)

## Support

For issues or questions, refer to:
- Supabase Documentation: https://supabase.com/docs
- Component source files in `src/components/admin/`
- Hook implementations in `src/hooks/`

---

**Built for production. Clean, simple, Supabase-first.**
