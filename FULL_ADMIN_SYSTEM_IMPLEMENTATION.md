# Full Admin Dashboard System - Complete Implementation

## Overview
Comprehensive admin dashboard with full control over application content, posts, businesses, and system settings.

---

## Files Created/Modified

### Database Migrations
1. **supabase/migrations/002_admin_setup.sql** (MODIFIED)
   - Added app_settings table for hero content, labels, system settings
   - Added posts table for Shaku Maku feed
   - RLS policies for all tables
   - Admin role setup

2. **supabase/migrations/003_full_admin_system.sql** (NEW)
   - Complete admin system setup
   - Database tables and indexes
   - RLS policies

3. **supabase/migrations/004_storage_buckets.sql** (NEW)
   - Supabase Storage buckets setup
   - Storage policies for hero-images, post-images, business-media

### Backend API
4. **src/lib/adminApi.ts** (EXPANDED)
   - Added AppSettings and Post interfaces
   - Added fetchAppSettings(), updateAppSettings()
   - Added fetchPosts(), createPost(), updatePost(), deletePost()
   - Added togglePostFeatured(), togglePostTrending()
   - Added uploadImage(), deleteImage()
   - Updated AdminStats to include posts count

### Frontend
5. **src/pages/AdminPage.tsx** (COMPLETELY REWRITTEN)
   - Tab-based navigation (Overview, Content Editor, Posts, Businesses, System Settings)
   - Content Editor: Hero title/subtitle, labels, hero image upload
   - Posts Manager: Create posts with images, toggle featured/trending, delete
   - Business Manager: Search/filter, toggle verification/featured, delete
   - System Settings: Maintenance mode, registration toggle
   - Real-time data updates

6. **src/App.tsx** (PREVIOUSLY MODIFIED)
   - Added /admin route

---

## Database Schema

### app_settings Table
```sql
CREATE TABLE app_settings (
  id UUID PRIMARY KEY,
  hero_title_ar TEXT,
  hero_subtitle_ar TEXT,
  hero_image_url TEXT,
  featured_label TEXT,
  trending_label TEXT,
  maintenance_mode BOOLEAN,
  registration_enabled BOOLEAN,
  updated_at TIMESTAMP
);
```

### posts Table
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  content TEXT NOT NULL,
  image_url TEXT,
  is_featured BOOLEAN,
  is_trending BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Supabase Storage Buckets
- **hero-images** - Hero section images
- **post-images** - Shaku Maku post images
- **business-media** - Business images

---

## Admin Dashboard Features

### 1. Overview Tab
- Statistics cards (Total Businesses, Verified, Unverified, Featured, Posts)
- System status display (Maintenance Mode, Registration Enabled)

### 2. Content Editor Tab
- Edit hero title (Arabic)
- Edit hero subtitle (Arabic)
- Upload/replace hero image
- Edit featured label
- Edit trending label
- Save changes to database

### 3. Posts (Shaku Maku) Tab
- Create new posts with content and optional image
- List all posts with images
- Toggle featured status
- Toggle trending status
- Delete posts
- Image upload to Supabase Storage

### 4. Businesses Tab
- Search businesses by name, category, location
- Filter by verification status
- Toggle verification status
- Toggle featured status
- Delete businesses

### 5. System Settings Tab
- Toggle maintenance mode (disable public access)
- Toggle user registration

---

## Setup Instructions

### Step 1: Run Database Migration
1. Go to Supabase Dashboard → SQL Editor
2. Open `supabase/migrations/002_admin_setup.sql`
3. Replace `mahdialmuntadhar1@gmail.com` with your email
4. Run the script
5. Verify: Should show your email with role 'admin'

### Step 2: Create Supabase Storage Buckets
1. Go to Supabase Dashboard → Storage
2. Create bucket: `hero-images` (Public: Yes, File Size: 5MB)
3. Create bucket: `post-images` (Public: Yes, File Size: 5MB)
4. Create bucket: `business-media` (Public: Yes, File Size: 10MB)
5. Run `supabase/migrations/004_storage_buckets.sql` in SQL Editor

### Step 3: Clear Cache and Re-login
1. Logout of your app
2. Clear browser cache (Ctrl+Shift+Delete)
3. Login again

### Step 4: Access Admin Dashboard
1. Navigate to `/admin`
2. Should see the admin dashboard with all tabs
3. Test all features

---

## API Functions Available

### App Settings
- `fetchAppSettings()` - Get current app settings
- `updateAppSettings(updates)` - Update app settings

