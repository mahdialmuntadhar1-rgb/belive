import { 
  Utensils, Coffee, Hotel, ShoppingBag, Landmark, 
  GraduationCap, Clapperboard, Plane, Stethoscope, Scale, 
  Hospital, HeartPulse, Home, PartyPopper, 
  Pill, Dumbbell, Sparkles, Store, Armchair, ShieldCheck,
  Smartphone, Shirt
} from 'lucide-react';

export const ICON_MAP: Record<string, any> = {
  Utensils, Coffee, Hotel, ShoppingBag, Landmark, 
  GraduationCap, Clapperboard, Plane, Stethoscope, Scale, 
  Hospital, HeartPulse, Home, PartyPopper, 
  Pill, Dumbbell, Sparkles, Store, Armchair, ShieldCheck,
  Smartphone, Shirt
};

export const GOVERNORATES = [
  { id: 'baghdad', name: { en: 'Baghdad', ar: 'بغداد', ku: 'بەغدا' } },
  { id: 'erbil', name: { en: 'Erbil', ar: 'أربيل', ku: 'هەولێر' } },
  { id: 'basra', name: { en: 'Basra', ar: 'البصرة', ku: 'بەسرە' } },
  { id: 'mosul', name: { en: 'Mosul', ar: 'الموصل', ku: 'مووسڵ' } },
  { id: 'sulaymaniyah', name: { en: 'Sulaymaniyah', ar: 'السليمانية', ku: 'سلێمانی' } },
  { id: 'duhok', name: { en: 'Duhok', ar: 'دهوك', ku: 'دهۆک' } },
  { id: 'kirkuk', name: { en: 'Kirkuk', ar: 'كركوك', ku: 'کەرکووک' } },
  { id: 'najaf', name: { en: 'Najaf', ar: 'النجف', ku: 'نەجەف' } },
  { id: 'karbala', name: { en: 'Karbala', ar: 'كربلاء', ku: 'کەربەلا' } },
  { id: 'anbar', name: { en: 'Anbar', ar: 'الأنبار', ku: 'ئەنبار' } },
  { id: 'dhi_qar', name: { en: 'Dhi Qar', ar: 'ذي قار', ku: 'زیقار' } },
  { id: 'babil', name: { en: 'Babil', ar: 'بابل', ku: 'بابل' } },
  { id: 'diyala', name: { en: 'Diyala', ar: 'ديالى', ku: 'دیالە' } },
  { id: 'maysan', name: { en: 'Maysan', ar: 'ميسان', ku: 'میسان' } },
  { id: 'qadisiyah', name: { en: 'Qadisiyah', ar: 'القادسية', ku: 'قادسیە' } },
  { id: 'muthanna', name: { en: 'Muthanna', ar: 'المثنى', ku: 'موسەنا' } },
  { id: 'salah_al_din', name: { en: 'Salah al-Din', ar: 'صلاح الدين', ku: 'سەڵاحەدین' } },
  { id: 'wasit', name: { en: 'Wasit', ar: 'واسط', ku: 'واست' } },
  { id: 'halabja', name: { en: 'Halabja', ar: 'حلبجة', ku: 'هەڵەبجە' } },
];

export const CITIES: Record<string, { id: string, name: { en: string, ar: string, ku: string } }[]> = {
  baghdad: [
    { id: 'mansour', name: { en: 'Mansour', ar: 'المنصور', ku: 'مەنسوور' } },
    { id: 'karada', name: { en: 'Karada', ar: 'الكرادة', ku: 'کەرادە' } },
    { id: 'yarmouk', name: { en: 'Yarmouk', ar: 'اليرموك', ku: 'یەرمووک' } },
    { id: 'jadriya', name: { en: 'Jadriya', ar: 'الجادرية', ku: 'جادریە' } },
  ],
  erbil: [
    { id: 'ankawa', name: { en: 'Ankawa', ar: 'عنكاوا', ku: 'عەنکاوە' } },
    { id: 'bakhtiari', name: { en: 'Bakhtiari', ar: 'بختياري', ku: 'بەختیاری' } },
    { id: 'dream_city', name: { en: 'Dream City', ar: 'دريم سيتي', ku: 'دریم سیتی' } },
  ],
  basra: [
    { id: 'ashar', name: { en: 'Ashar', ar: 'العشار', ku: 'عەشار' } },
    { id: 'abbasiya', name: { en: 'Abbasiya', ar: 'العباسية', ku: 'عەباسیە' } },
  ],
  // Add more as needed
};

export const CATEGORIES = [
  { id: 'dining', name: { en: 'Restaurants', ar: 'المطاعم', ku: 'چێشتخانەکان' }, icon: Utensils },
  { id: 'cafe', name: { en: 'Cafes', ar: 'المقاهي', ku: 'کافێکان' }, icon: Coffee },
  { id: 'beauty', name: { en: 'Beauty', ar: 'الجمال', ku: 'جوانی' }, icon: Sparkles },
  { id: 'clinics', name: { en: 'Clinics', ar: 'العيادات', ku: 'کلینیکەکان' }, icon: Hospital },
  { id: 'pharmacy', name: { en: 'Pharmacies', ar: 'الصيدليات', ku: 'دەرمانخانەکان' }, icon: Pill },
  { id: 'gym', name: { en: 'Gyms', ar: 'الجيم', ku: 'هۆڵە وەرزشییەکان' }, icon: Dumbbell },
  { id: 'supermarkets', name: { en: 'Markets', ar: 'الأسواق', ku: 'بازاڕەکان' }, icon: Store },
  { id: 'hotels', name: { en: 'Hotels', ar: 'الفنادق', ku: 'هوتێلەکان' }, icon: Hotel },
  { id: 'electronics', name: { en: 'Electronics', ar: 'الإلكترونيات', ku: 'ئەلکترۆنیات' }, icon: Smartphone },
  { id: 'fashion', name: { en: 'Fashion', ar: 'الأزياء', ku: 'فاشن' }, icon: Shirt },
  { id: 'shopping', name: { en: 'Shopping', ar: 'التسوق', ku: 'بازاڕکردن' }, icon: ShoppingBag },
  { id: 'banks', name: { en: 'Banks', ar: 'البنوك', ku: 'بانکەکان' }, icon: Landmark },
  { id: 'education', name: { en: 'Education', ar: 'التعليم', ku: 'پەروەردە' }, icon: GraduationCap },
  { id: 'entertainment', name: { en: 'Entertainment', ar: 'الترفيه', ku: 'کات بەسەربردن' }, icon: Clapperboard },
  { id: 'tourism', name: { en: 'Tourism', ar: 'السياحة', ku: 'گەشتیاری' }, icon: Plane },
  { id: 'lawyers', name: { en: 'Lawyers', ar: 'المحامون', ku: 'پارێزەران' }, icon: Scale },
  { id: 'realestate', name: { en: 'Real Estate', ar: 'العقارات', ku: 'خانووبەرە' }, icon: Home },
  { id: 'events', name: { en: 'Events', ar: 'الفعاليات', ku: 'بۆنەکان' }, icon: PartyPopper },
  { id: 'furniture', name: { en: 'Furniture', ar: 'الأثاث', ku: 'کەلوپەلی ناوماڵ' }, icon: Armchair },
  { id: 'automotive', name: { en: 'Automotive', ar: 'السيارات', ku: 'ئۆتۆمبێل' }, icon: ShieldCheck },
];
