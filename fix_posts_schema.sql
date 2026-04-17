-- Fix posts table schema to match frontend expectations
-- Run this in Supabase SQL Editor

-- Add business_id column to posts table (nullable for general feed posts)
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL;

-- Add status column to posts table (visible/hidden)
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'visible' CHECK (status IN ('visible', 'hidden'));

-- Add index for business_id to improve query performance
CREATE INDEX IF NOT EXISTS posts_business_id_idx ON public.posts(business_id);

-- Add index for status to improve query performance
CREATE INDEX IF NOT EXISTS posts_status_idx ON public.posts(status);
