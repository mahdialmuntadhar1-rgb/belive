# Shaku Maku Database & Hook Alignment Fix Guide

This guide explains all the changes made to get the Shaku Maku feed working properly with the `business_postcards` table.

## Overview

The Shaku Maku feed requires:
1. **Relaxed Database Constraints** - Allow nullable fields on the `business_postcards` table
2. **Updated Frontend Hooks** - Query the correct table and map fields properly
3. **Seeded Sample Data** - 50 posts with Arabic captions and Unsplash images

---

## 1. Database Schema Fix

### What Was Done
Created a SQL migration file: `supabase/migrations/001_relax_business_postcards_constraints.sql`

**Changes:**
- Made these columns NULLABLE (were NOT NULL):
  - `category_tag`
  - `neighborhood`
  - `governorate`
  - `city`
  - `lat`
  - `lng`
  - `rating`
  - `address`

### How to Apply

**Option A: Via Supabase Dashboard**
1. Go to SQL Editor in Supabase Dashboard
2. Copy the SQL from `supabase/migrations/001_relax_business_postcards_constraints.sql`
3. Paste and run the query
4. Confirm the table structure changed

**Option B: Via CLI (if you have Supabase CLI configured)**
```bash
supabase db push
```

### Why This Works
By making these fields nullable, the app can post to the feed without requiring every metadata field. The PGRST reload signal ensures the API sees the updated schema immediately.

---

## 2. Frontend Hook Updates

### Updated Files

#### `src/lib/supabase.ts` - Post Interface
**Changes:**
- Added new optional fields for business_postcards table:
  - `caption`, `image_url`, `likes_count`, `created_at`
  - `title`, `city`, `category`, `neighborhood`, `governorate`, `address`, `lat`, `lng`, `rating`
- Made `businessId`, `content`, and `likes` optional for flexibility
- The interface now supports both `posts` and `business_postcards` field names

#### `src/hooks/usePosts.ts` - Fetch & Create Logic
**Changes:**
- **fetchPosts()**: Now queries `business_postcards` table instead of `posts`
- **Field Mapping**: Maps snake_case database columns to camelCase interface:
  - `business_id` → `businessId`
  - `caption` → `content` (with fallback to `content`)
  - `image_url` → `image`
  - `likes_count` → `likes`
  - `created_at` → `createdAt`
- **createPost()**: Inserts into `business_postcards` with proper column names

#### `src/components/home/SocialFeed.tsx` - Display Logic
**Changes:**
- Updated `virtualPosts` memo to:
  - Use real posts from `business_postcards` when available
  - Normalize field names (e.g., `caption` → `content`, `image_url` → `image`)
  - Fall back to generated posts from businesses if no real posts exist
  - Properly handle the `likes_count` field

---

## 3. Sample Data Seeding

### Script Location
`scripts/seed-business-postcards.ts`

### Data Includes
- **50 Posts** across 10 major Iraqi cities
- **Arabic Captions**: 10 rotating templates with real business names, cities, and categories
- **Cinematic Images**: Unsplash URLs for each category (cafe, restaurant, hotel, gym, shopping, pharmacy)
- **Realistic Engagement**: Random likes count (50-550 per post)

### Categories Included
- 🍕 Restaurant
- ☕ Cafe
- 🏨 Hotel
- 💪 Gym
- 🛍️ Shopping
- 💊 Pharmacy

### Cities Covered
Baghdad, Erbil, Basra, Dohuk, Mosul, Sulaymaniyah, Karbala, Najaf, Hilla, Kirkuk

### How to Run

**1. Set Environment Variables**
```bash
export VITE_SUPABASE_URL="your_supabase_url"
export VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
```

**2. Run the Seed Script**
```bash
# Install dependencies first (if not done)
npm install

# Run the seed script
npx ts-node scripts/seed-business-postcards.ts
```

**Expected Output:**
```
🌱 Starting to seed Shaku Maku business_postcards table...

✅ Inserted batch 1 (10 posts)
✅ Inserted batch 2 (10 posts)
✅ Inserted batch 3 (10 posts)
✅ Inserted batch 4 (10 posts)
✅ Inserted batch 5 (10 posts)

🎉 Successfully seeded 50 Shaku Maku posts!
📱 Your feed should now display beautiful Arabic captions with cinematic images.
```

---

## 4. Implementation Steps (In Order)

### Step 1: Apply Database Migration
```sql
-- Run this in Supabase SQL Editor
ALTER TABLE business_postcards
  ALTER COLUMN category_tag DROP NOT NULL,
  ALTER COLUMN neighborhood DROP NOT NULL,
  ALTER COLUMN governorate DROP NOT NULL,
  ALTER COLUMN city DROP NOT NULL,
  ALTER COLUMN lat DROP NOT NULL,
  ALTER COLUMN lng DROP NOT NULL,
  ALTER COLUMN rating DROP NOT NULL,
  ALTER COLUMN address DROP NOT NULL;

NOTIFY pgrst, 'reload schema';
```

