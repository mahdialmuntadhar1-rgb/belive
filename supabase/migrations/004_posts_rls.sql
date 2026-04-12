-- Migration 004: Posts Table RLS
-- This migration adds Row Level Security policies for the posts table

-- Enable RLS on posts if not already enabled
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Public can view posts" ON public.posts;
DROP POLICY IF EXISTS "Business owners can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Business owners can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Service role can do everything" ON public.posts;

-- RLS Policies
CREATE POLICY "Public can view posts"
  ON public.posts FOR SELECT
  USING (true);

CREATE POLICY "Business owners can insert posts"
  ON public.posts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = posts.businessId
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can update own posts"
  ON public.posts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = posts.businessId
      AND businesses.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = posts.businessId
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Service role can do everything"
  ON public.posts FOR ALL
  USING (auth.role() = 'service_role');

-- Add comment for documentation
COMMENT ON POLICY "Business owners can insert posts" ON public.posts IS 'Only business owners can create posts for businesses they own';
COMMENT ON POLICY "Business owners can update own posts" ON public.posts IS 'Users can only update posts for businesses they own';
