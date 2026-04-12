-- Migration 006: Likes Table RLS
-- This migration adds Row Level Security policies for the likes table

-- Enable RLS on likes if not already enabled
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Public can view likes" ON public.likes;
DROP POLICY IF EXISTS "Authenticated users can insert likes" ON public.likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON public.likes;
DROP POLICY IF EXISTS "Service role can do everything" ON public.likes;

-- RLS Policies
CREATE POLICY "Public can view likes"
  ON public.likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert likes"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can do everything"
  ON public.likes FOR ALL
  USING (auth.role() = 'service_role');

-- Add comment for documentation
COMMENT ON POLICY "Authenticated users can insert likes" ON public.likes IS 'Only authenticated users can like posts';
COMMENT ON POLICY "Users can delete own likes" ON public.likes IS 'Users can only unlike their own likes';
