import { 
  Utensils, Coffee, Hotel, ShoppingBag, Landmark, 
  GraduationCap, Clapperboard, Plane, Stethoscope, Scale, 
  Hospital, HeartPulse, Home, PartyPopper, 
  Pill, Dumbbell, Sparkles, Store, Armchair, ShieldCheck,
  Smartphone, Shirt, Car, Cpu, MoreHorizontal
} from 'lucide-react';

export const ICON_MAP: Record<string, any> = {
  Utensils, Coffee, Hotel, ShoppingBag, Landmark, 
  GraduationCap, Clapperboard, Plane, Stethoscope, Scale, 
  Hospital, HeartPulse, Home, PartyPopper, 
  Pill, Dumbbell, Sparkles, Store, Armchair, ShieldCheck,
  Smartphone, Shirt, Car, Cpu, MoreHorizontal
};

export const GOVERNORATES = [
  { id: 'baghdad', name: { en: 'Baghdad', ar: 'بغداد', ku: 'بەغدا' } },
  { id: 'basra', name: { en: 'Basra', ar: 'البصرة', ku: 'بەسرە' } },
  { id: 'nineveh', name: { en: 'Nineveh', ar: 'نينوى', ku: 'نەینەوا' } },
  { id: 'erbil', name: { en: 'Erbil', ar: 'أربيل', ku: 'هەولێر' } },
  { id: 'sulaymaniyah', name: { en: 'Sulaymaniyah', ar: 'السليمانية', ku: 'سلێمانی' } },
  { id: 'kirkuk', name: { en: 'Kirkuk', ar: 'كركوك', ku: 'کەرکووک' } },
  { id: 'najaf', name: { en: 'Najaf', ar: 'النجف', ku: 'نەجەف' } },
  { id: 'karbala', name: { en: 'Karbala', ar: 'كربلاء', ku: 'کەربەلا' } },
  { id: 'babil', name: { en: 'Babil', ar: 'بابل', ku: 'بابل' } },
  { id: 'anbar', name: { en: 'Anbar', ar: 'الأنبار', ku: 'ئەنبار' } },
  { id: 'diyala', name: { en: 'Diyala', ar: 'ديالى', ku: 'دیالە' } },
  { id: 'dhi_qar', name: { en: 'Dhi Qar', ar: 'ذي قار', ku: 'زیقار' } },
  { id: 'maysan', name: { en: 'Maysan', ar: 'ميسان', ku: 'میسان' } },
  { id: 'al_qadisiyah', name: { en: 'Al-Qadisiyah', ar: 'القادسية', ku: 'قادسیە' } },
  { id: 'wasit', name: { en: 'Wasit', ar: 'واسط', ku: 'واست' } },
  { id: 'muthanna', name: { en: 'Muthanna', ar: 'المثنى', ku: 'موسەنا' } },
  { id: 'dohuk', name: { en: 'Dohuk', ar: 'دهوك', ku: 'دهۆک' } },
  { id: 'salah_al_din', name: { en: 'Salah al-Din', ar: 'صلاح الدين', ku: 'سەڵاحەدین' } },
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
  { id: 'dining', name: { en: 'RESTAURANTS & DINING', ar: 'المطاعم والمأكولات', ku: 'چێشتخانە و نانخواردن' }, icon: Utensils, types: 4, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop' },
  { id: 'cafe', name: { en: 'CAFES & COFFEE', ar: 'المقاهي والقهوة', ku: 'کافێ و قاوە' }, icon: Coffee, types: 3, image: 'https://images.unsplash.com/photo-1501339819398-ed495197ff21?q=80&w=400&auto=format&fit=crop' },
  { id: 'hotels', name: { en: 'HOTELS & STAYS', ar: 'الفنادق والإقامة', ku: 'هوتێل و مانەوە' }, icon: Hotel, types: 3, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400&auto=format&fit=crop' },
  { id: 'shopping', name: { en: 'SHOPPING & RETAIL', ar: 'التسوق والتجزئة', ku: 'بازاڕکردن و فرۆشتن' }, icon: ShoppingBag, types: 3, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=400&auto=format&fit=crop' },
  { id: 'banks', name: { en: 'BANKS & FINANCE', ar: 'البنوك والمالية', ku: 'بانک و دارایی' }, icon: Landmark, types: 3, image: 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?q=80&w=400&auto=format&fit=crop' },
  { id: 'education', name: { en: 'EDUCATION', ar: 'التعليم', ku: 'پەروەردە' }, icon: GraduationCap, types: 3, image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=400&auto=format&fit=crop' },
  { id: 'entertainment', name: { en: 'ENTERTAINMENT', ar: 'الترفيه', ku: 'کات بەسەربردن' }, icon: Clapperboard, types: 3, image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop' },
  { id: 'tourism', name: { en: 'TOURISM & TRAVEL', ar: 'السياحة والسفر', ku: 'گەشتیاری و سەفەر' }, icon: Plane, types: 3, image: 'https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?q=80&w=400&auto=format&fit=crop' },
  { id: 'doctors', name: { en: 'DOCTORS & PHYSICIANS', ar: 'الأطباء والجراحون', ku: 'دکتۆر و پزیشکەکان' }, icon: Stethoscope, types: 6, image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop' },
  { id: 'lawyers', name: { en: 'LAWYERS & LEGAL', ar: 'المحامون والقانون', ku: 'پارێزەر و یاسا' }, icon: Scale, types: 3, image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=400&auto=format&fit=crop' },
  { id: 'hospitals', name: { en: 'HOSPITALS & CLINICS', ar: 'المستشفيات والعيادات', ku: 'نەخۆشخانە و کلینیکەکان' }, icon: Hospital, types: 4, image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=400&auto=format&fit=crop' },
  { id: 'medical', name: { en: 'MEDICAL CLINICS', ar: 'العيادات الطبية', ku: 'کلینیکە پزیشکییەکان' }, icon: HeartPulse, types: 5, image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=400&auto=format&fit=crop' },
  { id: 'realestate', name: { en: 'REAL ESTATE', ar: 'العقارات', ku: 'خانووبەرە' }, icon: Home, types: 4, image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=400&auto=format&fit=crop' },
  { id: 'events', name: { en: 'EVENTS & VENUES', ar: 'الفعاليات والقاعات', ku: 'بۆنە و هۆڵەکان' }, icon: PartyPopper, types: 4, isHot: true, image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=400&auto=format&fit=crop' },
  { id: 'general', name: { en: 'OTHERS & GENERAL', ar: 'أخرى وعام', ku: 'ئەوانی تر و گشتی' }, icon: MoreHorizontal, types: 4, image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=400&auto=format&fit=crop' },
  { id: 'pharmacy', name: { en: 'PHARMACY & DRUGS', ar: 'الصيدليات والأدوية', ku: 'دەرمانخانە و دەرمان' }, icon: Pill, types: 3, image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?q=80&w=400&auto=format&fit=crop' },
  { id: 'gym', name: { en: 'GYM & FITNESS', ar: 'الجيم واللياقة', ku: 'هۆڵە وەرزشییەکان' }, icon: Dumbbell, types: 4, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop' },
  { id: 'beauty', name: { en: 'BEAUTY & SALONS', ar: 'الجمال والصالونات', ku: 'جوانی و ساڵۆنەکان' }, icon: Sparkles, types: 4, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=400&auto=format&fit=crop' },
  { id: 'supermarkets', name: { en: 'SUPERMARKETS', ar: 'الأسواق المركزية', ku: 'سوپەرمارکێتەکان' }, icon: Store, types: 4, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&auto=format&fit=crop' },
  { id: 'furniture', name: { en: 'FURNITURE & HOME', ar: 'الأثاث والمنزل', ku: 'کەلوپەلی ناوماڵ' }, icon: Armchair, types: 4, image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=400&auto=format&fit=crop' },
];
