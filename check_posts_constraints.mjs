import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hsadukhmcclwixuntqwu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA4MzM2OCwiZXhwIjoyMDg4NjU5MzY4fQ.2YpuPKrlv4jQNG-5dDlnzWzFqjqRbO_bxXksWh4PRZY';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkConstraints() {
  console.log('=== Checking posts table constraints ===\n');

  try {
    // Try to insert a post with only snake_case columns to see what fails
    const { error } = await supabase
      .from('posts')
      .insert([{
        business_id: crypto.randomUUID(),
        caption: 'Test',
        content: 'Test',
        likes: 0,
        views: 0,
        status: 'visible',
        created_at: new Date().toISOString(),
      }]);

    if (error) {
      console.log('❌ Insert failed:', error.message);
      console.log('  This indicates which columns have NOT NULL constraints');
    } else {
      console.log('✓ Insert succeeded - no NOT NULL constraints on required columns');
    }
  } catch (e) {
    console.log('❌ Exception:', e.message);
  }
}

checkConstraints().catch(console.error);
