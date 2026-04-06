/**
 * Centralized UI translation strings.
 * Categories and governorates come from the DB (useMetadata hook).
 * This file covers static UI: navigation, hero, auth, labels, errors.
 *
 * Usage:
 *   import { t, useT } from '@/i18n/ui';
 *   const { language } = useHomeStore();
 *   t('nav.home', language)
 *   // or
 *   const tr = useT();
 *   tr('nav.home')
 */
import { useHomeStore } from '@/stores/homeStore';

export type Lang = 'en' | 'ar' | 'ku';
type TranslationMap = Record<string, Record<Lang, string>>;

export const ui: TranslationMap = {
  // ── Navigation ─────────────────────────────────────────────
  'nav.home':           { en: 'Home',            ar: 'الرئيسية',          ku: 'سەرەتا' },
  'nav.explore':        { en: 'Explore',          ar: 'استكشاف',           ku: 'گەڕان' },
  'nav.directory':      { en: 'Directory',        ar: 'الدليل',            ku: 'دایرێکتۆری' },
  'nav.manage':         { en: 'Manage Business',  ar: 'إدارة الأعمال',     ku: 'بەڕێوەبردنی کار' },
  'nav.settings':       { en: 'Settings',         ar: 'الإعدادات',         ku: 'ڕێکخستنەکان' },
  'nav.signOut':        { en: 'Sign Out',          ar: 'تسجيل الخروج',     ku: 'چوونەدەرەوە' },
  'nav.owner':          { en: 'Owner',             ar: 'مالك',              ku: 'خاوەن' },
  'nav.member':         { en: 'Member',            ar: 'عضو',               ku: 'ئەندام' },

  // ── Hero Section ───────────────────────────────────────────
  'hero.title':         { en: 'Discover Iraq\'s Best Businesses', ar: 'اكتشف أفضل الأعمال في العراق', ku: 'باشترین کارە عێراقییەکان بدۆزەرەوە' },
  'hero.subtitle':      { en: 'Your trusted guide to local services across all 18 governorates', ar: 'دليلك الموثوق للخدمات المحلية في جميع المحافظات', ku: 'ڕێنمایی متمانەپێکراوت بۆ خزمەتگوزارییە ناوخۆییەکان لە هەموو پارێزگاکاندا' },
  'hero.searchPlaceholder': { en: 'Search businesses, categories...', ar: 'ابحث عن الأعمال والتصنيفات...', ku: 'گەڕان بۆ کارەکان و پۆلەکان...' },
  'hero.cta':           { en: 'Start Exploring',   ar: 'ابدأ الاستكشاف',  ku: 'دەستبکە بە گەڕان' },
  'hero.featured':      { en: 'Featured',           ar: 'مميز',             ku: 'دیارە' },
  'hero.businesses':    { en: 'businesses',          ar: 'عمل تجاري',        ku: 'کاری بازرگانی' },

  // ── Directory / Explore ────────────────────────────────────
  'dir.showing':        { en: 'Showing',            ar: 'عرض',              ku: 'پیشاندانی' },
  'dir.of':             { en: 'of',                 ar: 'من',               ku: 'لە' },
  'dir.services':       { en: 'local services across Iraq', ar: 'خدمة محلية في العراق', ku: 'خزمەتگوزاری ناوخۆیی لە عێراق' },
  'dir.loadMore':       { en: 'Load More',          ar: 'تحميل المزيد',     ku: 'زیاتر بار بکە' },
  'dir.grid':           { en: 'Grid',               ar: 'شبكة',             ku: 'تۆڕ' },
  'dir.map':            { en: 'Map',                ar: 'خريطة',            ku: 'نەخشە' },

  // ── Location Filter ────────────────────────────────────────
  'location.all':       { en: 'All Governorates',   ar: 'جميع المحافظات',  ku: 'هەموو پارێزگاکان' },
  'location.select':    { en: 'Select Governorate', ar: 'اختر المحافظة',   ku: 'پارێزگا هەڵبژێرە' },
  'location.reset':     { en: 'Reset Location',     ar: 'إعادة ضبط الموقع', ku: 'سڕینەوەی شوێن' },
  'location.active':    { en: 'Location Active',    ar: 'الموقع مفعل',     ku: 'شوێن چالاکە' },
  'location.exploring': { en: 'Exploring',          ar: 'استكشاف',          ku: 'گەڕان لە' },

  // ── Categories ─────────────────────────────────────────────
  'cat.title':          { en: 'Categories',         ar: 'التصنيفات',        ku: 'پۆلەکان' },
  'cat.selected':       { en: 'selected',           ar: 'محدد',             ku: 'دیاریکراوە' },

  // ── Auth ───────────────────────────────────────────────────
  'auth.login':         { en: 'Log In',             ar: 'تسجيل الدخول',    ku: 'چوونەژوورەوە' },
  'auth.signup':        { en: 'Sign Up',            ar: 'إنشاء حساب',      ku: 'خۆت تۆمار بکە' },
  'auth.logout':        { en: 'Log Out',            ar: 'تسجيل الخروج',    ku: 'چوونەدەرەوە' },
  'auth.email':         { en: 'Email Address',      ar: 'البريد الإلكتروني', ku: 'ناونیشانی ئیمەیڵ' },
  'auth.password':      { en: 'Password',           ar: 'كلمة المرور',     ku: 'وشەی نهێنی' },
  'auth.fullName':      { en: 'Full Name',          ar: 'الاسم الكامل',    ku: 'ناوی تەواو' },
  'auth.forgot':        { en: 'Forgot Password?',   ar: 'نسيت كلمة المرور؟', ku: 'وشەی نهێنیت لەبیرچووە؟' },
  'auth.normalUser':    { en: 'Normal User',        ar: 'مستخدم عادي',     ku: 'بەکارهێنەری ئاسایی' },
  'auth.businessOwner': { en: 'Business Owner',     ar: 'صاحب عمل',        ku: 'خاوەن کار' },
  'auth.orContinue':    { en: 'Or continue with',  ar: 'أو استمر بواسطة', ku: 'یان بەردەوام بە لەڕێگەی' },
  'auth.noAccount':     { en: "Don't have an account?", ar: 'ليس لديك حساب؟', ku: 'هەژمارت نییە؟' },
  'auth.haveAccount':   { en: 'Already have an account?', ar: 'لديك حساب بالفعل؟', ku: 'پێشتر هەژمارت دروستکردووە؟' },
  'auth.googleDisabled': { en: 'Google login not configured', ar: 'تسجيل الدخول بجوجل غير مفعل', ku: 'چوونەژوورەوە بە گووگڵ ڕێکنەخراوە' },

  // ── Business Detail ────────────────────────────────────────
  'biz.verified':       { en: 'Verified',           ar: 'موثق',             ku: 'پشتڕاستکراوە' },
  'biz.claim':          { en: 'Claim this Business', ar: 'المطالبة بهذا العمل', ku: 'داوای ئەم کارە بکە' },
  'biz.claimPending':   { en: 'Claim submitted — pending review', ar: 'تم إرسال الطلب — قيد المراجعة', ku: 'داواکارییەکە نێردرا — چاوەڕوانی پشکنین' },
  'biz.call':           { en: 'Call Business',      ar: 'اتصال بالعمل',    ku: 'پەیوەندی بکە' },
  'biz.website':        { en: 'Visit Website',      ar: 'زيارة الموقع',    ku: 'سەردانی ماڵپەڕ' },
  'biz.share':          { en: 'Share',              ar: 'مشاركة',           ku: 'هاوبەشکردن' },
  'biz.reviews':        { en: 'Customer Reviews',   ar: 'آراء العملاء',     ku: 'پێداچوونەوەی کڕیاران' },

  // ── General ────────────────────────────────────────────────
  'general.loading':    { en: 'Loading...',         ar: 'جاري التحميل...',  ku: 'بار دەکرێت...' },
  'general.error':      { en: 'Something went wrong', ar: 'حدث خطأ ما',    ku: 'هەڵەیەک ڕوویدا' },
  'general.retry':      { en: 'Retry',              ar: 'إعادة المحاولة',   ku: 'هەوڵی دووبارەدەدەینەوە' },
  'general.noResults':  { en: 'No results found',  ar: 'لا توجد نتائج',   ku: 'هیچ ئەنجامێک نەدۆزرایەوە' },
  'general.seeAll':     { en: 'See All',            ar: 'عرض الكل',        ku: 'بینینی هەموو' },
  'general.save':       { en: 'Save',               ar: 'حفظ',              ku: 'پاشەکەوتکردن' },
  'general.cancel':     { en: 'Cancel',             ar: 'إلغاء',            ku: 'پاشگەزبوونەوە' },
};

/** Get a translation value. Falls back to English if the requested language is missing. */
export function t(key: string, lang: Lang): string {
  const entry = ui[key];
  if (!entry) return key;
  return entry[lang] ?? entry['en'] ?? key;
}

/** React hook — reads language from homeStore and returns a bound translator */
export function useT() {
  const { language } = useHomeStore();
  return (key: string) => t(key, language as Lang);
}
