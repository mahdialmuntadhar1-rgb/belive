import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hsadukhmcclwixuntqwu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODMzNjgsImV4cCI6MjA4ODY1OTM2OH0.XWDbzIPZNPk6j1GXixcIJKUb4lp48ipC7jExG2Q09Ns';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('🔍 Testing Supabase connection...\n');

  try {
    const { data: posts, error: postsErr } = await supabase.from('posts').select('id').limit(1);
    if (posts !== undefined && !postsErr) console.log('✅ posts table exists');
    else console.log('❌ posts error: ' + (postsErr?.message || 'unknown'));

    const { data: biz, error: bizErr } = await supabase.from('businesses').select('id').limit(1);
    if (biz !== undefined && !bizErr) console.log('✅ businesses table exists');
    else console.log('❌ businesses error: ' + (bizErr?.message || 'unknown'));

    const { data: prof, error: profErr } = await supabase.from('profiles').select('id').limit(1);
    if (prof !== undefined && !profErr) console.log('✅ profiles table exists');
    else console.log('❌ profiles error: ' + (profErr?.message || 'unknown'));

    const { data: bizWithOwner, error: ownerErr } = await supabase.from('businesses').select('owner_id').limit(1);
    if (!ownerErr) console.log('✅ businesses.owner_id column exists');
    else console.log('❌ owner_id check failed: ' + ownerErr.message);

    const { data: postWithBiz, error: bizIdErr } = await supabase.from('posts').select('business_id').limit(1);
    if (!bizIdErr) console.log('✅ posts.business_id column exists');
    else console.log('❌ business_id check failed: ' + bizIdErr.message);

    const { count: postCount } = await supabase.from('posts').select('*', { count: 'exact', head: true });
    console.log('\n📊 Data state:');
    console.log('Posts in DB: ' + postCount);

    const { count: bizCount } = await supabase.from('businesses').select('*', { count: 'exact', head: true });
    console.log('Businesses in DB: ' + bizCount);

    const { count: profCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    console.log('Profiles in DB: ' + profCount);

    const { data: sample } = await supabase.from('posts').select('id, caption, business_id, created_at').limit(1);
    if (sample && sample.length > 0) {
      console.log('\n✅ Sample real post found:');
      console.log('   Business ID: ' + sample[0].busi