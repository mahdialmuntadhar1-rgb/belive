-- Fix schema to match app expectations

-- Add display_order column (app uses this, not sort_order)
ALTER TABLE public.hero_slides 
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

-- Add hero-images bucket policies (app uploads here)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for hero-images bucket
CREATE POLICY IF NOT EXISTS "Public can view hero images"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'hero-images' );

CREATE POLICY IF NOT EXISTS "Admins can upload hero images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'hero-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can update hero images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'hero-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY IF NOT EXISTS "Admins can delete hero images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'hero-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
