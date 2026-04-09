-- ============================================
-- PROFILES TABLE FOR USER MANAGEMENT
-- Fixes: "Database error saving new user" 
-- ============================================

-- Drop existing table if recreating (be careful in production!)
-- DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'business_owner', 'admin')),
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Allow users to read their own profile
CREATE POLICY IF NOT EXISTS "Users can view own profile" 
    ON profiles FOR SELECT 
    USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY IF NOT EXISTS "Users can update own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Allow authenticated users to insert their own profile (for signup)
CREATE POLICY IF NOT EXISTS "Users can insert own profile" 
    ON profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Allow service role full access (for admin operations)
CREATE POLICY IF NOT EXISTS "Service role has full access" 
    ON profiles TO service_role 
    USING (true) WITH CHECK (true);

-- Allow anon to read profiles (for public profiles if needed)
CREATE POLICY IF NOT EXISTS "Profiles are publicly readable" 
    ON profiles FOR SELECT TO anon 
    USING (true);

-- ============================================
-- FUNCTION: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        role = COALESCE(EXCLUDED.role, profiles.role),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Auto-create profile after user signup
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================
-- FUNCTION: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profiles_updated_at();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE profiles IS 'User profiles linked to auth.users - auto-created on signup via trigger';
COMMENT ON COLUMN profiles.role IS 'user, business_owner, or admin';
COMMENT ON COLUMN profiles.full_name IS 'Display name from signup form';

-- ============================================
-- MIGRATION: Create profiles for existing auth users
-- Run this if you have existing users without profiles
-- ============================================
-- INSERT INTO profiles (id, email, full_name, role)
-- SELECT 
--     id,
--     email,
--     COALESCE(raw_user_meta_data->>'full_name', email),
--     COALESCE(raw_user_meta_data->>'role', 'user')
-- FROM auth.users
-- WHERE id NOT IN (SELECT id FROM profiles)
-- ON CONFLICT (id) DO NOTHING;
