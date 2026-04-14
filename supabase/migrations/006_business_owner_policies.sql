-- Business Owner RLS Policies
-- This migration adds proper security for business owners to claim and manage their businesses

-- 1. Add business owner check function
CREATE OR REPLACE FUNCTION is_business_owner(user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'business_owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Enable RLS on businesses table if not already enabled
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing business owner policies if they exist
DROP POLICY IF EXISTS "Business owners can claim unclaimed businesses" ON businesses;
DROP POLICY IF EXISTS "Business owners can update their own businesses" ON businesses;
DROP POLICY IF EXISTS "Business owners can insert their own businesses" ON businesses;

-- 4. Create RLS policies for business owners

-- Allow business owners to claim unclaimed businesses (UPDATE owner_id when null)
CREATE POLICY "Business owners can claim unclaimed businesses"
ON businesses FOR UPDATE
USING (
  is_business_owner(auth.uid())
  AND owner_id IS NULL
)
WITH CHECK (
  is_business_owner(auth.uid())
  AND owner_id = auth.uid()
);

-- Allow business owners to update their own businesses
CREATE POLICY "Business owners can update their own businesses"
ON businesses FOR UPDATE
USING (
  is_business_owner(auth.uid())
  AND auth.uid() = owner_id
);

-- Allow business owners to insert new businesses (for creating their own listings)
CREATE POLICY "Business owners can insert their own businesses"
ON businesses FOR INSERT
WITH CHECK (
  is_business_owner(auth.uid())
  AND auth.uid() = owner_id
);

-- 5. Storage Policies for Business Owners
-- These policies allow business owners to upload images to business-media and post-images buckets

-- NOTE: These policies must be configured in Supabase Dashboard → Storage → [bucket] → Policies
-- For business-media bucket:
-- Policy Name: Business Owners Upload
-- Allowed Operations: INSERT
-- Definition: is_business_owner(auth.uid())
-- Target: Authenticated users with business_owner role

-- For post-images bucket:
-- Policy Name: Business Owners Upload Posts
-- Allowed Operations: INSERT
-- Definition: auth.uid() IN (SELECT owner_id FROM businesses WHERE id = business_id)
-- Target: Authenticated users who own the business

-- 6. Verification queries
-- Check if policies are created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'businesses'
ORDER BY policyname;
