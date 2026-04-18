import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hsadukhmcclwixuntqwu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA4MzM2OCwiZXhwIjoyMDg4NjU5MzY4fQ.2YpuPKrlv4jQNG-5dDlnzWzFqjqRbO_bxXksWh4PRZY';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkTrigger() {
  console.log('=== Checking if Auth Trigger Exists ===\n');

  try {
    // Check if function exists by trying to call it indirectly
    // Query pg_trigger and pg_proc tables
    const { data, error } = await supabase.rpc('exec', {
      sql: `
        SELECT 
          t.tgname as trigger_name,
          p.proname as function_name
        FROM pg_trigger t
        JOIN pg_proc p ON t.tgfoid = p.oid
        JOIN pg_class c ON t.tgrelid = c.oid
        WHERE c.relname = 'users' 
        AND c.relnamespace = 'auth'::regnamespace
        AND t.tgname = 'on_auth_user_created';
      `
    });

    if (error) {
      console.log('⚠️  Cannot query via RPC (may not exist or no permission)');
    } else {
      console.log('✓ Trigger check result:', data);
    }

    // Alternative: Create a test user and check if profile is auto-created
    console.log('\nAlternative test: Creating test user to verify trigger...');
    const testEmail = `trigger_test_${Date.now()}@gmail.com`;
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'Test123456!',
      email_confirm: true,
    });

    if (authError) {
      console.log('❌ Cannot create test user:', authError.message);
    } else {
      console.log('✓ Test user created:', authData.user.id);
      
      // Wait 2 seconds for trigger
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if profile was created
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
        console.log('❌ Profile NOT auto-created - trigger may not exist');
      }

      // Cleanup
      await supabase.auth.admin.deleteUser(authData.user.id);
      await supabase.from('profiles').delete().eq('id', authData.user.id);
      console.log('✓ Test user cleaned up');
    }

  } catch (e) {
    console.log('❌ Exception:', e.message);
  }
}

checkTrigger().catch(console.error);
