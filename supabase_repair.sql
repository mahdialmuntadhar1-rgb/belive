-- Supabase Repair Script
-- 1. Create is_admin() function to break RLS recursion
-- This function uses SECURITY DEFINER to bypass RLS checks on the profiles table
-- when checking for the admin role, which prevents infinite recursion.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT (role = 'admin')
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix Profiles Table & RLS
-- Ensure role column exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Drop all existing policies on profiles to prevent recursion
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Non-recursive profile policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins have full access to profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- 3. Fix Categories Table
-- Ensure table exists with correct schema
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name_ar TEXT,
  name_ku TEXT,
  name_en TEXT,
  icon_name TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure specific columns exist if the table was created differently before
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon_name TEXT;

-- Ensure is_active exists on categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- RLS for Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin All Categories" ON public.categories;
CREATE POLICY "Admin All Categories" ON public.categories FOR ALL USING (public.is_admin());

-- 4. Fix Features Table
CREATE TABLE IF NOT EXISTS public.features (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_ar TEXT,
  title_ku TEXT,
  title_en TEXT,
  description_ar TEXT,
  description_ku TEXT,
  description_en TEXT,
  icon_name TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure is_active exists on features
ALTER TABLE public.features ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- RLS for Features
ALTER TABLE public.features ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Features" ON public.features;
CREATE POLICY "Public Read Features" ON public.features FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin All Features" ON public.features;
CREATE POLICY "Admin All Features" ON public.features FOR ALL USING (public.is_admin());

-- 5. Fix Hero Slides Table
-- Ensure is_active exists
ALTER TABLE public.hero_slides ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.hero_slides ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;
ALTER TABLE public.hero_slides ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.hero_slides ADD COLUMN IF NOT EXISTS title_en TEXT;

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to active slides" ON public.hero_slides;
CREATE POLICY "Allow public read access to active slides" ON public.hero_slides FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Allow admin full access" ON public.hero_slides;
CREATE POLICY "Allow admin full access" ON public.hero_slides FOR ALL USING (public.is_admin());

-- 6. Fix Posts Table
-- Ensure is_active exists
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Posts" ON public.posts;
CREATE POLICY "Public Read Posts" ON public.posts FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin All Posts" ON public.posts;
CREATE POLICY "Admin All Posts" ON public.posts FOR ALL USING (public.is_admin());

-- 7. Ensure categories columns exist then seed if empty
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS name_ar TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS name_ku TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon_name TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

INSERT INTO public.categories (id, name_en, name_ar, icon_name, display_order)
SELECT gen_random_uuid(), 'Dining', 'مطاعم', 'Utensils', 0
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name_en = 'Dining');

INSERT INTO public.categories (id, name_en, name_ar, icon_name, display_order)
SELECT gen_random_uuid(), 'Shopping', 'تسوق', 'ShoppingBag', 1
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name_en = 'Shopping');

INSERT INTO public.categories (id, name_en, name_ar, icon_name, display_order)
SELECT gen_random_uuid(), 'Services', 'خدمات', 'Briefcase', 2
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE name_en = 'Services');

-- 8. Ensure features columns exist then seed if empty
ALTER TABLE public.features ADD COLUMN IF NOT EXISTS title_en TEXT;
ALTER TABLE public.features ADD COLUMN IF NOT EXISTS title_ar TEXT;
ALTER TABLE public.features ADD COLUMN IF NOT EXISTS title_ku TEXT;
ALTER TABLE public.features ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE public.features ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE public.features ADD COLUMN IF NOT EXISTS description_ku TEXT;
ALTER TABLE public.features ADD COLUMN IF NOT EXISTS icon_name TEXT;
ALTER TABLE public.features ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

INSERT INTO public.features (title_en, title_ar, description_en, icon_name, display_order)
SELECT 'Smart Search', 'بحث ذكي', 'Find everything easily', 'Search', 0
WHERE NOT EXISTS (SELECT 1 FROM public.features WHERE title_en = 'Smart Search');

INSERT INTO public.features (title_en, title_ar, description_en, icon_name, display_order)
SELECT 'Verified Places', 'أماكن موثقة', 'High quality local businesses', 'ShieldCheck', 1
WHERE NOT EXISTS (SELECT 1 FROM public.features WHERE title_en = 'Verified Places');

-- 9. Fix Businesses Table RLS
-- Ensure is_active exists
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Businesses" ON public.businesses;
CREATE POLICY "Public Read Businesses" ON public.businesses FOR SELECT USING (is_active = true OR is_active IS NULL);

DROP POLICY IF EXISTS "Admin All Businesses" ON public.businesses;
CREATE POLICY "Admin All Businesses" ON public.businesses FOR ALL USING (public.is_admin());

-- 10. Fix Storage Buckets (create if missing, set to public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('hero-images', 'hero-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('post-images', 'post-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('belive-images', 'belive-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- 11. Storage RLS
-- DISABLE RLS MANUALLY VIA SUPABASE DASHBOARD:
-- 1. Go to Storage → Buckets
-- 2. Edit each bucket (hero-images, post-images, belive-images)
-- 3. Toggle "Enable RLS" to OFF
-- 4. Set Visibility to Public
-- This is the simplest approach for a single-owner app.
-- The buckets are created above in step 10 with public visibility.
