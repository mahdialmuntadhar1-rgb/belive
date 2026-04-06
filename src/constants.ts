import { 
  Utensils, Coffee, Hotel, ShoppingBag, Landmark, 
  GraduationCap, Clapperboard, Plane, Stethoscope, Scale, 
  Hospital, HeartPulse, Home, PartyPopper, 
  Pill, Dumbbell, Sparkles, Store, Armchair, ShieldCheck,
  Smartphone, Shirt, MoreHorizontal
} from 'lucide-react';

export const ICON_MAP: Record<string, any> = {
  Utensils, Coffee, Hotel, ShoppingBag, Landmark, 
  GraduationCap, Clapperboard, Plane, Stethoscope, Scale, 
  Hospital, HeartPulse, Home, PartyPopper, 
  Pill, Dumbbell, Sparkles, Store, Armchair, ShieldCheck,
  Smartphone, Shirt, MoreHorizontal
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
  { id: 'dining', name: { en: 'RESTAURANTS & DINING', ar: 'المطاعم والمأكولات', ku: 'چێشتخانە و نانخواردن' }, icon: Utensils, types: 4 },
  { id: 'cafe', name: { en: 'CAFES & COFFEE', ar: 'المقاهي والقهوة', ku: 'کافێ و قاوە' }, icon: Coffee, types: 3 },
  { id: 'hotels', name: { en: 'HOTELS & STAYS', ar: 'الفنادق والإقامة', ku: 'هوتێل و مانەوە' }, icon: Hotel, types: 3 },
  { id: 'shopping', name: { en: 'SHOPPING & RETAIL', ar: 'التسوق والتجزئة', ku: 'بازاڕکردن و فرۆشتن' }, icon: ShoppingBag, types: 3 },
  { id: 'banks', name: { en: 'BANKS & FINANCE', ar: 'البنوك والمالية', ku: 'بانک و دارایی' }, icon: Landmark, types: 3 },
  { id: 'education', name: { en: 'EDUCATION', ar: 'التعليم', ku: 'پەروەردە' }, icon: GraduationCap, types: 3 },
  { id: 'entertainment', name: { en: 'ENTERTAINMENT', ar: 'الترفيه', ku: 'کات بەسەربردن' }, icon: Clapperboard, types: 3 },
  { id: 'tourism', name: { en: 'TOURISM & TRAVEL', ar: 'السياحة والسفر', ku: 'گەشتیاری و سەفەر' }, icon: Plane, types: 3 },
  { id: 'doctors', name: { en: 'DOCTORS & PHYSICIANS', ar: 'الأطباء والجراحون', ku: 'دکتۆر و پزیشکەکان' }, icon: Stethoscope, types: 6 },
  { id: 'lawyers', name: { en: 'LAWYERS & LEGAL', ar: 'المحامون والقانون', ku: 'پارێزەر و یاسا' }, icon: Scale, types: 3 },
  { id: 'hospitals', name: { en: 'HOSPITALS & CLINICS', ar: 'المستشفيات والعيادات', ku: 'نەخۆشخانە و کلینیکەکان' }, icon: Hospital, types: 4 },
  { id: 'medical', name: { en: 'MEDICAL CLINICS', ar: 'العيادات الطبية', ku: 'کلینیکە پزیشکییەکان' }, icon: HeartPulse, types: 5 },
  { id: 'realestate', name: { en: 'REAL ESTATE', ar: 'العقارات', ku: 'خانووبەرە' }, icon: Home, types: 4 },
  { id: 'events', name: { en: 'EVENTS & VENUES', ar: 'الفعاليات والقاعات', ku: 'بۆنە و هۆڵەکان' }, icon: PartyPopper, types: 4, isHot: true },
  { id: 'general', name: { en: 'OTHERS & GENERAL', ar: 'أخرى وعام', ku: 'ئەوانی تر و گشتی' }, icon: MoreHorizontal, types: 4 },
  { id: 'pharmacy', name: { en: 'PHARMACY & DRUGS', ar: 'الصيدليات والأدوية', ku: 'دەرمانخانە و دەرمان' }, icon: Pill, types: 3 },
  { id: 'gym', name: { en: 'GYM & FITNESS', ar: 'الجيم واللياقة', ku: 'هۆڵە وەرزشییەکان' }, icon: Dumbbell, types: 4 },
  { id: 'beauty', name: { en: 'BEAUTY & SALONS', ar: 'الجمال والصالونات', ku: 'جوانی و ساڵۆنەکان' }, icon: Sparkles, types: 4 },
  { id: 'supermarkets', name: { en: 'SUPERMARKETS', ar: 'الأسواق المركزية', ku: 'سوپەرمارکێتەکان' }, icon: Store, types: 4 },
  { id: 'furniture', name: { en: 'FURNITURE & HOME', ar: 'الأثاث والمنزل', ku: 'کەلوپەلی ناوماڵ' }, icon: Armchair, types: 4 },
];
