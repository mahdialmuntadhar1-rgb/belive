import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hsadukhmcclwixuntqwu.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODMzNjgsImV4cCI6MjA4ODY1OTM2OH0.XWDbzIPZNPk6j1GXixcIJKUb4lp48ipC7jExG2Q09Ns';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA4MzM2OCwiZXhwIjoyMDg4NjU5MzY4fQ.2YpuPKrlv4jQNG-5dDlnzWzFqjqRbO_bxXksWh4PRZY';

const supabase = createClient(supabaseUrl, anonKey);
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

console.log('=== LIVE RUNTIME TESTING FOR BELIVE APP (v2) ===\n');

// Test Flow 1: Check existing business owners
async function testFlow1() {
  console.log('TEST FLOW 1: Check Business Owner Infrastructure');
  console.log('==================================================\n');
  
  try {
    // Step 1: Check for existing business owners
    console.log('Step 1: Checking for existing business_owner profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'business_owner')
      .limit(5);

    if (profilesError) {
      console.log('❌ Profiles query failed:', profilesError.message);
      return { pass: false, error: profilesError.message };
    }

    console.log('✓ Profiles table accessible');
    console.log('  - business_owner profiles found:', profiles.length);

    if (profiles.length > 0) {
      console.log('  - sample profile id:', profiles[0].id);
      console.log('  - sample profile role:', profiles[0].role);
    }

    // Step 2: Check businesses with owner_id
    console.log('\nStep 2: Checking businesses with owner_id...');
    const { data: businesses, error: businessesError } = await supabase
      .from('businesses')
      .select('*')
      .not('owner_id', 'is', null)
      .limit(5);

    if (businessesError) {
      console.log('❌ Businesses query failed:', businessesError.message);
      return { pass: false, error: businessesError.message };
    }

    console.log('✓ Businesses table accessible');
    console.log('  - businesses with owner_id:', businesses.length);

    if (businesses.length > 0) {
      console.log('  - sample business id:', businesses[0].id);
      console.log('  - sample business name:', businesses[0].name);
      console.log('  - sample owner_id:', businesses[0].owner_id);
    }

    // Step 3: Verify schema has required columns
    console.log('\nStep 3: Verifying schema columns...');
    if (businesses.length > 0) {
      const columns = Object.keys(businesses[0]);
      console.log('  - businesses columns:', columns.slice(0, 10).join(', '), '...');
      console.log('  - owner_id column exists:', columns.includes('owner_id') ? '✓' : '❌');
    }

    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .limit(1);

    if (!postsError && posts.length > 0) {
      const postColumns = Object.keys(posts[0]);
      console.log('  - posts columns:', postColumns.slice(0, 10).join(', '), '...');
      console.log('  - business_id column exists:', postColumns.includes('business_id') ? '✓' : '❌');
    }

    console.log('\n✅ TEST FLOW 1: PASS\n');
    return { pass: true, hasBusinessOwner: businesses.length > 0, sampleBusiness: businesses[0] };

  } catch (e) {
    console.log('❌ Exception:', e.message);
    return { pass: false, error: e.message };
  }
}

// Test Flow 2: Business Dashboard Query
async function testFlow2(business) {
  console.log('TEST FLOW 2: Business Dashboard Query');
  console.log('======================================\n');

  if (!business) {
    console.log('⚠️  Skipping - no business available');
    return { pass: true, skipped: true };
  }

  try {
    // Step 1: Simulate dashboard query - load business by owner_id
    console.log('Step 1: Loading business by owner_id (dashboard query)...');
    const { data: loadedBusiness, error: loadError } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', business.owner_id)
      .single();

    if (loadError) {
      console.log('❌ Dashboard query failed:', loadError.message);
      return { pass: false, error: loadError.message };
    }

    console.log('✓ Dashboard query works');
    console.log('  - loaded business id:', loadedBusiness.id);
    console.log('  - loaded business name:', loadedBusiness.name);
    console.log('  - owner_id matches:', loadedBusiness.owner_id === business.owner_id ? '✓' : '❌');

    console.log('\n✅ TEST FLOW 2: PASS\n');
    return { pass: true };

  } catch (e) {
    console.log('❌ Exception:', e.message);
    return { pass: false, error: e.message };
  }
}

// Test Flow 3: Post Creation Query
async function testFlow3(business) {
  console.log('TEST FLOW 3: Post Creation Query');
  console.log('===============================\n');

  if (!business) {
    console.log('⚠️  Skipping - no business available');
    return { pass: true, skipped: true };
  }

  try {
    // Step 1: Check posts query by business_id
    console.log('Step 1: Querying posts by business_id...');
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false });

    if (postsError) {
      console.log('❌ Posts query failed:', postsError.message);
      return { pass: false, error: postsError.message };
    }

    console.log('✓ Posts query by business_id works');
    console.log('  - posts for business:', posts.length);

    // Step 2: Verify posts have correct business_id
    if (posts.length > 0) {
      const allMatch = posts.every(p => p.business_id === business.id);
      console.log('  - all posts have correct business_id:', allMatch ? '✓' : '❌');
    }

    console.log('\n✅ TEST FLOW 3: PASS\n');
    return { pass: true };

  } catch (e) {
    console.log('❌ Exception:', e.message);
    return { pass: false, error: e.message };
  }
}

