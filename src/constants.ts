import { 
  Utensils, Coffee, Hotel, ShoppingBag, Landmark, 
  GraduationCap, Clapperboard, Plane, Stethoscope, Scale, 
  Hospital, HeartPulse, Home, PartyPopper, 
  Pill, Dumbbell, Sparkles, Store, Armchair, ShieldCheck
} from 'lucide-react';

export const ICON_MAP: Record<string, any> = {
  Utensils, Coffee, Hotel, ShoppingBag, Landmark, 
  GraduationCap, Clapperboard, Plane, Stethoscope, Scale, 
  Hospital, HeartPulse, Home, PartyPopper, 
  Pill, Dumbbell, Sparkles, Store, Armchair, ShieldCheck
};

export const CATEGORIES = [
  { id: 'dining', name: { en: 'RESTAURANTS & DINING', ar: 'المطاعم والمأكولات', ku: 'چێشتخانە و نانخواردن' }, icon: Utensils },
  { id: 'cafe', name: { en: 'CAFES & COFFEE', ar: 'المقاهي والقهوة', ku: 'کافێ و قاوە' }, icon: Coffee },
  { id: 'hotels', name: { en: 'HOTELS & STAYS', ar: 'الفنادق والإقامة', ku: 'هوتێل و مانەوە' }, icon: Hotel },
  { id: 'shopping', name: { en: 'SHOPPING & RETAIL', ar: 'التسوق والتجزئة', ku: 'بازاڕکردن و فرۆشتن' }, icon: ShoppingBag },
  { id: 'banks', name: { en: 'BANKS & FINANCE', ar: 'البنوك والتمويل', ku: 'بانک و دارایی' }, icon: Landmark },
  { id: 'education', name: { en: 'EDUCATION', ar: 'التعليم', ku: 'پەروەردە و خوێندن' }, icon: GraduationCap },
  { id: 'entertainment', name: { en: 'ENTERTAINMENT', ar: 'الترفيه', ku: 'کات بەسەربردن' }, icon: Clapperboard },
  { id: 'tourism', name: { en: 'TOURISM & TRAVEL', ar: 'السياحة والسفر', ku: 'گەشتیاری و گەشتکردن' }, icon: Plane },
  { id: 'doctors', name: { en: 'DOCTORS & PHYSICIANS', ar: 'الأطباء والأخصائيين', ku: 'پزیشکەکان' }, icon: Stethoscope },
  { id: 'lawyers', name: { en: 'LAWYERS & LEGAL', ar: 'المحامون والقانون', ku: 'پارێزەران و یاسا' }, icon: Scale },
  { id: 'hospitals', name: { en: 'HOSPITALS & CLINICS', ar: 'المستشفيات والعيادات', ku: 'نەخۆشخانە و کلینیکەکان' }, icon: Hospital },
  { id: 'clinics', name: { en: 'MEDICAL CLINICS', ar: 'العيادات الطبية', ku: 'کلینیکە پزیشكيیەکان' }, icon: HeartPulse },
  { id: 'realestate', name: { en: 'REAL ESTATE', ar: 'العقارات', ku: 'خانووبەرە' }, icon: Home },
  { id: 'events', name: { en: 'EVENTS & VENUES', ar: 'الفعاليات والقاعات', ku: 'بۆنە و هۆڵەکان' }, icon: PartyPopper, isHot: true },
  { id: 'pharmacy', name: { en: 'PHARMACY & DRUGS', ar: 'الصيدليات والأدوية', ku: 'دەرمانخانە و دەرمان' }, icon: Pill },
  { id: 'gym', name: { en: 'GYM & FITNESS', ar: 'الجيم واللياقة البدنية', ku: 'هۆڵی وەرزش و لەشجوانی' }, icon: Dumbbell },
  { id: 'beauty', name: { en: 'BEAUTY & SALONS', ar: 'الجمال والصالونات', ku: 'جوانی و ساڵۆنەکان' }, icon: Sparkles },
  { id: 'supermarkets', name: { en: 'SUPERMARKETS', ar: 'السوبر ماركت', ku: 'سۆپەرمارکێتەکان' }, icon: Store },
  { id: 'furniture', name: { en: 'FURNITURE & HOME', ar: 'الأثاث والمنزل', ku: 'کەلوپەلی ناوماڵ' }, icon: Armchair },
  { id: 'automotive', name: { en: 'AUTOMOTIVE & CARS', ar: 'السيارات والمركبات', ku: 'ئۆتۆمبێل و ئامرازەکان' }, icon: ShieldCheck },
];
