import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hsadukhmcclwixuntqwu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA4MzM2OCwiZXhwIjoyMDg4NjU5MzY4fQ.2YpuPKrlv4jQNG-5dDlnzWzFqjqRbO_bxXksWh4PRZY';

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Split SQL into individual statements
const sqlStatements = [
  `CREATE OR REPLACE FUNCTION public.handle_new_user()
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
$$ LANGUAGE plpgsql SECURITY DEFINER;`,
  
  `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`,
  
  `CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();`,
  
  `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;`,
  
  `DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;`,
  `CREATE POLICY "Users can read their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);`,
  
  `DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;`,
  `CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);`,
  
  `DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;`,
  `CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);`
];

async function applyTrigger() {
  console.log('=== Applying Auth Trigger via Direct API Calls ===\n');

  // Use Supabase SQL endpoint
  const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
  
  for (let i = 0; i < sqlStatements.length; i++) {
    const sql = sqlStatements[i];
    console.log(`Executing statement ${i + 1}/${sqlStatements.length}...`);
    
    try {
      // Try using the Supabase SQL execution endpoint
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          query: sql
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.log(`  ❌ Failed: ${text}`);
      } else {
        console.log(`  ✓ Success`);
      }
    } catch (e) {
      console.log(`  ❌ Exception: ${e.message}`);
    }
  }

  console.log('\n=== Verification ===');
  await verifyTrigger();
}

async function verifyTrigger() {
  const testEmail = `trigger_test_${Date.now()}@gmail.com`;
  console.log('\nCreating test user to verify trigger...');
  
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: 'Test123456!',
    email_confirm: true,
  });

  if (authError) {
    console.log('❌ Cannot create test user:', authError.message);
    return;
  }

  console.log('✓ Test user created:', authData.user.id);
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (profileError) {
    console.log('❌ Profile check failed:', profileError.message);
  } else if (profile) {
    console.log('✓ Profile auto-created by trigger!');
    console.log('  - profile role:', profile.role);
  } else {
    console.log('❌ Profile NOT auto-created');
  }

  await supabase.auth.admin.deleteUser(authData.user.id);
  await supabase.from('profiles').delete().eq('id', authData.user.id);
  console.log('✓ Test user cleaned up');
}

applyTrigger().catch(console.error);