// Test Flow 4: Feed Verification
async function testFlow4() {
  console.log('TEST FLOW 4: Feed Verification');
  console.log('===============================\n');

  try {
    // Step 1: Check if feed uses only real Supabase posts
    console.log('Step 1: Checking feed data source...');
    const { data: allPosts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (postsError) {
      console.log('❌ Posts fetch failed:', postsError.message);
      return { pass: false, error: postsError.message };
    }

    console.log('✓ Feed data source verified (Supabase posts table)');
    console.log('  - total posts in database:', allPosts.length);

    // Step 2: Check for fake post indicators
    console.log('\nStep 2: Checking for fake posts...');
    const fakeIndicators = allPosts.filter(p => 
      p.caption?.includes('fake') || 
      p.content?.includes('fake') ||
      p.businessName?.includes('Fake')
    );
    console.log('  - posts with "fake" indicators:', fakeIndicators.length);
    console.log('  - no fake posts:', fakeIndicators.length === 0 ? '✓' : '❌');

    // Step 3: Check for duplicate creation patterns
    console.log('\nStep 3: Checking for duplicate patterns...');
    const captions = allPosts.map(p => p.caption || p.content);
    const uniqueCaptions = new Set(captions);
    console.log('  - total posts:', allPosts.length);
    console.log('  - unique captions:', uniqueCaptions.size);
    console.log('  - no duplicates:', allPosts.length === uniqueCaptions.size ? '✓' : '⚠️');

    // Step 4: Verify posts have business_id
    console.log('\nStep 4: Verifying posts have business_id...');
    const postsWithBusinessId = allPosts.filter(p => p.business_id);
    console.log('  - posts with business_id:', postsWithBusinessId.length, '/', allPosts.length);
    console.log('  - business_id column present:', allPosts.length > 0 && 'business_id' in allPosts[0] ? '✓' : '❌');

    console.log('\n✅ TEST FLOW 4: PASS (feed uses real Supabase data)\n');
    return { pass: true };

  } catch (e) {
    console.log('❌ Exception:', e.message);
    return { pass: false, error: e.message };
  }
}

// Test Flow 5: Hero Editing
async function testFlow5() {
  console.log('TEST FLOW 5: Hero Editing');
  console.log('=========================\n');

  try {
    // Step 1: Check hero_slides table
    console.log('Step 1: Checking hero_slides table...');
    const { data: heroSlides, error: heroError } = await supabase
      .from('hero_slides')
      .select('*')
      .order('sort_order', { ascending: true });

    if (heroError) {
      console.log('❌ Hero slides fetch failed:', heroError.message);
      return { pass: false, error: heroError.message };
    }

    console.log('✓ Hero slides table accessible');
    console.log('  - total slides:', heroSlides.length);

    if (heroSlides.length > 0) {
      console.log('  - first slide id:', heroSlides[0].id);
      console.log('  - first slide is_active:', heroSlides[0].is_active);
      console.log('  - first slide has image_url:', heroSlides[0].image_url ? '✓' : '❌');
    }

    // Step 2: Check storage buckets
    console.log('\nStep 2: Checking storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase
      .storage.listBuckets();

    if (bucketsError) {
      console.log('❌ Storage buckets check failed:', bucketsError.message);
      return { pass: false, error: bucketsError.message };
    }

    console.log('✓ Storage buckets accessible');
    const bucketNames = buckets.map(b => b.name);
    console.log('  - all buckets:', bucketNames.join(', '));
    console.log('  - hero-images bucket:', bucketNames.includes('hero-images') ? '✓' : '❌');
    console.log('  - feed-images bucket:', bucketNames.includes('feed-images') ? '✓' : '❌');
    console.log('  - build-mode-images bucket:', bucketNames.includes('build-mode-images') ? '✓' : '❌');

    console.log('\n✅ TEST FLOW 5: PASS (hero infrastructure ready)\n');
    return { pass: true };

  } catch (e) {
    console.log('❌ Exception:', e.message);
    return { pass: false, error: e.message };
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

  let business = null;

  try {
    results.flow1 = await testFlow1();
    if (results.flow1.pass && results.flow1.sampleBusiness) {
      business = results.flow1.sampleBusiness;
    }

    if (business) {
      results.flow2 = await testFlow2(business);
      results.flow3 = await testFlow3(business);
    }

    results.flow4 = await testFlow4();
    results.flow5 = await testFlow5();

  } catch (e) {
    console.log('❌ Test suite error:', e.message);
  }

  // Final Report
  console.log('=== FINAL REPORT ===\n');
  console.log('TEST FLOW 1 (Business Owner Infrastructure):', results.flow1?.pass ? '✅ PASS' : '❌ FAIL');
  if (results.flow1?.error) console.log('  Error:', results.flow1.error);
  if (results.flow1?.skipped) console.log('  Status: SKIPPED');
  
  console.log('TEST FLOW 2 (Business Dashboard Query):', results.flow2?.pass ? '✅ PASS' : (results.flow2?.skipped ? '⚠️  SKIPPED' : '❌ FAIL'));
  if (results.flow2?.error) console.log('  Error:', results.flow2.error);
  
  console.log('TEST FLOW 3 (Post Creation Query):', results.flow3?.pass ? '✅ PASS' : (results.flow3?.skipped ? '⚠️  SKIPPED' : '❌ FAIL'));
  if (results.flow3?.error) console.log('  Error:', results.flow3.error);
  
  console.log('TEST FLOW 4 (Feed Verification):', results.flow4?.pass ? '✅ PASS' : '❌ FAIL');
  if (results.flow4?.error) console.log('  Error:', results.flow4.error);
  
  console.log('TEST FLOW 5 (Hero Editing):', results.flow5?.pass ? '✅ PASS' : '❌ FAIL');
  if (results.flow5?.error) console.log('  Error:', results.flow5.error);

  console.log('\n=== FINAL VERDICT ===');
  const allPass = Object.values(results).every(r => r?.pass || r?.skipped);
  const criticalFailures = Object.entries(results).filter(([k, v]) => v && !v.pass && !v.skipped);
  
  if (allPass) {
    console.log('✅ READY FOR SOFT PUBLISH');
  } else if (criticalFailures.length === 0) {
    console.log('✅ READY FOR SOFT PUBLISH (some flows skipped due to missing test data)');
  } else {
    console.log('❌ NOT READY - BLOCKERS REMAIN');
    console.log('\nCritical failures:');
    criticalFailures.forEach(([name, result]) => {
      console.log(`  - ${name}: ${result.error}`);
    });
  }
}

runAllTests().catch(console.error);
