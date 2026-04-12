import React from 'react';
import { motion } from 'motion/react';
import { useHomeStore } from '@/stores/homeStore';

interface MainTabSwitcherProps {
  activeTab: 'guide' | 'social';
  onTabChange: (tab: 'guide' | 'social') => void;
}

export default function MainTabSwitcher({ activeTab, onTabChange }: MainTabSwitcherProps) {
  const { language } = useHomeStore();

  return (
    <div className="sticky top-[60px] sm:top-[73px] z-50 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-premium">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex justify-center items-center h-16 sm:h-24 gap-2 sm:gap-16">
          <button 
            onClick={() => onTabChange('social')}
            className={`group relative flex items-center gap-3 sm:gap-6 px-4 sm:px-12 py-3 sm:py-8 rounded-2xl sm:rounded-[40px] transition-all duration-700 ${
              activeTab === 'social' 
                ? 'bg-primary text-white shadow-xl sm:shadow-[0_30px_60px_-12px_rgba(255,159,28,0.4)] scale-105 sm:scale-110 z-10' 
                : 'text-slate-400 hover:text-primary hover:bg-slate-50 scale-95'
            }`}
          >
            <div className={`w-8 h-8 sm:w-16 sm:h-16 rounded-xl sm:rounded-3xl flex items-center justify-center text-xl sm:text-4xl transition-all duration-700 ${activeTab === 'social' ? 'bg-white/20 rotate-[15deg] scale-110' : 'bg-slate-100 group-hover:rotate-12'}`}>
              📱
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-[7px] sm:text-[11px] font-black uppercase tracking-[0.1em] sm:tracking-[0.3em] opacity-60 leading-none mb-1 sm:mb-2">
                {language === 'ar' ? 'آخر الأخبار' : language === 'ku' ? 'دوایین هەواڵ' : 'Social Feed'}
              </span>
              <div className="flex flex-col items-start">
                <span className="text-sm sm:text-3xl font-black uppercase tracking-tight poppins-bold leading-tight">
                  {language === 'ar' ? 'شكو ماكو' : language === 'ku' ? 'چی هەیە چی نیە' : 'Shaku Maku'}
                </span>
                <span className="text-[6px] sm:text-xs font-bold opacity-70 leading-tight mt-1 max-w-[100px] sm:max-w-xs">
                  {language === 'ar' 
                    ? 'تحديثات مباشرة، عروض، ومنشورات من الشركات المحلية' 
                    : language === 'ku'
                    ? 'نوێکارییە ڕاستەوخۆکان، ئۆفەرەکان و پۆستەکانی کۆمپانیا ناوخۆییەکان'
                    : 'Live updates, offers, and posts from local businesses'}
                </span>
              </div>
            </div>
          </button>

          <button 
            onClick={() => onTabChange('guide')}
            className={`group relative flex items-center gap-3 sm:gap-6 px-4 sm:px-12 py-3 sm:py-8 rounded-2xl sm:rounded-[40px] transition-all duration-700 ${
              activeTab === 'guide' 
                ? 'bg-accent text-bg-dark shadow-xl sm:shadow-[0_30px_60px_-12px_rgba(245,158,11,0.4)] scale-105 sm:scale-110 z-10' 
                : 'text-slate-400 hover:text-accent hover:bg-slate-50 scale-95'
            }`}
          >
            <div className={`w-8 h-8 sm:w-16 sm:h-16 rounded-xl sm:rounded-3xl flex items-center justify-center text-xl sm:text-4xl transition-all duration-700 ${activeTab === 'guide' ? 'bg-white/20 -rotate-[15deg] scale-110' : 'bg-slate-100 group-hover:-rotate-12'}`}>
              🏙️
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="text-[7px] sm:text-[11px] font-black uppercase tracking-[0.1em] sm:tracking-[0.3em] opacity-60 leading-none mb-1 sm:mb-2">
                {language === 'ar' ? 'الدليل' : language === 'ku' ? 'ڕێبەر' : 'Directory'}
              </span>
              <div className="flex flex-col items-start">
                <span className="text-sm sm:text-3xl font-black uppercase tracking-tight poppins-bold leading-tight">
                  {language === 'ar' ? 'مدينتي' : language === 'ku' ? 'شارەکەم' : 'My City'}
                </span>
                <span className="text-[6px] sm:text-xs font-bold opacity-70 leading-tight mt-1 max-w-[100px] sm:max-w-xs">
                  {language === 'ar' 
                    ? 'اكتشف الشركات حسب المدينة والفئة' 
                    : language === 'ku'
                    ? 'کۆمپانیاکان بەپێی شار و پۆل بدۆزەرەوە'
                    : 'Discover businesses by city and category'}
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
