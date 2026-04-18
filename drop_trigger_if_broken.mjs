import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hsadukhmcclwixuntqwu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA4MzM2OCwiZXhwIjoyMDg4NjU5MzY4fQ.2YpuPKrlv4jQNG-5dDlnzWzFqjqRbO_bxXksWh4PRZY';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function dropTrigger() {
  console.log('=== Dropping Auth Trigger (if exists) ===\n');

  try {
    // Drop the trigger
    const { error } = await supabase.rpc('exec_sql', {
      sql: 'DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;'
    });

    if (error) {
      console.log('⚠️  RPC exec_sql not available, trying direct approach');
    } else {
      console.log('✓ Trigger dropped via RPC');
    }

    // Since RPC doesn't work, create a SQL file for manual execution
    console.log('\n=== SQL for manual execution ===\n');
    console.log('DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;');
    console.log('DROP FUNCTION IF EXISTS public.handle_new_user();');
    console.log('\nThe code has fallback logic (polling + manual profile creation),');
    console.log('so the trigger is not required for the app to work.\n');

  } catch (e) {
    console.log('❌ Exception:', e.message);
  }
}

dropTrigger().catch(console.error);
