-- Migration 005: Comments Table RLS
-- This migration adds Row Level Security policies for the comments table

-- Enable RLS on comments if not already enabled
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Public can view comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Service role can do everything" ON public.comments;

-- RLS Policies
CREATE POLICY "Public can view comments"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can do everything"
  ON public.comments FOR ALL
  USING (auth.role() = 'service_role');

-- Add comment for documentation
COMMENT ON POLICY "Authenticated users can insert comments" ON public.comments IS 'Only authenticated users can create comments';
COMMENT ON POLICY "Users can update own comments" ON public.comments IS 'Users can only update their own comments';
