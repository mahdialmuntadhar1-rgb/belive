-- Migration 002: Businesses Table
-- Creates the businesses table for business listings

CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  name_ar TEXT,
  name_ku TEXT,
  category TEXT NOT NULL,
  governorate TEXT NOT NULL,
  city TEXT NOT NULL,
  neighborhood TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  image_url TEXT,
  social_links JSONB,
  opening_hours TEXT,
  description TEXT,
  description_ar TEXT,
  description_ku TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE TRIGGER businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Policy: Anyone can read businesses
CREATE POLICY "Anyone can view businesses"
  ON public.businesses FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Only business owners can insert businesses
CREATE POLICY "Business owners can create businesses"
  ON public.businesses FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = owner_id AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'business_owner'
    )
  );

-- Policy: Only owners can update their businesses
CREATE POLICY "Owners can update own businesses"
  ON public.businesses FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Policy: Only owners can delete their businesses
CREATE POLICY "Owners can delete own businesses"
  ON public.businesses FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Policy: Service role can do anything
CREATE POLICY "Service role can manage businesses"
  ON public.businesses FOR ALL
  TO service_role
  USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS businesses_owner_id_idx ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS businesses_category_idx ON public.businesses(category);
CREATE INDEX IF NOT EXISTS businesses_governorate_idx ON public.businesses(governorate);
CREATE INDEX IF NOT EXISTS businesses_city_idx ON public.businesses(city);
CREATE INDEX IF NOT EXISTS businesses_is_featured_idx ON public.businesses(is_featured);
