# Admin System Quick Start

## ⚡ 5-Minute Setup

### Step 1: Database Schema (2 minutes)

1. Open Supabase Project → SQL Editor
2. Paste contents of `migrations/admin_system_schema.sql`
3. Click "Run"
4. Wait for completion

### Step 2: Set Admin Role (1 minute)

In Supabase SQL Editor, run:

```sql
UPDATE profiles SET role = 'admin' WHERE id = 'your-user-id-here';
```

Replace `your-user-id-here` with your actual user ID from auth.users table.

### Step 3: Storage Buckets (1 minute)

In Supabase Dashboard → Storage:

1. Create bucket: `assets`
2. Create folders inside:
   - `hero/`
   - `features/`
   - `posts/`

Make bucket **public** (RLS policy: public read, authenticated write).

### Step 4: Environment Variables (Already Set)

Your `.env` should already have:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

✅ **Done!** Admin system is ready.

---

## 🎯 Using the System

### Access Edit Mode

1. **Log in** with your admin account
2. **Top-right corner**: Blue "Edit" button appears
3. **Click it** → Panel opens automatically
4. **Switch tabs**: Hero, Features, Posts
5. **Edit content** directly
6. **Save** → Changes persist to Supabase immediately
7. **Exit** → Click X or toggle off

### Edit Each Section

#### Hero Slides
```
✓ Upload/replace image
✓ Edit titles (Arabic, Kurdish, English)
✓ Edit subtitles (3 languages)
✓ Set CTA text and link
✓ Reorder slides (sort_order)
✓ Delete slides
```

#### Features
```
✓ Add new features (+ button)
✓ Choose emoji icon
✓ Edit titles (3 languages)
✓ Edit descriptions (3 languages)
✓ Reorder (sort_order)
✓ Toggle active/inactive
✓ Delete features
```

#### Posts (Shaku Maku Feed)
```
✓ Create new posts (+ button)
✓ Upload image
✓ Write title and caption
✓ Toggle visibility
✓ Edit like counts
✓ Delete posts
```

---

## 🔐 Security Check

### For Admin Users:
- ✅ Edit mode toggle visible
- ✅ Can access admin panel
- ✅ Can upload images
- ✅ Changes save to Supabase

### For Regular Users:
- ✅ No edit button visible
- ✅ No admin panel accessible
- ✅ See only public view
- ✅ Cannot modify content

---

## 🚀 Deployment

### Before Going Live:

- [ ] Run migration SQL in production database
- [ ] Create storage buckets in production
- [ ] Set your admin role in production profiles
- [ ] Test edit mode on production domain
- [ ] Verify images upload correctly
- [ ] Confirm non-admins can't see edit controls

### Deploy:

```bash
git add .
git commit -m "Add admin editing system"
git push origin main
```

---

## ❓ Troubleshooting

### Edit button doesn't appear
→ Check: `profiles.role = 'admin'` in database
→ Check: Browser console for errors

### Can't upload images
→ Check: Storage bucket exists and is public
→ Check: Upload path is correct

### Edits don't save
→ Check: Network tab for failed requests
→ Check: RLS policies allow INSERT/UPDATE
→ Check: User has admin role

### Panel won't open
→ Click toggle button again
→ Hard refresh browser (Ctrl+Shift+R)

---

## 📱 Mobile Support

Edit mode works on mobile:
- ✅ Toggle button in top-right
- ✅ Responsive editor modal
- ✅ Image uploads from camera
- ✅ Landscape and portrait modes

---

## 📞 Support

Refer to:
- `ADMIN_SYSTEM_SETUP.md` - Full documentation
- Component source: `src/components/admin/`
- Hooks source: `src/hooks/useAdminMode.ts`, `useAdminStorage.ts`

---

**You're ready to edit! 🎉**
