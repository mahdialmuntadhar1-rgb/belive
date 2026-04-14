 
-- Supabase Storage Buckets Setup
-- NOTE: Storage policies must be configured in Supabase Dashboard
-- The storage.policies table structure has changed in newer Supabase versions

-- ============================================
-- STEP 1: Create Buckets in Supabase Dashboard
-- ============================================
-- Go to: Supabase Dashboard → Storage → Create New Bucket
-- Create these 3 buckets:

-- 1. hero-images
--    - Public bucket: Yes
--    - File size limit: 5MB
--    - Allowed MIME types: image/*

-- 2. post-images
--    - Public bucket: Yes
--    - File size limit: 5MB
--    - Allowed MIME types: image/*

-- 3. business-media
--    - Public bucket: Yes
--    - File size limit: 10MB
--    - Allowed MIME types: image/*

-- ============================================
-- STEP 2: Configure Policies in Dashboard
-- ============================================
-- For each bucket, go to: Storage → [bucket-name] → Policies
-- Create these policies:

-- PUBLIC READ POLICY (for all buckets):
-- Name: Public Read
-- Allowed operations: SELECT
-- Definition: true
-- Target: All users

-- ADMIN UPLOAD POLICY (for all buckets):
-- Name: Admin Upload
-- Allowed operations: INSERT, UPDATE, DELETE
-- Definition: is_admin(auth.uid())
-- Target: Authenticated users with admin role

-- ============================================
-- STEP 3: Verification
-- ============================================
-- After creating buckets and policies, verify by:
-- 1. Check buckets appear in Storage section
-- 2. Upload a test image to each bucket
-- 3. Verify you can access the public URL
-- 4. Check policies are listed in bucket settings