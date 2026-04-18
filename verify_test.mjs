import { createClient } from '@supabase/supabase-js';

const url = 'https://hsadukhmcclwixuntqwu.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODMzNjgsImV4cCI6MjA4ODY1OTM2OH0.XWDbzIPZNPk6j1GXixcIJKUb4lp48ipC7jExG2Q09Ns';
const sb = createClient(url, key);

try {
  console.log('🔍 SCHEMA CHECK\n');
  const { data: posts, error: e1 } = await sb.from('posts').select('id').limit(1);
  console.log(e1 ? '❌ posts: ' + e1.message : '✅ posts table exists');

  const { data: biz, error: e2 } = await sb.from('businesses').select('id').limit(1);
  console.log(e2 ? '❌ businesses: ' + e2.message : '✅ businesses table exists');

  const { data: prof, error: e3 } = await sb.from('profiles').select('id').limit(1);
  console.log(e3 ? '❌ profiles: ' + e3.message : '✅ profiles table exists');

  const { error: e4 } = await sb.from('businesses').select('owner_id').limit(1);
  console.log(e4 ? '❌ owner_id: ' + e4.message : '✅ businesses.owner_id exists');

  const { error: e5 } = await sb.from('posts').select('business_id').limit(1);
  console.log(e5 ? '❌ business_id: ' + e5.message : '✅ posts.business_id exists');

  console.log('\n📊 DATA COUNTS\n');
  const { count: pc } = await sb.from('posts').select('*', { count: 'exact', head: true });
  console.log('Posts: ' + pc);

  const { count: bc } = await sb.from('businesses').select('*', { count: 'exact', head: true });
  console.log('Businesses: ' + bc);

  const { count: prc } = await sb.from('profiles').select('*', { count: 'exact', head: true });
  console.log('Profiles: ' + prc);

  console.log('\n✅ SCHEMA VALIDATION COMPLETE');
} catch (e) {
  console.error('ERROR:', e.message);
}
