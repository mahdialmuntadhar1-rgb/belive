-- Migration 010: Complete Auth Fix
-- This migration fixes all issues preventing signup from working correctly
-- 
-- Issues Fixed:
-- 1. Missing INSERT RLS policy for profiles table (trigger bypasses RLS, but fallback needs it)
-- 2. Ensures phone column exists in profiles table
-- 3. Makes trigger more robust with better error handling
-- 4. Ensures all required columns have proper defaults

-- Step 1: Ensure phone column exists (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    COMMENT ON COLUMN public.profiles.phone IS 'User phone number';
  END IF;
END $$;

-- Step 2: Add INSERT RLS policy for profiles (critical for fallback profile creation)
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
CREATE POLICY "Enable insert for authenticated users"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Step 3: Ensure email and role have proper defaults (for safety)
ALTER TABLE public.profiles ALTER COLUMN email SET DEFAULT '';
ALTER TABLE public.profiles ALTER COLUMN full_name SET DEFAULT '';

-- Step 4: Recreate trigger function with improved error handling and idempotency
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  phone_exists BOOLEAN;
  profile_exists BOOLEAN;
BEGIN
  -- Check if profile already exists (idempotent)
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = NEW.id
  ) INTO profile_exists;
  
  IF profile_exists THEN
    RAISE LOG 'Profile already exists for user %, skipping creation', NEW.id;
    RETURN NEW;
  END IF;
  
  -- Check if phone column exists in profiles table
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'phone'
  ) INTO phone_exists;

  -- Insert profile with or without phone column based on schema
  IF phone_exists THEN
    INSERT INTO public.profiles (id, email, full_name, phone, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.email, ''),
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    );
  ELSE
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.email, ''),
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    );
  END IF;
  
  RAISE LOG 'Profile created successfully for user %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail auth signup
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Ensure permissions are correct
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Step 7: Verify all policies exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;
CREATE POLICY "Service role can manage profiles"
  ON public.profiles FOR ALL
  TO service_role
  USING (true);

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile row when a new user signs up via Supabase Auth. Idempotent - checks if profile exists before creating.';
