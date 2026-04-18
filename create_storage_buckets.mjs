import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hsadukhmcclwixuntqwu.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA4MzM2OCwiZXhwIjoyMDg4NjU5MzY4fQ.2YpuPKrlv4jQNG-5dDlnzWzFqjqRbO_bxXksWh4PRZY';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createStorageBuckets() {
  console.log('=== Creating Storage Buckets ===\n');

  const buckets = [
    { id: 'hero-images', name: 'hero-images', public: true },
    { id: 'feed-images', name: 'feed-images', public: true },
  ];

  for (const bucket of buckets) {
    try {
      console.log(`Creating bucket: ${bucket.name}...`);
      const { data, error } = await supabase.storage.createBucket(bucket.id, {
        name: bucket.name,
        public: bucket.public,
      });

      if (error) {
        if (error.message.includes('already exists')) {
          console.log(`  ✓ Bucket ${bucket.name} already exists`);
        } else {
          console.log(`  ❌ Error creating ${bucket.name}:`, error.message);
        }
      } else {
        console.log(`  ✓ Bucket ${bucket.name} created`);
      }
    } catch (e) {
      console.log(`  ❌ Exception creating ${bucket.name}:`, e.message);
    }
  }

  console.log('\n=== Verifying Buckets ===');
  const { data: bucketsList, error } = await supabase.storage.listBuckets();
  if (error) {
    console.log('❌ Error listing buckets:', error.message);
  } else {
    console.log('Current buckets:', bucketsList.map(b => b.name).join(', '));
  }
}

createStorageBuckets().catch(console.error);
