-- Fix schema to match app expectations
-- Run this in Supabase SQL Editor

-- Add display_order column to hero_slides (app uses this, not sort_order)
ALTER TABLE public.hero_slides
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

-- Copy data from sort_order to display_order for hero_slides
UPDATE public.hero_slides SET display_order = sort_order WHERE display_order IS NULL;

-- Add display_order column to feed_sections (app uses this, not sort_order)
ALTER TABLE public.feed_sections
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

-- Copy data from sort_order to display_order for feed_sections
UPDATE public.feed_sections SET display_order = sort_order WHERE display_order IS NULL;

-- Storage policies for hero-images bucket
-- Note: If policies already exist, this will fail - that's okay, skip to next section
CREATE POLICY "Public can view hero images"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'hero-images' );

CREATE POLICY "Admins can upload hero images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'hero-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update hero images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'hero-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete hero images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'hero-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Storage policies for feed-images bucket
CREATE POLICY "Public can view feed images"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'feed-images' );

CREATE POLICY "Admins can upload feed images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'feed-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update feed images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'feed-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete feed images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'feed-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
