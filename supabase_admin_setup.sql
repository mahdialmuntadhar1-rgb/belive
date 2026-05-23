-- SQL Setup for Admin Content Management
-- This script creates/updates tables for Hero, Features, Categories, and Posts.

-- 1. Profiles (already exists, but ensuring role col)
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. Hero Slides (updated with localized fields)
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_ar TEXT,
  title_ku TEXT,
  title_en TEXT,
  subtitle_ar TEXT,
  subtitle_ku TEXT,
  subtitle_en TEXT,
  image_url TEXT NOT NULL,
  cta_text TEXT,
  cta_link TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Features
CREATE TABLE IF NOT EXISTS public.features (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_ar TEXT,
  title_ku TEXT,
  title_en TEXT,
  description_ar TEXT,
  description_ku TEXT,
  description_en TEXT,
  icon TEXT, -- Lucide icon name
  image_url TEXT,
  cta_link TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Categories (to override hardcoded ones)
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY, -- identifier like 'dining', 'hotels'
  name_ar TEXT,
  name_ku TEXT,
  name_en TEXT,
  icon TEXT, -- Lucide icon name
  image_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Posts / Shaku Maku (Feed)
-- This might already exist as 'posts', let's ensure the columns
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  business_name TEXT, -- cache name for easy display
  title TEXT,
  caption TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Enable RLS on all
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 7. Policies
-- Public Read
CREATE POLICY "Public Read Hero" ON public.hero_slides FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Features" ON public.features FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Posts" ON public.posts FOR SELECT USING (is_active = true);

-- Admin Write (ALL)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin All Hero') THEN
        CREATE POLICY "Admin All Hero" ON public.hero_slides FOR ALL 
        USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin All Features') THEN
        CREATE POLICY "Admin All Features" ON public.features FOR ALL 
        USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin All Categories') THEN
        CREATE POLICY "Admin All Categories" ON public.categories FOR ALL 
        USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin All Posts') THEN
        CREATE POLICY "Admin All Posts" ON public.posts FOR ALL 
        USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
    END IF;
END
$$;

-- 8. Storage Buckets
-- Ensure 'build-mode-images' bucket exists in dashboard with Public access.
-- Folders to be used: hero/, features/, businesses/, posts/
