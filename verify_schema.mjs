import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hsadukhmcclwixuntqwu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA4MzM2OCwiZXhwIjoyMDg4NjU5MzY4fQ.2YpuPKrlv4jQNG-5dDlnzWzFqjqRbO_bxXksWh4PRZY';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkSchema() {
  console.log('=== SUPABASE SCHEMA VERIFICATION ===\n');

  // Check profiles table
  console.log('1. Checking profiles table...');
  try {
    const { data: profilesColumns, error: profilesError } = await supabase
      .rpc('get_table_columns', { table_name: 'profiles' });
    
    if (profilesError) {
      console.log('   Error getting profiles columns:', profilesError.message);
      // Try direct query instead
      const { data: profilesData, error: directError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (directError) {
        console.log('   ❌ profiles table query failed:', directError.message);
      } else {
        console.log('   ✓ profiles table exists');
        console.log('   Columns:', Object.keys(profilesData[0] || {}).join(', '));
      }
    } else {
      console.log('   ✓ profiles table columns:', profilesColumns);
    }
  } catch (e) {
    console.log('   ❌ Exception checking profiles:', e.message);
  }

  // Check businesses table
  console.log('\n2. Checking businesses table...');
  try {
    const { data: businessesData, error: businessesError } = await supabase
      .from('businesses')
      .select('*')
      .limit(1);
    
    if (businessesError) {
      console.log('   ❌ businesses table query failed:', businessesError.message);
    } else {
      console.log('   ✓ businesses table exists');
      const columns = Object.keys(businessesData[0] || {});
      console.log('   Columns:', columns.join(', '));
      console.log('   owner_id exists:', columns.includes('owner_id') ? '✓' : '❌');
    }
  } catch (e) {
    console.log('   ❌ Exception checking businesses:', e.message);
  }

  // Check posts table
  console.log('\n3. Checking posts table...');
  try {
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .limit(1);
    
    if (postsError) {
      console.log('   ❌ posts table query failed:', postsError.message);
    } else {
      console.log('   ✓ posts table exists');
      const columns = Object.keys(postsData[0] || {});
      console.log('   Columns:', columns.join(', '));
      console.log('   business_id exists:', columns.includes('business_id') ? '✓' : '❌');
    }
  } catch (e) {
    console.log('   ❌ Exception checking posts:', e.message);
  }

  // Check hero_slides table
  console.log('\n4. Checking hero_slides table...');
  try {
    const { data: heroData, error: heroError } = await supabase
      .from('hero_slides')
      .select('*')
      .limit(1);
    
    if (heroError) {
      console.log('   ❌ hero_slides table query failed:', heroError.message);
    } else {
      console.log('   ✓ hero_slides table exists');
      const columns = Object.keys(heroData[0] || {});
      console.log('   Columns:', columns.join(', '));
    }
  } catch (e) {
    console.log('   ❌ Exception checking hero_slides:', e.message);
  }

  // Check storage buckets
  console.log('\n5. Checking storage buckets...');
  try {
    const { data: buckets, error: bucketsError } = await supabase
      .storage.listBuckets();
    
    if (bucketsError) {
      console.log('   ❌ Storage buckets check failed:', bucketsError.message);
    } else {
      console.log('   ✓ Storage buckets exist');
      const bucketNames = buckets.map(b => b.name);
      console.log('   Buckets:', bucketNames.join(', '));
      console.log('   hero-images exists:', bucketNames.includes('hero-images') ? '✓' : '❌');
      console.log('   feed-images exists:', bucketNames.includes('feed-images') ? '✓' : '❌');
      console.log('   build-mode-images exists:', bucketNames.includes('build-mode-images') ? '✓' : '❌');
    }
  } catch (e) {
    console.log('   ❌ Exception checking storage:', e.message);
  }

  // Check auth.users
  console.log('\n6. Checking auth.users...');
  try {
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.log('   ❌ Auth users check failed:', usersError.message);
    } else {
      console.log('   ✓ Auth users accessible');
      console.log('   Total users:', users.length);
    }
  } catch (e) {
    console.log('   ❌ Exception checking auth.users:', e.message);
  }

  console.log('\n=== END SCHEMA VERIFICATION ===');
}

checkSchema().catch(console.error);
