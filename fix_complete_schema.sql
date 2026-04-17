-- ============================================================
-- COMPLETE SCHEMA FIX - Run this in Supabase SQL Editor
-- Covers: posts table, hero_slides, storage buckets & policies, RLS
-- ============================================================

-- ============================================================
-- 1. POSTS TABLE - Fix schema mismatches
-- ============================================================

-- Add business_id (snake_case) as the canonical FK column
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL;

-- Add status column
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'visible' CHECK (status IN ('visible', 'hidden'));

-- Add views column
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Add title column
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS title TEXT;

-- Add caption column
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS caption TEXT;

-- Add image_url column (canonical)
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Ensure likes column exists
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

-- Add is_verified column
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Indexes
CREATE INDEX IF NOT EXISTS posts_business_id_idx ON public.posts(business_id);
CREATE INDEX IF NOT EXISTS posts_status_idx ON public.posts(status);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON public.posts(created_at DESC);

-- ============================================================
-- 2. HERO_SLIDES TABLE - Ensure display_order column exists
-- ============================================================

ALTER TABLE public.hero_slides
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Ensure other needed columns exist
ALTER TABLE public.hero_slides
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE public.hero_slides
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Index
CREATE INDEX IF NOT EXISTS hero_slides_display_order_idx ON public.hero_slides(display_order);

-- ============================================================
-- 3. BUSINESSES TABLE - Ensure image_url column exists
-- ============================================================

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS whatsapp TEXT;

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- ============================================================
-- 4. RLS POLICIES - Posts
-- ============================================================

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop old policies first
DROP POLICY IF EXISTS "Public can view visible posts" ON public.posts;
DROP POLICY IF EXISTS "Admin full access posts" ON public.posts;
DROP POLICY IF EXISTS "Business owners can create posts" ON public.posts;
DROP POLICY IF EXISTS "Business owners can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated can view posts" ON public.posts;

-- Allow anyone to read visible posts
CREATE POLICY "Public can view visible posts"
  ON public.posts FOR SELECT
  USING (status = 'visible' OR status IS NULL);

-- Admin full access
CREATE POLICY "Admin full access posts"
  ON public.posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Business owners can insert posts for their own business
CREATE POLICY "Business owners can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      business_id IS NULL OR
      EXISTS (
        SELECT 1 FROM public.businesses
        WHERE businesses.id = business_id AND businesses.owner_id = auth.uid()
      )
    )
  );

-- Business owners can update their own posts
CREATE POLICY "Business owners can update own posts"
  ON public.posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = business_id AND businesses.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================================
-- 5. RLS POLICIES - Businesses
-- ============================================================

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view businesses" ON public.businesses;
DROP POLICY IF EXISTS "Admin full access businesses" ON public.businesses;
DROP POLICY IF EXISTS "Owners can update own business" ON public.businesses;

CREATE POLICY "Public can view businesses"
  ON public.businesses FOR SELECT
  USING (true);

CREATE POLICY "Admin full access businesses"
  ON public.businesses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Owners can update own business"
  ON public.businesses FOR UPDATE
  USING (owner_id = auth.uid());

-- ============================================================
-- 6. RLS POLICIES - Hero Slides
-- ============================================================

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active hero slides" ON public.hero_slides;
DROP POLICY IF EXISTS "Admin full access hero slides" ON public.hero_slides;

CREATE POLICY "Public can view active hero slides"
  ON public.hero_slides FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin full access hero slides"
  ON public.hero_slides FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================================
-- 7. STORAGE BUCKETS - Create if not exist
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('feed-images', 'feed-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ============================================================
-- 8. STORAGE POLICIES
-- ============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view hero images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload hero images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update hero images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete hero images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view feed images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload feed images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update feed images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete feed images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload hero images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update hero images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete hero images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload feed images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update feed images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete feed images" ON storage.objects;

-- Hero-images: public read, authenticated write
CREATE POLICY "Public can view hero images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'hero-images');

CREATE POLICY "Authenticated can upload hero images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'hero-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated can update hero images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'hero-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated can delete hero images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'hero-images' AND
    auth.role() = 'authenticated'
  );

-- Feed-images: public read, authenticated write
CREATE POLICY "Public can view feed images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'feed-images');

CREATE POLICY "Authenticated can upload feed images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'feed-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated can update feed images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'feed-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated can delete feed images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'feed-images' AND
    auth.role() = 'authenticated'
  );
