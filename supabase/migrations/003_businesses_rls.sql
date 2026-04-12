-- Migration 003: Businesses Table RLS
-- This migration adds Row Level Security policies for the businesses table

-- Enable RLS on businesses if not already enabled
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Public can view businesses" ON public.businesses;
DROP POLICY IF EXISTS "Business owners can insert businesses" ON public.businesses;
DROP POLICY IF EXISTS "Business owners can update own businesses" ON public.businesses;
DROP POLICY IF EXISTS "Service role can do everything" ON public.businesses;

-- RLS Policies
CREATE POLICY "Public can view businesses"
  ON public.businesses FOR SELECT
  USING (true);

CREATE POLICY "Business owners can insert businesses"
  ON public.businesses FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Business owners can update own businesses"
  ON public.businesses FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Service role can do everything"
  ON public.businesses FOR ALL
  USING (auth.role() = 'service_role');

-- Add comment for documentation
COMMENT ON POLICY "Business owners can insert businesses" ON public.businesses IS 'Only authenticated users can create businesses, and they become the owner';
COMMENT ON POLICY "Business owners can update own businesses" ON public.businesses IS 'Users can only update businesses they own';
