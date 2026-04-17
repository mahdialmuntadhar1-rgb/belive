-- Fix storage policies to allow uploads
-- Run this in Supabase SQL Editor

-- Drop existing policies for feed-images
DROP POLICY IF EXISTS "Public can view feed images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload feed images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update feed images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete feed images" ON storage.objects;

-- Drop existing policies for hero-images
DROP POLICY IF EXISTS "Public can view hero images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload hero images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update hero images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete hero images" ON storage.objects;

-- New policies for feed-images (more permissive for authenticated users)
CREATE POLICY "Public can view feed images"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'feed-images' );

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

-- New policies for hero-images (more permissive for authenticated users)
CREATE POLICY "Public can view hero images"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'hero-images' );

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
