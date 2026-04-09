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

const businesses = [
  {
    name: "Rotana Erbil",
    nameAr: "أربيل روتانا",
    category: "hotels",
    governorate: "Erbil",
    city: "Erbil",
    address: "Gulan Street, Erbil",
    phone: "+964 66 210 5555",
    rating: 4.8,
    reviewCount: 1250,
    isFeatured: true,
    isVerified: true,
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    description: "Luxury hotel in the heart of Erbil.",
    descriptionAr: "فندق فاخر في قلب أربيل."
  },
  {
    name: "Babylon Rotana",
    nameAr: "بابل روتانا",
    category: "hotels",
    governorate: "Baghdad",
    city: "Baghdad",
    address: "Al Jadriya, Baghdad",
    phone: "+964 780 911 1111",
    rating: 4.7,
    reviewCount: 980,
    isFeatured: true,
    isVerified: true,
    imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
    description: "Iconic hotel overlooking the Tigris river.",
    descriptionAr: "فندق أيقوني يطل على نهر دجلة."
  },
  {
    name: "Saj Al-Reef",
    nameAr: "صاج الريف",
    category: "dining",
    governorate: "Baghdad",
    city: "Baghdad",
    address: "Mansour, Baghdad",
    phone: "+964 770 123 4567",
    rating: 4.5,
    reviewCount: 2100,
    isFeatured: false,
    isVerified: true,
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    description: "Famous Iraqi fast food and traditional dishes.",
    descriptionAr: "أشهر المأكولات السريعة والأطباق التقليدية العراقية."
  },
  {
    name: "Erbil Citadel Cafe",
    nameAr: "مقهى قلعة أربيل",
    category: "cafe",
    governorate: "Erbil",
    city: "Erbil",
    address: "Citadel, Erbil",
    phone: "+964 750 111 2222",
    rating: 4.9,
    reviewCount: 3500,
    isFeatured: true,
    isVerified: true,
    imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
    description: "Historic cafe with a view of the city.",
    descriptionAr: "مقهى تاريخي مع إطلالة على المدينة."
  },
  {
    name: "Basra International Hotel",
    nameAr: "فندق البصرة الدولي",
    category: "hotels",
    governorate: "Basra",
    city: "Basra",
    address: "Corniche Street, Basra",
    phone: "+964 780 123 4567",
    rating: 4.4,
    reviewCount: 750,
    isFeatured: false,
    isVerified: true,
    imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
    description: "The most prestigious hotel in Basra.",
    descriptionAr: "أرقى فندق في البصرة."
  },
  {
    name: "Sulaymaniyah Grand Hotel",
    nameAr: "فندق السليمانية الكبير",
    category: "hotels",
    governorate: "Sulaymaniyah",
    city: "Sulaymaniyah",
    address: "Salim Street, Sulaymaniyah",
    phone: "+964 770 111 3333",
    rating: 4.6,
    reviewCount: 890,
    isFeatured: true,
    isVerified: true,
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    description: "Luxury and comfort in Sulaymaniyah.",
    descriptionAr: "الفخامة والراحة في السليمانية."
  },
  {
    name: "Mosul Museum Cafe",
    nameAr: "مقهى متحف الموصل",
    category: "cafe",
    governorate: "Nineveh",
    city: "Mosul",
    address: "Museum District, Mosul",
    phone: "+964 770 444 5555",
    rating: 4.3,
    reviewCount: 450,
    isFeatured: false,
    isVerified: false,
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
    description: "A cultural hub in the heart of Mosul.",
    descriptionAr: "مركز ثقافي في قلب الموصل."
  },
  {
    name: "Baghdad Mall Gym",
    nameAr: "جيم بغداد مول",
    category: "gym",
    governorate: "Baghdad",
    city: "Baghdad",
    address: "Harthiya, Baghdad",
    phone: "+964 780 555 6666",
    rating: 4.7,
    reviewCount: 1200,
    isFeatured: false,
    isVerified: true,
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
    description: "State of the art fitness center.",
    descriptionAr: "مركز لياقة بدنية حديث."
  }
];

async function seed() {
  console.log('Seeding businesses...');
  
  const { data, error } = await supabase
    .from('businesses')
    .insert(businesses);

  if (error) {
    console.error('Error seeding businesses:', error);
  } else {
    console.log('Successfully seeded businesses');
  }
}

seed();
