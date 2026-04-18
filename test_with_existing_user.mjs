import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hsadukhmcclwixuntqwu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA4MzM2OCwiZXhwIjoyMDg4NjU5MzY4fQ.2YpuPKrlv4jQNG-5dDlnzWzFqjqRbO_bxXksWh4PRZY';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testWithExistingUser() {
  console.log('=== Testing with Existing Business Owner ===\n');

  // Find existing business with owner_id
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('*')
    .not('owner_id', 'is', null)
    .limit(1);

  if (error) {
    console.log('❌ Query failed:', error.message);
    return;
  }

  if (!businesses || businesses.length === 0) {
    console.log('⚠️  No businesses with owner_id found');
    console.log('Creating a test business owner manually...');

    // Create test user manually
    const testEmail = `manualtest${Date.now()}@gmail.com`;
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'Test123456!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Manual Test Owner',
        role: 'business_owner',
      }
    });

    if (authError) {
      console.log('❌ Cannot create test user:', authError.message);
      return;
    }

    console.log('✓ Test user created:', authData.user.id);

    // Create profile manually
    await supabase.from('profiles').insert([{
      id: authData.user.id,
      full_name: 'Manual Test Owner',
      role: 'business_owner',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }]);
    console.log('✓ Profile created');

    // Create business
    const businessId = crypto.randomUUID();
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .insert([{
        id: businessId,
        name: 'Manual Test Business',
        category: 'banks',
        governorate: 'Baghdad',
        city: 'Baghdad',
        address: 'Baghdad',
        phone: '07799999999',
        description: 'Test business',
        image_url: '',
        owner_id: authData.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (bizError) {
      console.log('❌ Business creation failed:', bizError.message);
      return;
    }

    console.log('✓ Business created:', business.id);
    console.log('✓ owner_id set:', business.owner_id);

    // Test post creation
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert([{
        business_id: business.id,
        businessId: business.id,
        caption: 'Test post from manual user',
        content: 'Test post from manual user',
        image_url: null,
        likes: 0,
        views: 0,
        status: 'visible',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (postError) {
      console.log('❌ Post creation failed:', postError.message);
    } else {
      console.log('✓ Post created:', post.id);
      console.log('✓ business_id correct:', post.business_id === business.id);
    }

    // Cleanup
    await supabase.from('posts').delete().eq('id', post.id);
    await supabase.from('businesses').delete().eq('id', business.id);
    await supabase.from('profiles').delete().eq('id', authData.user.id);
    await supabase.auth.admin.deleteUser(authData.user.id);
    console.log('\n✓ Cleanup complete');

  } else {
    console.log('✓ Found existing business with owner_id');
    const business = businesses[0];
    console.log('  - business id:', business.id);
    console.log('  - owner_id:', business.owner_id);

    // Test post creation with existing business
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert([{
        business_id: business.id,
        businessId: business.id,
        caption: 'Test post with existing business',
        content: 'Test post with existing business',
        image_url: null,
        likes: 0,
        views: 0,
        status: 'visible',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (postError) {
      console.log('❌ Post creation failed:', postError.message);
    } else {
      console.log('✓ Post created:', post.id);
      console.log('✓ business_id correct:', post.business_id === business.id);
      
      // Verify in feed
      const { data: feedPosts } = await supabase
        .from('posts')
        .select('*')
        .eq('business_id', business.id);
      
      const found = feedPosts.find(p => p.id === post.id);
      console.log('✓ Post appears in feed:', found ? 'YES' : 'NO');

      // Cleanup
      await supabase.from('posts').delete().eq('id', post.id);
      console.log('✓ Test post cleaned up');
    }
  }

  console.log('\n✅ Manual test complete');
}

testWithExistingUser().catch(console.error);
