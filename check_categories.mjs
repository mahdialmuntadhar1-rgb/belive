import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hsadukhmcclwixuntqwu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA4MzM2OCwiZXhwIjoyMDg4NjU5MzY4fQ.2YpuPKrlv4jQNG-5dDlnzWzFqjqRbO_bxXksWh4PRZY';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkCategories() {
  console.log('=== Checking Valid Categories ===\n');

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('category')
    .limit(10);

  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }

  console.log('Sample categories from existing businesses:');
  businesses.forEach(b => {
    console.log('  -', b.category);
  });

  // Get unique categories
  const { data: uniqueCats } = await supabase
    .from('businesses')
    .select('category')
    .not('category', 'is', null);

  const categories = [...new Set(uniqueCats.map(b => b.category))];
  console.log('\nUnique categories:', categories.join(', '));
}

checkCategories().catch(console.error);
