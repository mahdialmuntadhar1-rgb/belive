import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hsadukhmcclwixuntqwu.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODMzNjgsImV4cCI6MjA4ODY1OTM2OH0.XWDbzIPZNPk6j1GXixcIJKUb4lp48ipC7jExG2Q09Ns';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA4MzM2OCwiZXhwIjoyMDg4NjU5MzY4fQ.2YpuPKrlv4jQNG-5dDlnzWzFqjqRbO_bxXksWh4PRZY';

const supabase = createClient(supabaseUrl, anonKey);
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function testSignup() {
  console.log('=== Detailed Signup Test ===\n');

  const testEmail = `detailtest${Date.now()}@gmail.com`;
  const testPassword = 'Test123456!';

  try {
    console.log('Step 1: Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
          role: 'business_owner',
        }
      }
    });

    if (authError) {
      console.log('❌ Auth signup failed:', authError.message);
      console.log('  Error details:', JSON.stringify(authError, null, 2));
      return;
    }

    console.log('✓ Auth user created:', authData.user.id);
    const userId = authData.user.id;

    // Wait for trigger
    console.log('\nStep 2: Waiting 2 seconds for trigger...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check profile
    console.log('\nStep 3: Checking profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.log('❌ Profile fetch failed:', profileError.message);
      console.log('  Error details:', JSON.stringify(profileError, null, 2));
    } else if (profile) {
      console.log('✓ Profile created by trigger');
      console.log('  - role:', profile.role);
      console.log('  - full_name:', profile.full_name);
    } else {
      console.log('⚠️  Profile not created by trigger - will use fallback');
    }

    // Cleanup
    await supabaseAdmin.auth.admin.deleteUser(userId);
    await supabaseAdmin.from('profiles').delete().eq('id', userId);
    console.log('\n✓ Cleanup complete');

  } catch (e) {
    console.log('❌ Exception:', e.message);
  }
}

testSignup().catch(console.error);
