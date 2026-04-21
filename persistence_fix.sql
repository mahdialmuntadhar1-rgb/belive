-- end-to-end Persistence Fix SQL

-- 1. Grant Admin Role to the Owner
-- This ensures the OWNER_EMAIL mentioned in localBuildStore.ts has DB-level permissions
UPDATE public.profiles 
SET role = 'admin' 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'mahdialmuntadhar1@gmail.com'
);

-- 2. Ensure Storage Buckets exist and are Public
-- Note: These must be run in the SQL editor, but usually require manual creation in the Dashboard too.
-- This SQL attempts to create policies for buckets.

-- hero-images bucket policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public Read Hero" ON storage.objects FOR SELECT USING (bucket_id = 'hero-images');
CREATE POLICY "Admin All Hero" ON storage.objects FOR ALL USING (bucket_id = 'hero-images' AND public.is_admin());

-- post-images bucket policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public Read Posts" ON storage.objects FOR SELECT USING (bucket_id = 'post-images');
CREATE POLICY "Admin All Posts" ON storage.objects FOR ALL USING (bucket_id = 'post-images' AND public.is_admin());

-- 3. Fix Posts Table Schema for Persistence
-- Ensure both 'content' and 'image_url' columns exist
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 4. Refresh Policies
-- Ensure the is_admin() function is up-to-date and handles role correctly
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT (role = 'admin')
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-enable RLS on affected tables
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Allow public read
DROP POLICY IF EXISTS "Public Read Slides" ON public.hero_slides;
CREATE POLICY "Public Read Slides" ON public.hero_slides FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public Read Posts" ON public.posts;
CREATE POLICY "Public Read Posts" ON public.posts FOR SELECT USING (true); -- Usually posts are public

-- Allow admin full access
DROP POLICY IF EXISTS "Admin All Slides" ON public.hero_slides;
CREATE POLICY "Admin All Slides" ON public.hero_slides FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin All Posts" ON public.posts;
CREATE POLICY "Admin All Posts" ON public.posts FOR ALL USING (public.is_admin());
