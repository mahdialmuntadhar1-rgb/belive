-- Full Admin System Migration
-- Run this in Supabase SQL Editor to set up complete admin system

-- ============================================
-- PART 1: APP SETTINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title_ar TEXT DEFAULT 'أهلاً بك في شاكوماكو',
  hero_subtitle_ar TEXT DEFAULT 'اكتشف أفضل الأماكن والخدمات في منطقتك',
  hero_image_url TEXT,
  featured_label TEXT DEFAULT 'مميز',
  trending_label TEXT DEFAULT 'رائج',
  maintenance_mode BOOLEAN DEFAULT FALSE,
  registration_enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = '00000000-0000-0000-0000-000000000001'::uuid)
);

-- Insert default settings row
INSERT INTO app_settings (id, hero_title_ar, hero_subtitle_ar)
VALUES ('00000000-0000-0000-0000-000000000001', 'أهلاً بك في شاكوماكو', 'اكتشف أفضل الأماكن والخدمات في منطقتك')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on app_settings
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "app_settings_admin_all" ON app_settings;
DROP POLICY IF EXISTS "app_settings_public_read" ON app_settings;

-- Create RLS policies for app_settings
CREATE POLICY "Admins can do everything on app_settings"
ON app_settings FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Public can read app_settings"
ON app_settings FOR SELECT
USING (true);

-- ============================================
-- PART 2: POSTS TABLE (Shaku Maku Feed)
-- ============================================

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_trending BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_business_id ON posts(business_id);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_posts_trending ON posts(is_trending);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Enable RLS on posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "posts_admin_all" ON posts;
DROP POLICY IF EXISTS "posts_public_read" ON posts;
DROP POLICY IF EXISTS "posts_business_owner" ON posts;

-- Create RLS policies for posts
CREATE POLICY "Admins can do everything on posts"
ON posts FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Public can read posts"
ON posts FOR SELECT
USING (true);

CREATE POLICY "Business owners can manage their posts"
ON posts FOR ALL
USING (
  auth.uid() IN (
    SELECT owner_id FROM businesses WHERE id = posts.business_id
  )
);

-- ============================================
-- PART 3: VERIFY SETUP
-- ============================================

-- Check app_settings
SELECT * FROM app_settings;

-- Check posts
SELECT COUNT(*) as post_count FROM posts;

-- Check is_admin function exists
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'is_admin';

-- Expected output:
-- app_settings: 1 row with default settings
-- posts: 0 rows (empty initially)
-- is_admin: function exists
