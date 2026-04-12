-- Migration 007: Updated Timestamp Trigger
-- This migration creates a trigger to automatically update the updated_at column

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Add trigger to businesses (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'businesses') THEN
    DROP TRIGGER IF EXISTS update_businesses_updated_at ON public.businesses;
    CREATE TRIGGER update_businesses_updated_at
      BEFORE UPDATE ON public.businesses
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
END
$$;

-- Add comment for documentation
COMMENT ON FUNCTION public.update_updated_at() IS 'Automatically updates the updated_at column on row update';
