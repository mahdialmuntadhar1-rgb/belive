import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  ChevronDown, 
  Star, 
  MessageSquare, 
  Share2, 
  Heart, 
  MoreHorizontal,
  Search,
  Compass,
  TrendingUp,
  LayoutGrid,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { useHomeStore } from '@/stores/homeStore';
import { CATEGORIES, ICON_MAP } from '@/constants';

// --- Mock Data ---
const GOVERNORATES = [
  { id: 'baghdad', en: 'Baghdad', ar: 'بغداد', ku: 'بەغدا' },
  { id: 'erbil', en: 'Erbil', ar: 'أربيل', ku: 'هەولێر' },
  { id: 'basra', en: 'Basra', ar: 'البصرة', ku: 'بەسرە' },
  { id: 'sulaymaniyah', en: 'Sulaymaniyah', ar: 'السليمانية', ku: 'سلێمانی' },
  { id: 'mosul', en: 'Mosul', ar: 'الموصل', ku: 'مووسڵ' },
  { id: 'najaf', en: 'Najaf', ar: 'النجف', ku: 'نەجەف' },
  { id: 'karbala', en: 'Karbala', ar: 'كربلاء', ku: 'کەربەلا' },
  { id: 'duhok', en: 'Duhok', ar: 'دهوك', ku: 'دهۆک' },
  { id: 'kirkuk', en: 'Kirkuk', ar: 'كركوك', ku: 'کەرکووک' },
  { id: 'nasiriyah', en: 'Nasiriyah', ar: 'الناصرية', ku: 'ناسریە' },
];

const CITIES: Record<string, string[]> = {
  baghdad: ['Mansour', 'Karrada', 'Adhamiya', 'Zayouna', 'Yarmouk'],
  erbil: ['Ankawa', 'Empire World', 'Bakhtiari', 'Dream City', 'Shoresh'],
  basra: ['Al-Ashar', 'Al-Jazaer', 'Al-Zubair', 'Al-Maqal'],
  sulaymaniyah: ['Salim St', 'Sarchinar', 'Bakrajo', 'Raperin'],
};

const MOCK_POSTS = [
  {
    id: '1',
    businessName: 'Al-Mansour Mall',
    content: 'Check out our new winter collection! ❄️ Special discounts for the weekend.',
    image: 'https://images.unsplash.com/photo-1567401723433-998e53f4ebf3?q=80&w=800&auto=format&fit=crop',
    likes: 124,
    comments: 12,
    time: '2h ago',
    isVerified: true
  },
  {
    id: '2',
    businessName: 'Erbil Coffee House',
    content: 'The best V60 in town is waiting for you. ☕️ Open until midnight.',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop',
    likes: 89,
    comments: 5,
    time: '4h ago',
    isVerified: true
  }
];

