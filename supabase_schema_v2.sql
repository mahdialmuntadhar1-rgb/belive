-- --------------------------------------------------------------------------------
-- PRODUCTION ARCHITECTURE SETUP: SUPABASE
-- Run this directly in the Supabase SQL Editor
-- --------------------------------------------------------------------------------

-- 1. PROFILES & ROLES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: Ensure mahdialmuntadhar1@gmail.com has role='admin' in public.profiles.

-- 2. HERO SLIDES
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hero_slides_order ON public.hero_slides(sort_order);

-- 3. FEED SECTIONS
CREATE TABLE IF NOT EXISTS public.feed_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  subtitle TEXT,
  image_url TEXT,
  content TEXT,
  sort_order INT DEFAULT 0,
  visibility BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_feed_sections_order ON public.feed_sections(sort_order);

-- 4. BUSINESSES ALTERATIONS (Assuming it exists)
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.businesses 
      ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id),
      ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  EXCEPTION
    WHEN duplicate_column THEN NULL;
  END;
END $$;
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_user_id);

-- 5. POSTS (SHAKU MAKU, POSTCARD, NORMAL)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  image_url TEXT,
  caption TEXT,
  author_name TEXT,
  post_type TEXT CHECK (post_type IN ('shaku_maku', 'postcard', 'normal')),
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  likes INT DEFAULT 0,
  owner_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_posts_type_order ON public.posts(post_type, sort_order);
CREATE INDEX IF NOT EXISTS idx_posts_owner ON public.posts(owner_user_id);

-- --------------------------------------------------------------------------------
-- TRIGGER FOR UPDATED_AT
-- --------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_hero_updated_at ON public.hero_slides;
CREATE TRIGGER set_hero_updated_at BEFORE UPDATE ON public.hero_slides FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_feed_updated_at ON public.feed_sections;
CREATE TRIGGER set_feed_updated_at BEFORE UPDATE ON public.feed_sections FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_posts_updated_at ON public.posts;
CREATE TRIGGER set_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- --------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- --------------------------------------------------------------------------------
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check Admin Role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hero Slides RLS
CREATE POLICY "Public Read Hero" ON public.hero_slides FOR SELECT USING (is_active = true);
CREATE POLICY "Admin All Hero" ON public.hero_slides FOR ALL USING (public.is_admin());

-- Feed Sections RLS
CREATE POLICY "Public Read Feed" ON public.feed_sections FOR SELECT USING (visibility = true);
CREATE POLICY "Admin All Feed" ON public.feed_sections FOR ALL USING (public.is_admin());

-- Businesses RLS
-- Note: You might already have business policies, this is the strict overlay for owners/admins.
CREATE POLICY "Public Read Businesses" ON public.businesses FOR SELECT USING (true);
CREATE POLICY "Admin All Businesses" ON public.businesses FOR ALL USING (public.is_admin());
CREATE POLICY "Owner Edit Own Business" ON public.businesses FOR UPDATE USING (auth.uid() = owner_user_id);

-- Posts RLS (Split INSERT / UPDATE / DELETE)
CREATE POLICY "Public Read Posts" ON public.posts FOR SELECT USING (is_active = true);
-- Admins get full control globally
CREATE POLICY "Admin All Posts" ON public.posts FOR ALL USING (public.is_admin());
-- Business Owners rules
CREATE POLICY "Owner Insert Posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "Owner Update Posts" ON public.posts FOR UPDATE USING (auth.uid() = owner_user_id);
CREATE POLICY "Owner Delete Posts" ON public.posts FOR DELETE USING (auth.uid() = owner_user_id);

-- --------------------------------------------------------------------------------
-- STORAGE BUCKET SETUP
-- --------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) 
VALUES ('build-mode-images', 'build-mode-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy Definitions
CREATE POLICY "Public read storage" ON storage.objects FOR SELECT USING (bucket_id = 'build-mode-images');

CREATE POLICY "Admin insert storage" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'build-mode-images' AND public.is_admin()
);
CREATE POLICY "Admin update storage" ON storage.objects FOR UPDATE USING (
  bucket_id = 'build-mode-images' AND public.is_admin()
);
CREATE POLICY "Admin delete storage" ON storage.objects FOR DELETE USING (
  bucket_id = 'build-mode-images' AND public.is_admin()
);

-- Give owners permission to upload their own images
CREATE POLICY "Owner insert storage" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'build-mode-images' AND auth.role() = 'authenticated' AND NOT public.is_admin()
);
-- Optional: if you want to let owners delete their own uploads:
-- CREATE POLICY "Owner delete storage" ON storage.objects FOR DELETE USING (bucket_id = 'build-mode-images' AND owner = auth.uid());
