import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hsadukhmcclwixuntqwu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA4MzM2OCwiZXhwIjoyMDg4NjU5MzY4fQ.2YpuPKrlv4jQNG-5dDlnzWzFqjqRbO_bxXksWh4PRZY';

const supabase = createClient(supabaseUrl, serviceRoleKey);

const sql = `
-- Create auth trigger to auto-create profiles row when new user signs up
-- This ensures profiles table stays in sync with auth.users

-- 1. Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role, created_at, updated_at)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role = COALESCE(EXCLUDED.role, profiles.role),
    updated_at = NOW();

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop existing trigger if it exists (to avoid conflicts)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Create trigger that fires when new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Enable RLS on profiles (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create basic RLS policy allowing users to read their own profile
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
CREATE POLICY "Users can read their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- 6. Create policy allowing users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 7. Create policy allowing authenticated users to insert their own profile (for direct inserts)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
`;

async function applyTrigger() {
  console.log('=== Applying Auth Trigger ===\n');

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.log('❌ RPC exec_sql failed:', error.message);
      console.log('Trying direct SQL execution via REST API...');
      
      // Fallback: Use REST API to execute SQL
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ sql }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.log('❌ REST API execution failed:', text);
        return { success: false, error: text };
      }

      console.log('✓ SQL executed via REST API');
      return { success: true };
    }

    console.log('✓ SQL executed successfully');
    return { success: true };

  } catch (e) {
    console.log('❌ Exception:', e.message);
    return { success: false, error: e.message };
  }
}

async function verifyTrigger() {
  console.log('\n=== Verifying Trigger ===\n');

  try {
    // Check if function exists
    const { data: functions, error: funcError } = await supabase
      .rpc('get_function_info', { function_name: 'public.handle_new_user' });

    if (funcError) {
      console.log('⚠️  Cannot verify function via RPC (may not exist)');
    } else {
      console.log('✓ Function handle_new_user exists');
    }

    // Alternative: Try to query information_schema
    const { data, error } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_schema', 'public')
      .eq('routine_name', 'handle_new_user');

    if (error) {
      console.log('⚠️  Cannot query information_schema:', error.message);
    } else if (data && data.length > 0) {
      console.log('✓ Function found in information_schema');
    } else {
      console.log('❌ Function not found in information_schema');
    }

  } catch (e) {
    console.log('⚠️  Verification error:', e.message);
  }
}

applyTrigger().then(async (result) => {
  if (result.success) {
    await verifyTrigger();
  }
  console.log('\n=== Done ===');
}).catch(console.error);
