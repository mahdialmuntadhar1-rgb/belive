import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hsadukhmcclwixuntqwu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA4MzM2OCwiZXhwIjoyMDg4NjU5MzY4fQ.2YpuPKrlv4jQNG-5dDlnzWzFqjqRbO_bxXksWh4PRZY';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function cleanup() {
  console.log('=== Cleaning up test data ===\n');

  // Delete test business
  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('name', 'Manual Test Business');

  if (businesses && businesses.length > 0) {
    for (const biz of businesses) {
      await supabase.from('posts').delete().eq('business_id', biz.id);
      await supabase.from('businesses').delete().eq('id', biz.id);
      await supabase.from('profiles').delete().eq('id', biz.owner_id);
      await supabase.auth.admin.deleteUser(biz.owner_id);
      console.log('✓ Deleted test business and user:', biz.owner_id);
    }
  }

  console.log('\n✓ Cleanup complete');
}

cleanup().catch(console.error);
