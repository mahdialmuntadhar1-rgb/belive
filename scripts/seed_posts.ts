import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedPosts() {
  console.log('Seeding posts...');

  // Get businesses to link posts to
  const { data: businesses, error: bizError } = await supabase
    .from('businesses')
    .select('id, name');

  if (bizError || !businesses) {
    console.error('Error fetching businesses for posts:', bizError);
    return;
  }

  const posts = businesses.flatMap(biz => [
    {
      businessId: biz.id,
      content: `Check out our latest offers at ${biz.name}! ✨ #Iraq #ShakuMaku`,
      image_url: `https://picsum.photos/seed/${biz.id}post1/800/600`,
      likes: Math.floor(Math.random() * 500)
    },
    {
      businessId: biz.id,
      content: `We are open today! Visit us in ${biz.name} for an unforgettable experience. 🌟`,
      image_url: `https://picsum.photos/seed/${biz.id}post2/800/600`,
      likes: Math.floor(Math.random() * 300)
    }
  ]);

  const { error } = await supabase
    .from('posts')
    .insert(posts);

  if (error) {
    console.error('Error seeding posts:', error);
  } else {
    console.log('Successfully seeded posts');
  }
}

seedPosts();
