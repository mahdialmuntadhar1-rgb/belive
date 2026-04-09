import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hsadukhmcclwixuntqwu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODMzNjgsImV4cCI6MjA4ODY1OTM2OH0.XWDbzIPZNPk6j1GXixcIJKUb4lp48ipC7jExG2Q09Ns';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkBusinesses() {
  console.log('Checking businesses table...');
  
  const { count, error: countError } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true });
    
  if (countError) {
    console.error('Error getting count:', countError);
  } else {
    console.log('Total businesses count:', count);
  }

  const { data: businesses, error: bizError } = await supabase
    .from('businesses')
    .select('*')
    .limit(5);
    
  if (bizError) {
    console.error('Error fetching businesses:', bizError);
  } else {
    console.log('Sample businesses:', JSON.stringify(businesses, null, 2));
  }
}

checkBusinesses();
