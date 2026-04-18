-- BELIVE PRODUCTION SETUP
-- Run this entire script in Supabase SQL Editor
-- This sets up all tables, columns, RLS policies, and storage buckets

-- ============================================================================
-- PART 1: ENSURE ALL TABLES AND COLUMNS EXIST
-- ============================================================================

-- 1. Profiles table - users and their roles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user', -- 'user', 'business_owner', 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  name_ar TEXT,
  name_ku TEXT,
  category VARCHAR(100),
  governorate VARCHAR(100),
  city VARCHAR(100),
  neighborhood VARCHAR(100),
  address TEXT,
  phone VARCHAR(20),
  phone_1 VARCHAR(20),
  phone_2 VARCHAR(20),
  website TEXT,
  image_url TEXT,
  description TEXT,
  description_ar TEXT,
  description_ku TEXT,
  opening_hours TEXT,
  social_links JSONB DEFAULT '{}',
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  lat NUMERIC,
  lng NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT,
  content TEXT,
  caption TEXT,
  image_url TEXT,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'visible', -- 'visible' or 'hidden'
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Claim requests table
CREATE TABLE IF NOT EXISTS claim_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Likes table (optional, for tracking who liked what)
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 7. Hero slides table
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

-- 8. Features table
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

-- ============================================================================
-- PART 2: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_business_id ON posts(business_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_likes ON posts(likes DESC);
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_governorate ON businesses(governorate);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_hero_slides_sort_order ON hero_slides(sort_order);
CREATE INDEX IF NOT EXISTS idx_claim_requests_status ON claim_requests(status);
CREATE INDEX IF NOT EXISTS idx_claim_requests_business_id ON claim_requests(business_id);

-- ============================================================================
-- PART 3: ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 4: RLS POLICIES FOR PROFILES
-- ============================================================================

DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admin can read all profiles" ON profiles;
CREATE POLICY "Admin can read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- PART 5: RLS POLICIES FOR BUSINESSES
-- ============================================================================

DROP POLICY IF EXISTS "Public can read all businesses" ON businesses;
CREATE POLICY "Public can read all businesses"
  ON businesses FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Business owners can update own business" ON businesses;
CREATE POLICY "Business owners can update own business"
  ON businesses FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Business owners can insert business" ON businesses;
CREATE POLICY "Business owners can insert business"
  ON businesses FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Admin can manage all businesses" ON businesses;
CREATE POLICY "Admin can manage all businesses"
  ON businesses FOR ALL
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

-- ============================================================================
-- PART 6: RLS POLICIES FOR POSTS (CRITICAL: VISIBILITY FILTERING)
-- ============================================================================

DROP POLICY IF EXISTS "Public can read visible posts" ON posts;
CREATE POLICY "Public can read visible posts"
  ON posts FOR SELECT
  USING (status = 'visible' OR status IS NULL);

DROP POLICY IF EXISTS "Authenticated users can read all posts" ON posts;
CREATE POLICY "Authenticated users can read all posts"
  ON posts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;
CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Business owners can update own posts" ON posts;
CREATE POLICY "Business owners can update own posts"
  ON posts FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = posts.business_id
      AND businesses.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = posts.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Business owners can delete own posts" ON posts;
CREATE POLICY "Business owners can delete own posts"
  ON posts FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = posts.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admin can manage all posts" ON posts;
CREATE POLICY "Admin can manage all posts"
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

-- ============================================================================
-- PART 7: RLS POLICIES FOR COMMENTS
-- ============================================================================

DROP POLICY IF EXISTS "Public can read comments" ON comments;
CREATE POLICY "Public can read comments"
  ON comments FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON comments;
CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- PART 8: RLS POLICIES FOR CLAIM REQUESTS
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can create claim requests" ON claim_requests;
CREATE POLICY "Authenticated users can create claim requests"
  ON claim_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own claim requests" ON claim_requests;
CREATE POLICY "Users can read own claim requests"
  ON claim_requests FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can manage claim requests" ON claim_requests;
CREATE POLICY "Admin can manage claim requests"
  ON claim_requests FOR ALL
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

-- ============================================================================
-- PART 9: RLS POLICIES FOR POST LIKES
-- ============================================================================

DROP POLICY IF EXISTS "Public can read post likes" ON post_likes;
CREATE POLICY "Public can read post likes"
  ON post_likes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can like posts" ON post_likes;
CREATE POLICY "Authenticated users can like posts"
  ON post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike own posts" ON post_likes;
CREATE POLICY "Users can unlike own posts"
  ON post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- PART 10: RLS POLICIES FOR HERO SLIDES
-- ============================================================================

DROP POLICY IF EXISTS "Public can read hero slides" ON hero_slides;
CREATE POLICY "Public can read hero slides"
  ON hero_slides FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin can manage hero slides" ON hero_slides;
CREATE POLICY "Admin can manage hero slides"
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

-- ============================================================================
-- PART 11: RLS POLICIES FOR FEATURES
-- ============================================================================

DROP POLICY IF EXISTS "Public can read features" ON features;
CREATE POLICY "Public can read features"
  ON features FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin can manage features" ON features;
CREATE POLICY "Admin can manage features"
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

-- ============================================================================
-- PART 12: STORAGE BUCKETS
-- ============================================================================
-- NOTE: Storage buckets must be created in the Supabase UI
-- You must manually:
-- 1. Create bucket: "feed-images" (Public)
-- 2. Create bucket: "business-images" (Public)
-- 3. Set CORS policies if needed
--
-- OR use this SQL (may require service role key):
-- SELECT storage.create_bucket('feed-images', public => true);
-- SELECT storage.create_bucket('business-images', public => true);

-- ============================================================================
-- PART 13: VERIFICATION SCRIPT
-- ============================================================================
-- Run this after setup to verify everything is in place:
/*
SELECT
  'Profiles table' as check_item,
  COUNT(*) as record_count
FROM profiles
UNION ALL
SELECT 'Businesses table', COUNT(*) FROM businesses
UNION ALL
SELECT 'Posts table', COUNT(*) FROM posts
UNION ALL
SELECT 'Claim requests table', COUNT(*) FROM claim_requests
UNION ALL
SELECT 'Hero slides table', COUNT(*) FROM hero_slides;
*/

-- ============================================================================
-- DONE!
-- ============================================================================
-- All tables, columns, indexes, and RLS policies are now set up.
-- Next steps:
-- 1. Create storage buckets (feed-images, business-images) in Supabase UI
-- 2. Create admin user: UPDATE profiles SET role = 'admin' WHERE id = '[YOUR_USER_ID]';
-- 3. Deploy the app to Vercel with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
