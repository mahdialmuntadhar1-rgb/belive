-- Supabase Schema v2 - Build Mode Migration
-- This schema enables admin-controlled content management via Supabase
-- All editable content (hero, feed, posts) is stored in Supabase only
-- No localStorage or local file fallbacks for production

-- ============================================================================
-- TABLES
-- ============================================================================

-- Hero Slides Table
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_en TEXT,
  title_ar TEXT,
  title_ku TEXT,
  subtitle_en TEXT,
  subtitle_ar TEXT,
  subtitle_ku TEXT,
  image_url TEXT NOT NULL,
  cta_text_en TEXT,
  cta_text_ar TEXT,
  cta_text_ku TEXT,
  cta_link TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES auth.users(id)
);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS hero_slides_sort_order_idx ON public.hero_slides(sort_order);
CREATE INDEX IF NOT EXISTS hero_slides_is_active_idx ON public.hero_slides(is_active);

-- Feed Sections Table
CREATE TABLE IF NOT EXISTS public.feed_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  title_ku TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  description_ku TEXT,
  section_type TEXT NOT NULL, -- 'featured', 'trending', 'categories', etc.
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  config JSONB, -- Flexible config for different section types
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS feed_sections_sort_order_idx ON public.feed_sections(sort_order);
CREATE INDEX IF NOT EXISTS feed_sections_is_active_idx ON public.feed_sections(is_active);
CREATE INDEX IF NOT EXISTS feed_sections_type_idx ON public.feed_sections(section_type);

-- Update Posts Table to support new schema
ALTER TABLE public.posts 
  ADD COLUMN IF NOT EXISTS post_type TEXT DEFAULT 'social',
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS posts_post_type_idx ON public.posts(post_type);
CREATE INDEX IF NOT EXISTS posts_is_featured_idx ON public.posts(is_featured);
CREATE INDEX IF NOT EXISTS posts_is_active_idx ON public.posts(is_active);
CREATE INDEX IF NOT EXISTS posts_sort_order_idx ON public.posts(sort_order);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Hero Slides Policies
-- Public can read active slides
CREATE POLICY "Public can read active hero slides"
  ON public.hero_slides FOR SELECT
  USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage hero slides"
  ON public.hero_slides FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Feed Sections Policies
-- Public can read active sections
CREATE POLICY "Public can read active feed sections"
  ON public.feed_sections FOR SELECT
  USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage feed sections"
  ON public.feed_sections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Posts Policies
-- Public can read active posts
CREATE POLICY "Public can read active posts"
  ON public.posts FOR SELECT
  USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage posts"
  ON public.posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- STORAGE BUCKET SETUP
-- ============================================================================

-- Create storage bucket for build mode images
-- Note: This must be created manually in Supabase Dashboard first
-- Bucket name: build-mode-images

-- Storage Policies for build-mode-images bucket
-- Public read access
CREATE POLICY "Public can view build mode images"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'build-mode-images' );

-- Admins can upload
CREATE POLICY "Admins can upload build mode images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'build-mode-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admins can update
CREATE POLICY "Admins can update build mode images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'build-mode-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Admins can delete
CREATE POLICY "Admins can delete build mode images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'build-mode-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_hero_slides_updated_at
  BEFORE UPDATE ON public.hero_slides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feed_sections_updated_at
  BEFORE UPDATE ON public.feed_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Uncomment to insert sample hero slides
/*
INSERT INTO public.hero_slides (title_en, title_ar, title_ku, subtitle_en, subtitle_ar, subtitle_ku, image_url, cta_text_en, cta_text_ar, cta_text_ku, cta_link, sort_order, is_active)
VALUES 
(
  'Discover Baghdad', 'اكتشف بغداد', 'بەغدا بدۆزەرەوە',
  'Find the best places to eat, shop and stay in the heart of Iraq.', 'ابحث عن أفضل الأماكن للأكل والتسوق والإقامة في قلب العراق.', 'باشترین شوێنەکان بۆ خواردن و بازاڕکردن و مانەوە لە دڵی عێراق بدۆزەرەوە.',
  'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=1200&auto=format&fit=crop',
  'Explore Now', 'استكشف الآن', 'ئێستا بگەڕێ',
  '/directory', 0, true
),
(
  'Grow Your Business', 'نمّي عملك التجاري', 'کارەکەت گەشە پێ بدە',
  'List your business today and reach thousands of customers across Iraq.', 'أدرج عملك اليوم وتواصل مع آلاف العملاء في جميع أنحاء العراق.', 'ئەمڕۆ کارەکەت لیست بکە و بگە بە هەزاران کڕیار لە سەرتاسەری عێراق.',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop',
  'Get Started', 'ابدأ الآن', 'دەست پێ بکە',
  '/claim', 1, true
);
*/

-- Uncomment to insert sample feed sections
/*
INSERT INTO public.feed_sections (title_en, title_ar, title_ku, description_en, description_ar, description_ku, section_type, sort_order, is_active)
VALUES 
(
  'Featured Businesses', 'الأعمال المميزة', 'کارە تایبەتمەندەکان',
  'Top rated businesses in your area', 'أعلى الشركات تقييمًا في منطقتك', 'باشترین کارەکان لە ناوچەکەتدا',
  'featured', 0, true
),
(
  'Trending Now', 'الرائج الآن', 'ئێستا بەناوبانگە',
  'What people are talking about', 'ماذا يتحدث الناس', 'خەڵک چی دەڵێن',
  'trending', 1, true
);
*/
