import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hsadukhmcclwixuntqwu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA4MzM2OCwiZXhwIjoyMDg4NjU5MzY4fQ.2YpuPKrlv4jQNG-5dDlnzWzFqjqRbO_bxXksWh4PRZY';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkPostsColumns() {
  console.log('=== Checking posts table columns ===\n');

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .limit(1);

  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }

  if (posts && posts.length > 0) {
    console.log('Columns in posts table:');
    Object.keys(posts[0]).forEach(col => {
      console.log('  -', col);
    });
  } else {
    console.log('No posts found, cannot check columns');
  }
}

checkPostsColumns().catch(console.error);
