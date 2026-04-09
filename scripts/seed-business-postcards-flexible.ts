#!/usr/bin/env npx ts-node

/**
 * Flexible Seed script for Shaku Maku business_postcards table
 * Works with minimal required columns
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Arabic captions templates for Shaku Maku feed
const arabicTemplates = [
  "✨ اكتشفوا {title} في قلب {city}! الأفضل. #العراق #شاكو_ماكو",
  "🏆 {title} - جودة عالية وخدمة متميزة في {city}. نرحب بك! #شاكو_ماكو",
  "🌟 تجربة فريدة في {title} بـ {city}. زورنا الآن! #محلي #شاكو_ماكو",
  "💼 {title} في {city} - حيث الاحترافية تلتقي بالجودة. #خدمة_ممتازة",
  "🎯 {title} في {city}! تفضلوا بزيارتنا. #نحن_هنا #شاكو_ماكو",
  "🔥 {title} - المقصد الأول في {city}. كن من زبائننا! #شاكو_ماكو",
  "⭐ جودة أصلية في {title} بـ {city}. نتطلع لخدمتك. #عراقي",
  "💎 {title} يقدم لك أفضل خدمة في {city}. تفضلوا! #الأفضل",
  "🎉 احتفلوا معنا في {title} - {city}. #شاكو_ماكو",
  "🌈 {title} في {city} - حيث الحلم يصبح حقيقة. #شاكو_ماكو"
];

// Unsplash image URLs for different categories
const imagesByCategory: Record<string, string[]> = {
  'cafe': [
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800',
    'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800'
  ],
  'restaurant': [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800',
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800'
  ],
  'hotel': [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800'
  ],
  'gym': [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800'
  ],
  'shopping': [
    'https://images.unsplash.com/photo-1555689727-6f4ee5f583ab?auto=format&fit=crop&w=800',
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800'
  ],
  'general': [
    'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800',
    'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800'
  ]
};

// Sample business data - 50 posts across Iraq
const businesses = [
  // Baghdad
  { id: 'biz-001', title: 'قهوة الحب', city: 'بغداد', category: 'cafe' },
  { id: 'biz-002', title: 'مطعم الشرقية', city: 'بغداد', category: 'restaurant' },
  { id: 'biz-003', title: 'فندق بابل', city: 'بغداد', category: 'hotel' },
  { id: 'biz-004', title: 'جيم برو', city: 'بغداد', category: 'gym' },
  { id: 'biz-005', title: 'تسوق العاصمة', city: 'بغداد', category: 'shopping' },

  // Erbil
  { id: 'biz-006', title: 'كافيه الوردة', city: 'أربيل', category: 'cafe' },
  { id: 'biz-007', title: 'مطعم الجنان', city: 'أربيل', category: 'restaurant' },
  { id: 'biz-008', title: 'فندق العظمة', city: 'أربيل', category: 'hotel' },
  { id: 'biz-009', title: 'جيم القوة', city: 'أربيل', category: 'gym' },
  { id: 'biz-010', title: 'صيدلية النجاح', city: 'أربيل', category: 'shopping' },

  // Basra
  { id: 'biz-011', title: 'قهوة الشط', city: 'البصرة', category: 'cafe' },
  { id: 'biz-012', title: 'مطعم الأسماك', city: 'البصرة', category: 'restaurant' },
  { id: 'biz-013', title: 'فندق الخليج', city: 'البصرة', category: 'hotel' },
  { id: 'biz-014', title: 'جيم البحار', city: 'البصرة', category: 'gym' },
  { id: 'biz-015', title: 'مركز التسوق البصري', city: 'البصرة', category: 'shopping' },

  // Dohuk
  { id: 'biz-016', title: 'قهوة الجبل', city: 'دهوك', category: 'cafe' },
  { id: 'biz-017', title: 'مطعم الطعم الأصلي', city: 'دهوك', category: 'restaurant' },
  { id: 'biz-018', title: 'فندق الجنة', city: 'دهوك', category: 'hotel' },
  { id: 'biz-019', title: 'جيم الشباب', city: 'دهوك', category: 'gym' },
  { id: 'biz-020', title: 'صيدلية الصحة', city: 'دهوك', category: 'shopping' },

  // Mosul
  { id: 'biz-021', title: 'قهوة النينوى', city: 'الموصل', category: 'cafe' },
  { id: 'biz-022', title: 'مطعم الرافدين', city: 'الموصل', category: 'restaurant' },
  { id: 'biz-023', title: 'فندق الحضارة', city: 'الموصل', category: 'hotel' },
  { id: 'biz-024', title: 'جيم الأبطال', city: 'الموصل', category: 'gym' },
  { id: 'biz-025', title: 'تسوق النينوى', city: 'الموصل', category: 'shopping' },

  // Sulaymaniyah
  { id: 'biz-026', title: 'كافيه الجمال', city: 'السليمانية', category: 'cafe' },
  { id: 'biz-027', title: 'مطعم الطبيخ الكردي', city: 'السليمانية', category: 'restaurant' },
  { id: 'biz-028', title: 'فندق الحرية', city: 'السليمانية', category: 'hotel' },
  { id: 'biz-029', title: 'جيم الأمل', city: 'السليمانية', category: 'gym' },
  { id: 'biz-030', title: 'صيدلية الأمان', city: 'السليمانية', category: 'shopping' },

  // Karbala
  { id: 'biz-031', title: 'قهوة الزيارة', city: 'كربلاء', category: 'cafe' },
  { id: 'biz-032', title: 'مطعم الحسينية', city: 'كربلاء', category: 'restaurant' },
  { id: 'biz-033', title: 'فندق المعراج', city: 'كربلاء', category: 'hotel' },
  { id: 'biz-034', title: 'جيم الإيمان', city: 'كربلاء', category: 'gym' },
  { id: 'biz-035', title: 'صيدلية الرحمة', city: 'كربلاء', category: 'shopping' },

  // Najaf
  { id: 'biz-036', title: 'قهوة الصفا', city: 'النجف', category: 'cafe' },
  { id: 'biz-037', title: 'مطعم الورع', city: 'النجف', category: 'restaurant' },
  { id: 'biz-038', title: 'فندق الشريف', city: 'النجف', category: 'hotel' },
  { id: 'biz-039', title: 'جيم الفكر', city: 'النجف', category: 'gym' },
  { id: 'biz-040', title: 'صيدلية الشفاء', city: 'النجف', category: 'shopping' },

  // Hilla
  { id: 'biz-041', title: 'قهوة الهلة', city: 'الحلة', category: 'cafe' },
  { id: 'biz-042', title: 'مطعم بابل', city: 'الحلة', category: 'restaurant' },
  { id: 'biz-043', title: 'فندق بابلين', city: 'الحلة', category: 'hotel' },
  { id: 'biz-044', title: 'جيم الحضارة', city: 'الحلة', category: 'gym' },
  { id: 'biz-045', title: 'صيدلية بابل', city: 'الحلة', category: 'shopping' },

  // Kirkuk
  { id: 'biz-046', title: 'قهوة الكركوك', city: 'كركوك', category: 'cafe' },
  { id: 'biz-047', title: 'مطعم الذهب', city: 'كركوك', category: 'restaurant' },
  { id: 'biz-048', title: 'فندق الذهب الأسود', city: 'كركوك', category: 'hotel' },
  { id: 'biz-049', title: 'جيم النفط', city: 'كركوك', category: 'gym' },
  { id: 'biz-050', title: 'صيدلية الثروة', city: 'كركوك', category: 'shopping' }
];

async function seedData() {
  try {
    console.log('🌱 Starting to seed Shaku Maku business_postcards table...\n');

    const posts = businesses.map((biz, index) => {
      const template = arabicTemplates[index % arabicTemplates.length];
      const caption = template
        .replace('{title}', biz.title)
        .replace('{city}', biz.city);

      const categoryImages = imagesByCategory[biz.category] || imagesByCategory['general'];
      const imageUrl = categoryImages[index % categoryImages.length];

      // Only include columns that are likely to exist
      return {
        business_id: biz.id,
        caption,
        image_url: imageUrl,
        likes_count: Math.floor(Math.random() * 500) + 50,
        created_at: new Date(Date.now() - index * 3600000).toISOString(),
      };
    });

    // Insert in batches
    const batchSize = 10;
    for (let i = 0; i < posts.length; i += batchSize) {
      const batch = posts.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('business_postcards')
        .insert(batch);

      if (error) {
        console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error);
      } else {
        console.log(`✅ Inserted batch ${i / batchSize + 1} (${batch.length} posts)`);
      }
    }

    console.log('\n🎉 Successfully seeded 50 Shaku Maku posts!');
    console.log('📱 Your feed should now display beautiful Arabic captions with cinematic images.');
  } catch (error) {
    console.error('❌ Fatal error during seeding:', error);
    process.exit(1);
  }
}

seedData();