const MOCK_BUSINESSES = [
  { id: 'b1', name: 'Saj Al-Reef', category: 'dining', rating: 4.8, reviews: 1200, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&fit=crop' },
  { id: 'b2', name: 'Caffe Nero', category: 'cafe', rating: 4.5, reviews: 850, image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=400&fit=crop' },
  { id: 'b3', name: 'The Spot Gym', category: 'gym', rating: 4.9, reviews: 320, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&fit=crop' },
  { id: 'b4', name: 'Royal Hotel', category: 'hotels', rating: 4.2, reviews: 560, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400&fit=crop' },
  { id: 'b5', name: 'Apple Store IQ', category: 'shopping', rating: 4.7, reviews: 2100, image: 'https://images.unsplash.com/photo-1556740734-7f958945130b?q=80&w=400&fit=crop' },
  { id: 'b6', name: 'City Center', category: 'supermarkets', rating: 4.4, reviews: 1500, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&fit=crop' },
];

// --- Sub-components ---

const ChipRow = ({ items, selectedId, onSelect, rows = 2, renderItem }: any) => {
  const chunkedItems = useMemo(() => {
    const perRow = Math.ceil(items.length / rows);
    return Array.from({ length: rows }, (_, i) => items.slice(i * perRow, (i + 1) * perRow));
  }, [items, rows]);

  return (
    <div className="flex flex-col gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
      {chunkedItems.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-2 whitespace-nowrap">
          {row.map((item: any) => renderItem(item))}
        </div>
      ))}
    </div>
  );
};

export default function PrototypeV2() {
  const { language, setLanguage } = useHomeStore();
  const [selectedGov, setSelectedGov] = useState('baghdad');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [showAllCats, setShowAllCats] = useState(false);

  const isRTL = language === 'ar' || language === 'ku';

  const t = {
    heroTitle: { en: 'Find the Best in Iraq', ar: 'ابحث عن الأفضل في العراق', ku: 'باشترینەکان لە عێراق بدۆزەرەوە' },
    heroSub: { en: 'Discover local businesses, reviews, and updates.', ar: 'اكتشف الشركات المحلية والمراجعات والتحديثات.', ku: 'کارە ناوخۆییەکان و پێداچوونەوەکان بدۆزەرەوە.' },
    selectCity: { en: 'Select City', ar: 'اختر المدينة', ku: 'شار هەڵبژێرە' },
    trending: { en: 'Trending in', ar: 'رائج في', ku: 'گەرم لە' },
    featured: { en: 'Featured Categories', ar: 'تصنيفات مميزة', ku: 'پۆلە دیارەکان' },
    seeMore: { en: 'See More', ar: 'عرض المزيد', ku: 'بینینی زیاتر' },
    feed: { en: 'Local Feed', ar: 'آخر الأخبار', ku: 'دوایین هەواڵەکان' },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-[#2CA6A4]/30" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#2CA6A4] rounded-lg flex items-center justify-center text-white font-black">S</div>
          <span className="font-black text-slate-900 tracking-tight">Saku Maku</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')} className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
            {language === 'en' ? 'AR' : 'EN'}
          </button>
          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
            <Search className="w-4 h-4" />
          </div>
        </div>
      </header>

      <main className="pb-20">
        {/* 1. Hero Section */}
        <section className="px-4 py-8 bg-white border-b border-slate-100">
          <div className="relative overflow-hidden rounded-[32px] bg-slate-900 p-8 text-white">
            <div className="absolute inset-0 opacity-40">
              <img src="https://images.unsplash.com/photo-1545459720-aac273a27b3d?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover" alt="Iraq" />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/80 to-transparent" />
            </div>
            <div className="relative z-10 max-w-xs">
              <h1 className="text-3xl font-black poppins-bold leading-tight mb-2">{t.heroTitle[language]}</h1>
              <p className="text-sm text-slate-300 font-medium">{t.heroSub[language]}</p>
            </div>
          </div>
        </section>

        {/* 2. Filter Block (Governorate, City, Category) */}
        <section className="bg-white px-4 py-6 space-y-6 shadow-sm border-b border-slate-100">
          {/* Governorate Chips (2 Rows) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-[#2CA6A4]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Governorate</span>
            </div>
            <ChipRow 
              items={GOVERNORATES}
              selectedId={selectedGov}
              renderItem={(gov: any) => (
                <button
                  key={gov.id}
                  onClick={() => { setSelectedGov(gov.id); setSelectedCity(''); }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                    selectedGov === gov.id 
                      ? 'bg-[#2CA6A4] border-[#2CA6A4] text-white shadow-lg shadow-[#2CA6A4]/20' 
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-[#2CA6A4]/30'
                  }`}
                >
                  {language === 'en' ? gov.en : gov.ar}
                </button>
              )}
            />
          </div>

          {/* City Dropdown */}
          <div className="relative">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full appearance-none bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#2CA6A4] transition-all"
            >
              <option value="">{t.selectCity[language]}</option>
              {CITIES[selectedGov]?.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Category Chips (2 Rows) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <LayoutGrid className="w-4 h-4 text-[#E87A41]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Categories</span>
            </div>
            <ChipRow 
              items={CATEGORIES.slice(0, showAllCats ? undefined : 14)}
              selectedId={selectedCat}
              renderItem={(cat: any) => {
                const Icon = cat.icon;
                const isActive = selectedCat === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCat(isActive ? null : cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                      isActive 
                        ? 'bg-[#E87A41] border-[#E87A41] text-white shadow-lg shadow-[#E87A41]/20' 
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-[#E87A41]/30'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.name[language]}
                  </button>
                );
              }}
            />
          </div>
        </section>

        {/* 3. Trending / Featured Preview */}
        <section className="px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#2CA6A4]" />
              <h2 className="text-lg font-black text-slate-900 poppins-bold">{t.trending[language]} {GOVERNORATES.find(g => g.id === selectedGov)?.en}</h2>
            </div>
            <button className="text-[10px] font-black text-[#2CA6A4] uppercase tracking-widest flex items-center gap-1">
              {t.seeMore[language]} <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {MOCK_BUSINESSES.map(biz => (
              <div key={biz.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 group">
                <div className="aspect-[4/3] relative">
                  <img src={biz.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={biz.name} />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-[10px] font-black text-slate-900">{biz.rating}</span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-xs font-black text-slate-900 truncate">{biz.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">{biz.category}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Social Feed Preview */}
        <section className="px-4 py-8 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-5 h-5 text-[#2CA6A4]" />
            <h2 className="text-lg font-black text-slate-900 poppins-bold">{t.feed[language]}</h2>
          </div>

          <div className="space-y-6">
            {MOCK_POSTS.map(post => (
              <div key={post.id} className="bg-white rounded-[32px] p-4 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-[#2CA6A4] font-black">
                      {post.businessName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <h4 className="text-sm font-black text-slate-900">{post.businessName}</h4>
                        {post.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-[#2CA6A4] fill-[#2CA6A4]/10" />}
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold">{post.time}</p>
                    </div>
                  </div>
                  <MoreHorizontal className="w-5 h-5 text-slate-300" />
                </div>
                
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{post.content}</p>
                
                {post.image && (
                  <div className="rounded-2xl overflow-hidden mb-4">
                    <img src={post.image} className="w-full aspect-video object-cover" alt="Post" />
                  </div>
                )}

                <div className="flex items-center gap-6 pt-2 border-t border-slate-50">
                  <button className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors">
                    <Heart className="w-5 h-5" />
                    <span className="text-xs font-bold">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-slate-400 hover:text-[#2CA6A4] transition-colors">
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-xs font-bold">{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 text-slate-400 hover:text-[#2CA6A4] transition-colors ml-auto">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-3 flex items-center justify-between z-50">
        <button className="flex flex-col items-center gap-1 text-[#2CA6A4]">
          <Compass className="w-6 h-6" />
          <span className="text-[8px] font-black uppercase tracking-widest">Explore</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <MessageSquare className="w-6 h-6" />
          <span className="text-[8px] font-black uppercase tracking-widest">Feed</span>
        </button>
        <div className="w-12 h-12 bg-[#2CA6A4] rounded-2xl -mt-8 shadow-lg shadow-[#2CA6A4]/30 flex items-center justify-center text-white">
          <Search className="w-6 h-6" />
        </div>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <TrendingUp className="w-6 h-6" />
          <span className="text-[8px] font-black uppercase tracking-widest">Trends</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <div className="w-6 h-6 bg-slate-100 rounded-lg" />
          <span className="text-[8px] font-black uppercase tracking-widest">Profile</span>
        </button>
      </nav>
    </div>
  );
}