### Posts
- `fetchPosts()` - Get all posts
- `createPost(post)` - Create new post
- `updatePost(id, updates)` - Update post
- `togglePostFeatured(id, value)` - Toggle featured status
- `togglePostTrending(id, value)` - Toggle trending status
- `deletePost(id)` - Delete post

### Businesses
- `fetchBusinesses()` - Get all businesses
- `updateBusiness(id, updates)` - Update business
- `toggleBusinessVerification(id, value)` - Toggle verification
- `toggleBusinessFeatured(id, value)` - Toggle featured
- `deleteBusiness(id)` - Delete business

### Images
- `uploadImage(file, bucket, path?)` - Upload image to Supabase Storage
- `deleteImage(url, bucket)` - Delete image from Supabase Storage

### Admin Access
- `checkAdminAccess()` - Verify user has admin role
- `fetchAdminStats()` - Get dashboard statistics

---

## Testing Checklist

### Database Setup
- [ ] SQL migration run successfully
- [ ] Your role = 'admin' in database
- [ ] app_settings table created with default data
- [ ] posts table created
- [ ] Storage buckets created
- [ ] Storage policies applied

### Admin Access
- [ ] Non-admin users see access denied
- [ ] Admin users can access /admin
- [ ] Unauthenticated users see access denied

### Content Editor
- [ ] Can edit hero title
- [ ] Can edit hero subtitle
- [ ] Can upload hero image
- [ ] Can edit featured label
- [ ] Can edit trending label
- [ ] Changes save to database
- [ ] Changes reflect on homepage

### Posts Manager
- [ ] Can create post with content
- [ ] Can upload post image
- [ ] Can toggle featured status
- [ ] Can toggle trending status
- [ ] Can delete post
- [ ] Posts appear in feed

### Business Manager
- [ ] Can search businesses
- [ ] Can filter by status
- [ ] Can toggle verification
- [ ] Can toggle featured
- [ ] Can delete business

### System Settings
- [ ] Can toggle maintenance mode
- [ ] Can toggle registration
- [ ] Settings persist in database

---

## Security Features

- **RLS Policies**: Database-level access control
- **Admin Role Check**: Frontend verification
- **No Hardcoded Emails**: Role-based access
- **Protected Route**: /admin only accessible to admins
- **Storage Policies**: Admin-only upload, public read
- **No Secrets Exposed**: Uses existing environment variables

---

## Integration with Frontend

To use app settings in your frontend:

```typescript
import { fetchAppSettings } from '@/lib/adminApi';

// Get settings
const { data: settings } = await fetchAppSettings();

// Use in components
<h1>{settings?.hero_title_ar}</h1>
<p>{settings?.hero_subtitle_ar}</p>
<img src={settings?.hero_image_url} alt="Hero" />
```

To use posts in your frontend:

```typescript
import { fetchPosts } from '@/lib/adminApi';

// Get posts
const { data: posts } = await fetchPosts();

// Display featured posts
const featuredPosts = posts.filter(p => p.is_featured);
```

---

## Troubleshooting

**"Access Denied" after setup:**
- Replace email in SQL script with your actual email
- Logout, clear cache, login again

**Storage upload fails:**
- Verify buckets are created in Supabase Dashboard
- Run storage policies SQL script
- Check bucket is public

**Posts not showing:**
- Verify posts table exists
- Check RLS policies are applied
- Test with SQL Editor: `SELECT * FROM posts`

**Hero image not updating:**
- Check uploadImage function returns URL
- Verify app_settings table has hero_image_url
- Check bucket policy allows admin upload

---

## Summary

**What You Now Have:**
✅ Complete admin dashboard with 5 sections
✅ Full content control (hero, labels, images)
✅ Shaku Maku post management (CRUD + images)
✅ Business management (verify, feature, delete)
✅ System settings (maintenance, registration)
✅ Supabase Storage integration for images
✅ Database-level security (RLS policies)
✅ Role-based access control
✅ Real-time data updates
✅ No mock data - all real Supabase integration

**Files Changed:**
- supabase/migrations/002_admin_setup.sql (expanded)
- supabase/migrations/003_full_admin_system.sql (new)
- supabase/migrations/004_storage_buckets.sql (new)
- src/lib/adminApi.ts (expanded)
- src/pages/AdminPage.tsx (completely rewritten)
- src/App.tsx (previously modified for /admin route)

**Next Steps:**
1. Run SQL migration in Supabase
2. Create Storage buckets in Supabase Dashboard
3. Run storage policies SQL
4. Clear cache and re-login
5. Access /admin and test all features
6. Integrate app settings and posts into your frontend components
