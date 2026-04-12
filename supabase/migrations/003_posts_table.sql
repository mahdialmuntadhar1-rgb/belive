-- Migration 003: Posts Table
-- Creates the posts table for business posts

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Policy: Anyone can read posts
CREATE POLICY "Anyone can view posts"
  ON public.posts FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Only business owners can insert posts for their businesses
CREATE POLICY "Business owners can create posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = business_id AND owner_id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'business_owner'
    )
  );

-- Policy: Business owners can delete their own posts
CREATE POLICY "Business owners can delete own posts"
  ON public.posts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = business_id AND owner_id = auth.uid()
    )
  );

-- Policy: Service role can do anything
CREATE POLICY "Service role can manage posts"
  ON public.posts FOR ALL
  TO service_role
  USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS posts_business_id_idx ON public.posts(business_id);
CREATE INDEX IF NOT EXISTS posts_created_by_idx ON public.posts(created_by);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON public.posts(created_at DESC);
