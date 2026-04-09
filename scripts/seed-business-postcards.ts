#!/usr/bin/env npx ts-node

/**
 * Seed script for Shaku Maku business_postcards table
 * Populates the table with 50 sample posts with Arabic captions
 *
 * Run with: npx ts-node scripts/seed-business-postcards.ts
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
  "✨ اكتشفوا {title} في قلب {city}! الأفضل في {category}. #العراق #شاكو_ماكو",
  "🏆 {title} - جودة عالية وخدمة متميزة في {city}. نرحب بك! #العراق_أولاً #شاكو_ماكو",
  "🌟 تجربة فريدة في {title} بـ {city}. زورنا الآن! #محلي #شاكو_ماكو",
  "💼 {title} في {city} - حيث الاحترافية تلتقي بالجودة. #خدمة_ممتازة #شاكو_ماكو",
  "🎯 {category} بأفضل مستويات في {title}, {city}! تفضلوا بزيارتنا. #نحن_هنا #شاكو_ماكو",
  "🔥 {title} - المقصد الأول للـ {category} في {city}. كن من زبائننا! #شاكو_ماكو",
  "⭐ جودة أصلية في {title} بـ {city}. نتطلع لخدمتك. #عراقي #شاكو_ماكو",
  "💎 {title} يقدم لك {category} متميز في {city}. تفضلوا! #الأفضل #شاكو_ماكو",
  "🎉 احتفلوا معنا في {title} - {category} عراقي الجودة في {city}. #شاكو_ماكو",
  "🌈 {title} في {city} - حيث الحلم يصبح حقيقة. {category} على أعلى مستوى. #شاكو_ماكو"
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
  'pharmacy': [
    'https://images.unsplash.com/photo-1587854692152-cbe660dbde0b?auto=format&fit=crop&w=800',
    'https://images.unsplash.com/photo-1576091160550-112173e7f9db?auto=format&fit=crop&w=800'
  ]
};

// Sample business data
const businesses = [
  // Baghdad
  { id: 'biz-001', title: 'قهوة الحب', city: 'بغداد', category: 'cafe', governorate: 'بغداد' },
  { id: 'biz-002', title: 'مطعم الشرقية', city: 'بغداد', category: 'restaurant', governorate: 'بغداد' },
  { id: 'biz-003', title: 'فندق بابل', city: 'بغداد', category: 'hotel', governorate: 'بغداد' },
  { id: 'biz-004', title: 'جيم برو', city: 'بغداد', category: 'gym', governorate: 'بغداد' },
  { id: 'biz-005', title: 'تسوق العاصمة', city: 'بغداد', category: 'shopping', governorate: 'بغداد' },

  // Erbil
  { id: 'biz-006', title: 'كافيه الوردة', city: 'أربيل', category: 'cafe', governorate: 'أربيل' },
  { id: 'biz-007', title: 'مطعم الجنان', city: 'أربيل', category: 'restaurant', governorate: 'أربيل' },
  { id: 'biz-008', title: 'فندق العظمة', city: 'أربيل', category: 'hotel', governorate: 'أربيل' },
  { id: 'biz-009', title: 'جيم القوة', city: 'أربيل', category: 'gym', governorate: 'أربيل' },
  { id: 'biz-010', title: 'صيدلية النجاح', city: 'أربيل', category: 'pharmacy', governorate: 'أربيل' },

  // Basra
  { id: 'biz-011', title: 'قهوة الشط', city: 'البصرة', category: 'cafe', governorate: 'البصرة' },
  { id: 'biz-012', title: 'مطعم الأسماك', city: 'البصرة', category: 'restaurant', governorate: 'البصرة' },
  { id: 'biz-013', title: 'فندق الخليج', city: 'البصرة', category: 'hotel', governorate: 'البصرة' },
  { id: 'biz-014', title: 'جيم البحار', city: 'البصرة', category: 'gym', governorate: 'البصرة' },
  { id: 'biz-015', title: 'مركز التسوق البصري', city: 'البصرة', category: 'shopping', governorate: 'البصرة' },

  // Dohuk
  { id: 'biz-016', title: 'قهوة الجبل', city: 'دهوك', category: 'cafe', governorate: 'دهوك' },
  { id: 'biz-017', title: 'مطعم الطعم الأصلي', city: 'دهوك', category: 'restaurant', governorate: 'دهوك' },
  { id: 'biz-018', title: 'فندق الجنة', city: 'دهوك', category: 'hotel', governorate: 'دهوك' },
  { id: 'biz-019', title: 'جيم الشباب', city: 'دهوك', category: 'gym', governorate: 'دهوك' },
  { id: 'biz-020', title: 'صيدلية الصحة', city: 'دهوك', category: 'pharmacy', governorate: 'دهوك' },

  // Mosul
  { id: 'biz-021', title: 'قهوة النينوى', city: 'الموصل', category: 'cafe', governorate: 'نينوى' },
  { id: 'biz-022', title: 'مطعم الرافدين', city: 'الموصل', category: 'restaurant', governorate: 'نينوى' },
  { id: 'biz-023', title: 'فندق الحضارة', city: 'الموصل', category: 'hotel', governorate: 'نينوى' },
  { id: 'biz-024', title: 'جيم الأبطال', city: 'الموصل', category: 'gym', governorate: 'نينوى' },
  { id: 'biz-025', title: 'تسوق النينوى', city: 'الموصل', category: 'shopping', governorate: 'نينوى' },

  // Sulaymaniyah
  { id: 'biz-026', title: 'كافيه الجمال', city: 'السليمانية', category: 'cafe', governorate: 'السليمانية' },
  { id: 'biz-027', title: 'مطعم الطبيخ الكردي', city: 'السليمانية', category: 'restaurant', governorate: 'السليمانية' },
  { id: 'biz-028', title: 'فندق الحرية', city: 'السليمانية', category: 'hotel', governorate: 'السليمانية' },
  { id: 'biz-029', title: 'جيم الأمل', city: 'السليمانية', category: 'gym', governorate: 'السليمانية' },
  { id: 'biz-030', title: 'صيدلية الأمان', city: 'السليمانية', category: 'pharmacy', governorate: 'السليمانية' },

  // Karbala
  { id: 'biz-031', title: 'قهوة الزيارة', city: 'كربلاء', category: 'cafe', governorate: 'كربلاء' },
  { id: 'biz-032', title: 'مطعم الحسينية', city: 'كربلاء', category: 'restaurant', governorate: 'كربلاء' },
  { id: 'biz-033', title: 'فندق المعراج', city: 'كربلاء', category: 'hotel', governorate: 'كربلاء' },
  { id: 'biz-034', title: 'جيم الإيمان', city: 'كربلاء', category: 'gym', governorate: 'كربلاء' },
  { id: 'biz-035', title: 'صيدلية الرحمة', city: 'كربلاء', category: 'pharmacy', governorate: 'كربلاء' },

  // Najaf
  { id: 'biz-036', title: 'قهوة الصفا', city: 'النجف', category: 'cafe', governorate: 'النجف' },
  { id: 'biz-037', title: 'مطعم الورع', city: 'النجف', category: 'restaurant', governorate: 'النجف' },
  { id: 'biz-038', title: 'فندق الشريف', city: 'النجف', category: 'hotel', governorate: 'النجف' },
  { id: 'biz-039', title: 'جيم الفكر', city: 'النجف', category: 'gym', governorate: 'النجف' },
  { id: 'biz-040', title: 'صيدلية الشفاء', city: 'النجف', category: 'pharmacy', governorate: 'النجف' },

  // Hilla
  { id: 'biz-041', title: 'قهوة الهلة', city: 'الحلة', category: 'cafe', governorate: 'بابل' },
  { id: 'biz-042', title: 'مطعم بابل', city: 'الحلة', category: 'restaurant', governorate: 'بابل' },
  { id: 'biz-043', title: 'فندق بابلين', city: 'الحلة', category: 'hotel', governorate: 'بابل' },
  { id: 'biz-044', title: 'جيم الحضارة', city: 'الحلة', category: 'gym', governorate: 'بابل' },
  { id: 'biz-045', title: 'صيدلية بابل', city: 'الحلة', category: 'pharmacy', governorate: 'بابل' },

  // Kirkuk
  { id: 'biz-046', title: 'قهوة الكركوك', city: 'كركوك', category: 'cafe', governorate: 'كركوك' },
  { id: 'biz-047', title: 'مطعم الذهب', city: 'كركوك', category: 'restaurant', governorate: 'كركوك' },
  { id: 'biz-048', title: 'فندق الذهب الأسود', city: 'كركوك', category: 'hotel', governorate: 'كركوك' },
  { id: 'biz-049', title: 'جيم النفط', city: 'كركوك', category: 'gym', governorate: 'كركوك' },
  { id: 'biz-050', title: 'صيدلية الثروة', city: 'كركوك', category: 'pharmacy', governorate: 'كركوك' }
];

async function seedData() {
  try {
    console.log('🌱 Starting to seed Shaku Maku business_postcards table...\n');

    const posts = businesses.map((biz, index) => {
      const template = arabicTemplates[index % arabicTemplates.length];
      const caption = template
        .replace('{title}', biz.title)
        .replace('{city}', biz.city)
        .replace('{category}', biz.category);

      const categoryImages = imagesByCategory[biz.category] || imagesByCategory['cafe'];
      const imageUrl = categoryImages[index % categoryImages.length];

      return {
        business_id: biz.id,
        title: biz.title,
        city: biz.city,
        governorate: biz.governorate,
        category_tag: biz.category,
        caption,
        image_url: imageUrl,
        likes_count: Math.floor(Math.random() * 500) + 50,
        created_at: new Date(Date.now() - index * 3600000).toISOString(),
        updated_at: new Date().toISOString()
      };
    });

    // Insert in batches to avoid overwhelming the API
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
