-- Admin Dashboard Setup Migration
-- Run this in Supabase SQL Editor to set up admin access control

-- 1. Add role column to profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 3. Create admin check function
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Enable RLS on profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "profiles_admin_access" ON profiles;
DROP POLICY IF EXISTS "profiles_self_access" ON profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;

-- 6. Create RLS policies for profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Admins can read all profiles"
ON profiles FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- 7. Enable RLS on businesses table if not already enabled
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- 8. Drop existing business policies if they exist
DROP POLICY IF EXISTS "businesses_admin_access" ON businesses;
DROP POLICY IF EXISTS "businesses_public_read" ON businesses;
DROP POLICY IF EXISTS "businesses_owner_update" ON businesses;
DROP POLICY IF EXISTS "businesses_owner_delete" ON businesses;

-- 9. Create RLS policies for businesses
DROP POLICY IF EXISTS "Admins can do everything" ON businesses;
DROP POLICY IF EXISTS "Public can read businesses" ON businesses;

CREATE POLICY "Admins can do everything"
ON businesses FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Public can read businesses"
ON businesses FOR SELECT
USING (true);

-- 10. Create app_settings table for admin content control
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can do everything on app_settings" ON app_settings;
DROP POLICY IF EXISTS "Public can read app_settings" ON app_settings;

-- Create RLS policies for app_settings
CREATE POLICY "Admins can do everything on app_settings"
ON app_settings FOR ALL
USING (is_admin(auth.uid()));

CREATE POLICY "Public can read app_settings"
ON app_settings FOR SELECT
USING (true);

-- 11. Create posts table for Shaku Maku feed
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

-- Create indexes for posts
CREATE INDEX IF NOT EXISTS idx_posts_business_id ON posts(business_id);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_posts_trending ON posts(is_trending);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Enable RLS on posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can do everything on posts" ON posts;
DROP POLICY IF EXISTS "Public can read posts" ON posts;
DROP POLICY IF EXISTS "Business owners can manage their posts" ON posts;

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

-- 12. IMPORTANT: Set your user as admin
-- REPLACE 'mahdialmuntadhar1@gmail.com' with your actual email
UPDATE profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'mahdialmuntadhar1@gmail.com');

-- 13. Verification queries
SELECT email, role 
FROM profiles 
WHERE email = 'mahdialmuntadhar1@gmail.com';

SELECT * FROM app_settings;
SELECT COUNT(*) as post_count FROM posts;
