-- Migration 008: Add Phone Field to Profiles
-- This migration adds a phone field to the profiles table for simplified registration

-- Add phone column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.phone IS 'User phone number for simplified registration flow';
