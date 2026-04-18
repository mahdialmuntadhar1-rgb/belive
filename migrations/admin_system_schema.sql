-- Admin System Schema Migration
-- Run this in Supabase SQL Editor to set up tables and RLS policies

-- 1. Create hero_slides table
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

-- 2. Create features table
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

-- 3. Extend posts table if needed
ALTER TABLE posts ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'visible';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- 4. Ensure profiles table has role column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- 5. Enable RLS on new tables
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for hero_slides
DROP POLICY IF EXISTS "Allow public to view hero slides" ON hero_slides;
CREATE POLICY "Allow public to view hero slides"
  ON hero_slides FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow admins to manage hero slides" ON hero_slides;
CREATE POLICY "Allow admins to manage hero slides"
  ON hero_slides FOR ALL
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

-- 7. RLS Policies for features
DROP POLICY IF EXISTS "Allow public to view features" ON features;
CREATE POLICY "Allow public to view features"
  ON features FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow admins to manage features" ON features;
CREATE POLICY "Allow admins to manage features"
  ON features FOR ALL
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

-- 8. Update RLS policies for posts if not already set
-- Ensure admin role has full access to posts
DROP POLICY IF EXISTS "Allow admins to manage posts" ON posts;
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

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hero_slides_sort_order ON hero_slides(sort_order);
CREATE INDEX IF NOT EXISTS idx_features_sort_order ON features(sort_order);
CREATE INDEX IF NOT EXISTS idx_features_is_active ON features(is_active);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);

-- 10. Grant necessary permissions to anon key (should already exist)
-- This allows the public to read (via RLS policies above)
-- Authenticated users can read/write as per RLS

-- Done! Now set admin role for your user:
-- UPDATE profiles SET role = 'admin' WHERE id = 'your-user-id-here';
