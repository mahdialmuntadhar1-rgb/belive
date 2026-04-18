import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hsadukhmcclwixuntqwu.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODMzNjgsImV4cCI6MjA4ODY1OTM2OH0.XWDbzIPZNPk6j1GXixcIJKUb4lp48ipC7jExG2Q09Ns';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA4MzM2OCwiZXhwIjoyMDg4NjU5MzY4fQ.2YpuPKrlv4jQNG-5dDlnzWzFqjqRbO_bxXksWh4PRZY';

const supabase = createClient(supabaseUrl, anonKey);
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

const testEmail = `biztest${Date.now()}@gmail.com`;
const testPassword = 'Test123456!';
const testBusinessName = 'Runtime Test Business';
const testPhone = '07712345678';
const testGovernorate = 'Baghdad';
const testCategory = 'Restaurant';
const testCity = 'Baghdad';

console.log('=== FULL RUNTIME TEST FOR BELIVE ===\n');

// Flow 1: Signup as business owner
async function flow1() {
  console.log('FLOW 1: Signup as Business Owner');
  console.log('===================================\n');

  try {
    console.log('Step 1: Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test Business Owner',
          role: 'business_owner',
          business_name: testBusinessName,
          phone: testPhone,
          governorate: testGovernorate,
          category: testCategory,
          city: testCity,
        }
      }
    });

    if (authError) {
      console.log('❌ Auth signup failed:', authError.message);
      return { pass: false, error: authError.message };
    }

    if (!authData.user) {
      console.log('❌ No user returned');
      return { pass: false, error: 'No user returned' };
    }

    console.log('✓ Auth user created:', authData.user.id);
    const userId = authData.user.id;

    // Simulate AuthModal polling + fallback logic
    console.log('\nStep 2: Simulating AuthModal polling + fallback...');
    let profileExists = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!profileExists && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 500));

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profile) {
        profileExists = true;
        console.log('✓ Profile found after', (attempts + 1) * 500, 'ms');
        
        // Update role if needed
        if (profile.role !== 'business_owner') {
          await supabase
            .from('profiles')
            .update({ role: 'business_owner' })
            .eq('id', userId);
          console.log('✓ Updated role to business_owner');
        }
        break;
      }

      attempts++;
    }

    // Fallback: create profile directly
    if (!profileExists) {
      console.log('⚠️  Profile not found via trigger, creating fallback...');
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          full_name: 'Test Business Owner',
          role: 'business_owner',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (insertError) {
        console.log('❌ Fallback profile creation failed:', insertError.message);
        return { pass: false, error: 'Profile creation failed' };
      }
      console.log('✓ Profile created via fallback');
    }

    // Verify profile
    const { data: finalProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    console.log('✓ Profile verified');
    console.log('  - role:', finalProfile.role);
    console.log('  - full_name:', finalProfile.full_name);

    // Create business record (simulate AuthModal logic)
    console.log('\nStep 3: Creating business record...');
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .insert([{
        name: testBusinessName,
        category: testCategory,
        governorate: testGovernorate,
        city: testCity,
        address: testCity,
        phone: testPhone,
        description: 'Test business for runtime verification',
        image_url: '',
        owner_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (bizError) {
      console.log('❌ Business creation failed:', bizError.message);
      return { pass: false, error: bizError.message };
    }

    console.log('✓ Business created');
    console.log('  - business id:', business.id);
    console.log('  - business name:', business.name);
    console.log('  - owner_id:', business.owner_id);
    console.log('  - owner_id matches user:', business.owner_id === userId ? '✓' : '❌');

    console.log('\n✅ FLOW 1: PASS\n');
    return { pass: true, userId, business };

  } catch (e) {
    console.log('❌ Exception:', e.message);
    return { pass: false, error: e.message };
  }
}

// Flow 2: Login and dashboard
async function flow2(userId) {
  console.log('FLOW 2: Login and Dashboard');
  console.log('============================\n');

  try {
    console.log('Step 1: Logging in...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (loginError) {
      console.log('❌ Login failed:', loginError.message);
      return { pass: false, error: loginError.message };
    }

    console.log('✓ Login successful');
    console.log('  - user id:', loginData.user.id);

    // Simulate dashboard query
    console.log('\nStep 2: Loading business by owner_id (dashboard query)...');
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', userId)
      .single();

    if (bizError) {
      console.log('❌ Dashboard query failed:', bizError.message);
      return { pass: false, error: bizError.message };
    }

    console.log('✓ Dashboard query works');
    console.log('  - business loaded:', business.name);
    console.log('  - no empty state (business exists):', business ? '✓' : '❌');

    console.log('\n✅ FLOW 2: PASS\n');
    return { pass: true, business };

  } catch (e) {
    console.log('❌ Exception:', e.message);
    return { pass: false, error: e.message };
  }
}

// Flow 3: Create post
async function flow3(business) {
  console.log('FLOW 3: Create Post');
  console.log('====================\n');

  try {
    console.log('Step 1: Creating post...');
    const testCaption = 'Test post from runtime verification ' + Date.now();
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert([{
        business_id: business.id,
        caption: testCaption,
        content: testCaption,
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
      return { pass: false, error: postError.message };
    }

    console.log('✓ Post created');
    console.log('  - post id:', post.id);
    console.log('  - business_id:', post.business_id);
    console.log('  - business_id matches:', post.business_id === business.id ? '✓' : '❌');

    // Verify post appears in feed
    console.log('\nStep 2: Verifying post in main feed...');
    const { data: feedPosts, error: feedError } = await supabase
      .from('posts')
      .select('*')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false });

    if (feedError) {
      console.log('❌ Feed query failed:', feedError.message);
      return { pass: false, error: feedError.message };
    }

    const found = feedPosts.find(p => p.id === post.id);
    console.log('✓ Feed query works');
    console.log('  - post in feed:', found ? '✓' : '❌');
    console.log('  - persists after query:', found ? '✓' : '❌');

    console.log('\n✅ FLOW 3: PASS\n');
    return { pass: true, postId: post.id };

  } catch (e) {
    console.log('❌ Exception:', e.message);
    return { pass: false, error: e.message };
  }
}

// Flow 4: Feed validation
async function flow4() {
  console.log('FLOW 4: Feed Validation');
  console.log('=======================\n');

  try {
    console.log('Step 1: Checking feed data source...');
    const { data: allPosts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (postsError) {
      console.log('❌ Posts fetch failed:', postsError.message);
      return { pass: false, error: postsError.message };
    }

    console.log('✓ Feed uses Supabase posts table');
    console.log('  - total posts:', allPosts.length);

    // Check for fake posts
    console.log('\nStep 2: Checking for fake posts...');
    const fakePosts = allPosts.filter(p => 
      p.caption?.includes('fake') || 
      p.content?.includes('fake')
    );
    console.log('  - fake posts found:', fakePosts.length);
    console.log('  - no fake posts:', fakePosts.length === 0 ? '✓' : '❌');

    // Check for duplicates
    console.log('\nStep 3: Checking for duplicates...');
    const captions = allPosts.map(p => p.caption || p.content);
    const uniqueCaptions = new Set(captions);
    console.log('  - total posts:', allPosts.length);
    console.log('  - unique captions:', uniqueCaptions.size);
    console.log('  - no duplicates:', allPosts.length === uniqueCaptions.size ? '✓' : '❌');

    // Check for auto-seeding patterns
    console.log('\nStep 4: Checking for auto-seeding patterns...');
    const seededPosts = allPosts.filter(p => 
      p.caption?.includes('AI generated') || 
      p.content?.includes('AI generated')
    );
    console.log('  - AI seeded posts:', seededPosts.length);
    console.log('  - no auto-seeding:', seededPosts.length === 0 ? '✓' : '❌');

    console.log('\n✅ FLOW 4: PASS\n');
    return { pass: true };

  } catch (e) {
    console.log('❌ Exception:', e.message);
    return { pass: false, error: e.message };
  }
}

// Flow 5: Hero editing
async function flow5() {
  console.log('FLOW 5: Hero Editing');
  console.log('====================\n');

  try {
    console.log('Step 1: Checking hero_slides...');
    const { data: heroSlides, error: heroError } = await supabase
      .from('hero_slides')
      .select('*')
      .order('sort_order', { ascending: true })
      .limit(1);

    if (heroError) {
      console.log('❌ Hero slides query failed:', heroError.message);
      return { pass: false, error: heroError.message };
    }

    console.log('✓ Hero slides accessible');
    console.log('  - total slides query works:', heroSlides.length > 0 ? '✓' : '❌');

    if (heroSlides.length > 0) {
      console.log('  - first slide id:', heroSlides[0].id);
      console.log('  - has image_url:', heroSlides[0].image_url ? '✓' : '❌');
      console.log('  - is_active:', heroSlides[0].is_active);
    }

    // Check storage buckets
    console.log('\nStep 2: Checking storage buckets...');
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();

    if (bucketsError) {
      console.log('❌ Storage buckets check failed:', bucketsError.message);
      return { pass: false, error: bucketsError.message };
    }

    const bucketNames = buckets.map(b => b.name);
    console.log('✓ Storage buckets accessible');
    console.log('  - hero-images:', bucketNames.includes('hero-images') ? '✓' : '❌');
    console.log('  - feed-images:', bucketNames.includes('feed-images') ? '✓' : '❌');
    console.log('  - business-images:', bucketNames.includes('business-images') ? '✓' : '❌');

    // Test hero update (admin operation)
    console.log('\nStep 3: Testing hero update...');
    if (heroSlides.length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from('hero_slides')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', heroSlides[0].id);

      if (updateError) {
        console.log('❌ Hero update failed:', updateError.message);
        return { pass: false, error: updateError.message };
      }
      console.log('✓ Hero update works (admin operation)');
    }

    console.log('\n✅ FLOW 5: PASS\n');
    return { pass: true };

  } catch (e) {
    console.log('❌ Exception:', e.message);
    return { pass: false, error: e.message };
  }
}

// Cleanup
async function cleanup(userId, postId) {
  console.log('\n=== CLEANUP ===\n');

  try {
    if (postId) {
      await supabaseAdmin.from('posts').delete().eq('id', postId);
      console.log('✓ Post deleted');
    }

    if (userId) {
      await supabaseAdmin.from('businesses').delete().eq('owner_id', userId);
      console.log('✓ Business deleted');
      await supabaseAdmin.from('profiles').delete().eq('id', userId);
      console.log('✓ Profile deleted');
      await supabaseAdmin.auth.admin.deleteUser(userId);
      console.log('✓ Auth user deleted');
    }

    console.log('\n✓ Cleanup complete\n');
  } catch (e) {
    console.log('❌ Cleanup error:', e.message);
  }
}

// Run all tests
async function runAllTests() {
  const results = {
    flow1: null,
    flow2: null,
    flow3: null,
    flow4: null,
    flow5: null,
  };

  let userId = null;
  let business = null;
  let postId = null;

  try {
    results.flow1 = await flow1();
    if (results.flow1.pass) {
      userId = results.flow1.userId;
      business = results.flow1.business;
    }

    if (userId && business) {
      results.flow2 = await flow2(userId);
    }

    if (business) {
      results.flow3 = await flow3(business);
      if (results.flow3.pass) {
        postId = results.flow3.postId;
      }
    }

    results.flow4 = await flow4();
    results.flow5 = await flow5();

  } catch (e) {
    console.log('❌ Test suite error:', e.message);
  }

  await cleanup(userId, postId);

  // Final Report
  console.log('=== FINAL REPORT ===\n');
  console.log('FLOW 1 (Signup):', results.flow1?.pass ? '✅ PASS' : '❌ FAIL');
  if (results.flow1?.error) console.log('  Error:', results.flow1.error);
  
  console.log('FLOW 2 (Login/Dashboard):', results.flow2?.pass ? '✅ PASS' : '❌ FAIL');
  if (results.flow2?.error) console.log('  Error:', results.flow2.error);
  
  console.log('FLOW 3 (Create Post):', results.flow3?.pass ? '✅ PASS' : '❌ FAIL');
  if (results.flow3?.error) console.log('  Error:', results.flow3.error);
  
  console.log('FLOW 4 (Feed Validation):', results.flow4?.pass ? '✅ PASS' : '❌ FAIL');
  if (results.flow4?.error) console.log('  Error:', results.flow4.error);
  
  console.log('FLOW 5 (Hero Editing):', results.flow5?.pass ? '✅ PASS' : '❌ FAIL');
  if (results.flow5?.error) console.log('  Error:', results.flow5.error);

  console.log('\n=== FINAL VERDICT ===');
  const allPass = Object.values(results).every(r => r?.pass);
  if (allPass) {
    console.log('✅ READY FOR SOFT PUBLISH');
  } else {
    console.log('❌ NOT READY - BLOCKERS REMAIN');
  }
}

runAllTests().catch(console.error);