### Step 2: Verify Database Changes
- Check the `business_postcards` table schema in Supabase
- Confirm all specified columns are now nullable

### Step 3: Deploy Frontend Code
All frontend files have been updated:
- `src/lib/supabase.ts` - Post interface
- `src/hooks/usePosts.ts` - Hook logic
- `src/components/home/SocialFeed.tsx` - Display component

### Step 4: Seed Sample Data
```bash
npx ts-node scripts/seed-business-postcards.ts
```

### Step 5: Test the Feed
1. Open the app in browser
2. Navigate to the "Shaku Maku" (📱) tab
3. You should see:
   - 50 beautiful cards with Arabic captions
   - Cinematic images from Unsplash
   - Proper likes count from database
   - No console errors
   - No failed Supabase requests

---

## 5. Field Mapping Reference

### Business Postcards → Post Interface

| Database Column | Post Field | Purpose |
|---|---|---|
| `id` | `id` | Post ID |
| `business_id` | `businessId` | Business reference |
| `caption` | `content`/`caption` | Post text |
| `image_url` | `image`/`image_url` | Post image |
| `likes_count` | `likes` | Engagement count |
| `title` | `title` | Business name |
| `city` | `city` | City name |
| `category_tag` | `category` | Business category |
| `created_at` | `createdAt` | Timestamp |
| `neighborhood` | `neighborhood` | Area info |
| `governorate` | `governorate` | Province |
| `address` | `address` | Business address |
| `lat` | `lat` | Latitude |
| `lng` | `lng` | Longitude |
| `rating` | `rating` | Business rating |

---

## 6. Troubleshooting

### Issue: "PGRST204" Error
**Solution:** The schema cache is out of sync. Execute:
```sql
NOTIFY pgrst, 'reload schema';
```
In the Supabase SQL Editor.

### Issue: Posts Not Showing
**Check:**
1. Verify `business_postcards` table exists
2. Confirm nullable columns were applied
3. Check environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. Open browser DevTools → Network tab → check Supabase requests

### Issue: Images Not Loading
**Solution:** Ensure internet connectivity for Unsplash. All images use standard HTTPS URLs with `referrerPolicy="no-referrer"`.

### Issue: Arabic Text Not Displaying
**Solution:** Check browser character encoding (UTF-8). The Arabic captions are properly UTF-8 encoded in the database.

---

## 7. Sample Arabic Captions

Your feed will display posts like:

> ✨ اكتشفوا قهوة الحب في قلب بغداد! الأفضل في cafe. #العراق #شاكو_ماكو

> 🏆 مطعم الشرقية - جودة عالية وخدمة متميزة في بغداد. نرحب بك! #العراق_أولاً #شاكو_ماكو

> 🌟 تجربة فريدة في فندق بابل بـ بغداد. زورنا الآن! #محلي #شاكو_ماكو

---

## 8. Key Files Modified

```
belive/
├── supabase/
│   └── migrations/
│       └── 001_relax_business_postcards_constraints.sql (NEW)
├── scripts/
│   └── seed-business-postcards.ts (NEW)
├── src/
│   ├── lib/
│   │   └── supabase.ts (UPDATED)
│   ├── hooks/
│   │   └── usePosts.ts (UPDATED)
│   └── components/
│       └── home/
│           └── SocialFeed.tsx (UPDATED)
└── SHAKU_MAKU_FIX_GUIDE.md (THIS FILE)
```

---

## 9. Why This Approach Works

✅ **Relaxed Constraints**: Posts can be created without all metadata  
✅ **Proper Field Mapping**: Database and frontend use consistent naming  
✅ **Real Data**: 50 Arabic posts with professional images  
✅ **Error Handling**: TypeScript interfaces prevent type errors  
✅ **Fallback Logic**: Feed works with or without seeded data  
✅ **Scalable**: Easy to add more posts via the same script  

---

## 10. Next Steps

After implementing this fix:

1. ✅ Database schema relaxed
2. ✅ Frontend hooks updated
3. ✅ Sample data seeded
4. 🎯 Monitor feed performance
5. 🎯 Gather user feedback
6. 🎯 Scale to more businesses

---

## Questions?

If you encounter issues:
1. Check Supabase Dashboard → Logs
2. Open DevTools → Network tab
3. Review error messages in browser console
4. Verify all environment variables are set

Good luck with your Shaku Maku feed! 🚀
