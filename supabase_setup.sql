-- SQL to setup Hero Slides in Supabase

-- 1. Create hero_slides table
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
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
-- Allow public read access to active slides
CREATE POLICY "Allow public read access to active slides"
  ON public.hero_slides FOR SELECT
  USING (is_active = true);

-- Allow admin full access
-- Note: This assumes your profiles table has a 'role' column
CREATE POLICY "Allow admin full access"
  ON public.hero_slides FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Storage Bucket Setup
-- You need to create a bucket named 'hero-images' in the Supabase Dashboard
-- and set it to Public.
-- Then run these policies:

/*
-- Storage Policies for 'hero-images' bucket
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'hero-images' );

CREATE POLICY "Admin Upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'hero-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin Update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'hero-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin Delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'hero-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
*/

-- 5. Sample Seed Data
/*
INSERT INTO public.hero_slides (title_en, title_ar, title_ku, subtitle_en, subtitle_ar, subtitle_ku, image_url, cta_text_en, cta_text_ar, cta_text_ku, cta_link, display_order)
VALUES 
(
  'Discover Baghdad', 'اكتشف بغداد', 'بەغدا بدۆزەرەوە',
  'Find the best places to eat, shop and stay in the heart of Iraq.', 'ابحث عن أفضل الأماكن للأكل والتسوق والإقامة في قلب العراق.', 'باشترین شوێنەکان بۆ خواردن و بازاڕکردن و مانەوە لە دڵی عێراق بدۆزەرەوە.',
  'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=1200&auto=format&fit=crop',
  'Explore Now', 'استكشف الآن', 'ئێستا بگەڕێ',
  '/directory', 0
),
(
  'Grow Your Business', 'نمّي عملك التجاري', 'کارەکەت گەشە پێ بدە',
  'List your business today and reach thousands of customers across Iraq.', 'أدرج عملك اليوم وتواصل مع آلاف العملاء في جميع أنحاء العراق.', 'ئەمڕۆ کارەکەت لیست بکە و بگە بە هەزاران کڕیار لە سەرتاسەری عێراق.',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop',
  'Get Started', 'ابدأ الآن', 'دەست پێ بکە',
  '/claim', 1
),
(
  'Iraqi Flavors', 'نكهات عراقية', 'تام و چێژی عێراقی',
  'Experience the authentic taste of Iraq with our curated restaurant guide.', 'عش تجربة المذاق العراقي الأصيل مع دليل المطاعم المنسق لدينا.', 'تام و چێژی ڕەسەنی عێراق تاقی بکەرەوە لەگەڵ ڕێبەری چێشتخانەکانمان.',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1200&auto=format&fit=crop',
  'View Restaurants', 'عرض المطاعم', 'بینینی چێشتخانەکان',
  '/directory?category=restaurants', 2
);
*/
