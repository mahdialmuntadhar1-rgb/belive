import { motion } from 'motion/react';
import { useHomeStore } from '@/stores/homeStore';

export type HomeTab = 'social' | 'explore';

interface HomeTabSwitcherProps {
  activeTab: HomeTab;
  onChange: (tab: HomeTab) => void;
}

export default function HomeTabSwitcher({ activeTab, onChange }: HomeTabSwitcherProps) {
  const { language } = useHomeStore();

  const labels = {
    social: { en: 'Shaku Maku', ar: 'شكو ماكو؟', ku: 'شەکو ماکو' },
    explore: { en: 'My City', ar: 'مدينتي', ku: 'شارەکەم' }
  } as const;

  const subtitles = {
    social: {
      en: 'Social feed from businesses across Iraq',
      ar: 'الشريط الاجتماعي من الشركات في جميع أنحاء العراق',
      ku: 'فیدی کۆمەڵایەتی لە کارەکان لە سەرانسەری عێراق'
    },
    explore: {
      en: 'Discover local businesses by category',
      ar: 'اكتشف الشركات المحلية حسب الفئة',
      ku: 'کارە ناوخۆییەکان بەپێی پۆل بدۆزەرەوە'
    }
  } as const;

  return (
    <div id="tab-section" className="max-w-3xl mx-auto pt-8 pb-6 px-4">
      {/* Tab Buttons */}
      <div className="grid grid-cols-2 bg-white border border-slate-200 rounded-[24px] p-2 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.12)]">
        {(['social', 'explore'] as const).map((tab) => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => onChange(tab)}
              className={`relative py-4 sm:py-5 rounded-[18px] text-[12px] sm:text-sm font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                isActive 
                  ? 'text-bg-dark shadow-[0_4px_20px_-4px_rgba(255,159,28,0.4)]' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="home-tab-active-pill"
                  className="absolute inset-0 bg-gradient-to-r from-primary/40 to-accent/40 rounded-[18px] border-2 border-primary/50"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex flex-col items-center gap-1">
                {labels[tab][language]}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Tab Subtitle */}
      <motion.p 
        key={activeTab}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-[12px] text-slate-500 font-bold mt-4 tracking-wide"
      >
        {subtitles[activeTab][language]}
      </motion.p>
    </div>
  );
}
