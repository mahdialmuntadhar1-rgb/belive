-- Add display_order columns only (skip policies - they already exist)
-- Run this in Supabase SQL Editor

-- Add display_order column to hero_slides
ALTER TABLE public.hero_slides
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

-- Copy data from sort_order to display_order for hero_slides
UPDATE public.hero_slides SET display_order = sort_order WHERE display_order IS NULL;

-- Add display_order column to feed_sections
ALTER TABLE public.feed_sections
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

-- Copy data from sort_order to display_order for feed_sections
UPDATE public.feed_sections SET display_order = sort_order WHERE display_order IS NULL;
