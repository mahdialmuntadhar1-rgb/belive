import { City } from './types';

export const COLORS = {
  gold: '#d4af37',
  darkNavy: '#0a0e1a',
  navyMid: '#0f1628',
  cream: '#e8dcc8',
};

export const CITIES: City[] = [
  {
    id: 'sulaymaniyah',
    name: { en: 'Sulaymaniyah', ar: 'السليمانية', ku: 'سلێمانی' },
    governorate: { en: 'Sulaymaniyah', ar: 'السليمانية', ku: 'سلێمانی' },
    icon: '🏙',
  },
  {
    id: 'erbil',
    name: { en: 'Erbil', ar: 'أربيل', ku: 'هەولێر' },
    governorate: { en: 'Erbil', ar: 'أربيل', ku: 'هەولێر' },
    icon: '🌆',
  },
  {
    id: 'baghdad',
    name: { en: 'Baghdad', ar: 'بغداد', ku: 'بەغدا' },
    governorate: { en: 'Baghdad', ar: 'بغداد', ku: 'بەغدا' },
    icon: '🌃',
  },
  {
    id: 'basra',
    name: { en: 'Basra', ar: 'البصرة', ku: 'بەسرە' },
    governorate: { en: 'Basra', ar: 'البصرة', ku: 'بەسرە' },
    icon: '🌊',
  },
  {
    id: 'duhok',
    name: { en: 'Duhok', ar: 'دهوك', ku: 'دهۆک' },
    governorate: { en: 'Duhok', ar: 'دهوك', ku: 'دهۆک' },
    icon: '🏔',
  },
  {
    id: 'kirkuk',
    name: { en: 'Kirkuk', ar: 'كركوك', ku: 'کەرکووک' },
    governorate: { en: 'Kirkuk', ar: 'كركوك', ku: 'کەرکووک' },
    icon: '⛽',
  },
  {
    id: 'najaf',
    name: { en: 'Najaf', ar: 'النجف', ku: 'نەجەف' },
    governorate: { en: 'Najaf', ar: 'النجف', ku: 'نەجەف' },
    icon: '🕌',
  },
  {
    id: 'karbala',
    name: { en: 'Karbala', ar: 'كربلاء', ku: 'کەربەلا' },
    governorate: { en: 'Karbala', ar: 'كربلاء', ku: 'کەربەلا' },
    icon: '🕍',
  },
  {
    id: 'mosul',
    name: { en: 'Mosul', ar: 'الموصل', ku: 'مووسڵ' },
    governorate: { en: 'Nineveh', ar: 'نينوى', ku: 'نەینەوا' },
    icon: '🏛',
  },
  {
    id: 'anbar',
    name: { en: 'Anbar', ar: 'الأنبار', ku: 'ئەنبار' },
    governorate: { en: 'Anbar', ar: 'الأنبار', ku: 'ئەنبار' },
    icon: '🌴',
  },
];
