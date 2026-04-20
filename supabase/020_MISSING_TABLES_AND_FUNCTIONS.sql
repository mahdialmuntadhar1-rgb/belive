-- SUPPLEMENTAL MIGRATION: Missing Tables and Functions
-- MUST BE RUN AFTER FINAL_PRODUCTION_SETUP.sql
-- This file adds tables and functions that the frontend expects but FINAL_PRODUCTION_SETUP.sql doesn't include

-- ============================================================================
-- PART 1: CREATE MISSING TABLES FOR METADATA
-- ============================================================================

-- 1. Governorates table (Iraq administrative regions)
CREATE TABLE IF NOT EXISTS governorates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL UNIQUE,
  name_ar TEXT,
  name_ku TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Cities table
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  governorate_id UUID NOT NULL REFERENCES governorates(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,
  name_ar TEXT,
  name_ku TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL UNIQUE,
  name_ar TEXT,
  name_ku TEXT,
  icon_name TEXT,
  is_hot BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Likes table (alias for post_likes, but some code uses 'likes')
-- NOTE: FINAL_PRODUCTION_SETUP.sql already creates post_likes
-- This view provides compatibility if frontend uses 'likes' table name
-- However, the frontend code uses 'likes' directly, so we need the actual table
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- ============================================================================
-- PART 2: ENABLE RLS ON NEW TABLES
-- ============================================================================

ALTER TABLE governorates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 3: RLS POLICIES FOR METADATA TABLES (PUBLIC READ)
-- ============================================================================

-- Governorates - public read only
DROP POLICY IF EXISTS "Public can read governorates" ON governorates;
CREATE POLICY "Public can read governorates"
  ON governorates FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin can manage governorates" ON governorates;
CREATE POLICY "Admin can manage governorates"
  ON governorates FOR ALL
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

-- Cities - public read only
DROP POLICY IF EXISTS "Public can read cities" ON cities;
CREATE POLICY "Public can read cities"
  ON cities FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin can manage cities" ON cities;
CREATE POLICY "Admin can manage cities"
  ON cities FOR ALL
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

-- Categories - public read only
DROP POLICY IF EXISTS "Public can read categories" ON categories;
CREATE POLICY "Public can read categories"
  ON categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin can manage categories" ON categories;
CREATE POLICY "Admin can manage categories"
  ON categories FOR ALL
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

-- Reviews - public read, authenticated write
DROP POLICY IF EXISTS "Public can read reviews" ON reviews;
CREATE POLICY "Public can read reviews"
  ON reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can manage reviews" ON reviews;
CREATE POLICY "Admin can manage reviews"
  ON reviews FOR ALL
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

-- Likes - public read, authenticated write/delete
DROP POLICY IF EXISTS "Public can read likes" ON likes;
CREATE POLICY "Public can read likes"
  ON likes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can like posts" ON likes;
CREATE POLICY "Authenticated users can like posts"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike own posts" ON likes;
CREATE POLICY "Users can unlike own posts"
  ON likes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- PART 4: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_cities_governorate_id ON cities(governorate_id);
CREATE INDEX IF NOT EXISTS idx_categories_name_en ON categories(name_en);
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);

-- ============================================================================
-- PART 5: CREATE RPC FUNCTIONS FOR LIKES COUNTING
-- ============================================================================

-- Function to increment likes count on posts table
CREATE OR REPLACE FUNCTION increment_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts SET likes = likes + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement likes count on posts table
CREATE OR REPLACE FUNCTION decrement_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts SET likes = GREATEST(likes - 1, 0) WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 6: SEED DATA (OPTIONAL - for testing without UI)
-- ============================================================================

-- Governorates (Iraq's 18 governorates + 1 region)
INSERT INTO governorates (name_en, name_ar, name_ku) VALUES
  ('Baghdad', 'بغداد', 'بەغدا'),
  ('Basra', 'البصرة', 'بەسرە'),
  ('Erbil', 'أربيل', 'هەولێر'),
  ('Dohuk', 'دهوك', 'دهۆک'),
  ('Sulaymaniyah', 'السليمانية', 'سلێمانی'),
  ('Mosul', 'الموصل', 'موسڵ'),
  ('Karbala', 'كربلاء', 'کەربلا'),
  ('Najaf', 'النجف', 'نەجەف'),
  ('Hilla', 'الحلة', 'ھیلە'),
  ('Ramadi', 'الرمادي', 'رەمادی'),
  ('Fallujah', 'الفلوجة', 'فەلوجە'),
  ('Samarra', 'سامراء', 'سامیرا'),
  ('Tikrit', 'تكريت', 'تێکریت'),
  ('Kirkuk', 'كركوك', 'کرکوک'),
  ('Tuz Khurmatu', 'تلعفر', 'توز خورماتو'),
  ('Amara', 'العمارة', 'عمارە'),
  ('Nasiriya', 'الناصرية', 'ناسیریە'),
  ('Diwaniyah', 'الديوانية', 'دیوانیە')
ON CONFLICT (name_en) DO NOTHING;

-- Categories (sample - owner can add more via admin)
INSERT INTO categories (name_en, name_ar, name_ku, icon_name, is_hot, sort_order) VALUES
  ('Hotels', 'فنادق', 'هتەلەکان', 'building', false, 1),
  ('Restaurants', 'مطاعم', 'ڕەستۆرانتەکان', 'utensils', true, 2),
  ('Shopping', 'تسوق', 'بازاڕکردن', 'shopping-bag', false, 3),
  ('Entertainment', 'ترفيه', 'چاوپێکەوتن', 'star', false, 4),
  ('Services', 'خدمات', 'خزمەتگوزاری', 'wrench', false, 5)
ON CONFLICT (name_en) DO NOTHING;

-- ============================================================================
-- PART 7: STORAGE BUCKETS
-- ============================================================================
-- NOTE: If the following SQL lines fail with permission errors,
-- create buckets manually in Supabase dashboard:
-- 1. go to Storage → Buckets
-- 2. Create "hero-images" (Public)
-- 3. Create "feed-images" (Public)
-- 4. Create "business-images" (Public)

-- Attempt to create buckets (may fail if you don't have service role access)
-- You can safely ignore errors here and create them in the Supabase dashboard instead
SELECT storage.create_bucket('hero-images', public => true)
  WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'hero-images');

SELECT storage.create_bucket('feed-images', public => true)
  WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'feed-images');

SELECT storage.create_bucket('business-images', public => true)
  WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'business-images');

-- ============================================================================
-- DONE!
-- ============================================================================
-- All missing tables, RLS policies, indexes, and functions are now set up.
-- The database is now fully aligned with frontend expectations.
