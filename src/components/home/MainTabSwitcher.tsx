import React from 'react';
import { motion } from 'motion/react';
import { useHomeStore } from '@/stores/homeStore';

interface MainTabSwitcherProps {
  activeTab: 'guide' | 'social';
  onTabChange: (tab: 'guide' | 'social') => void;
}

export default function MainTabSwitcher({ activeTab, onTabChange }: MainTabSwitcherProps) {
  const { language } = useHomeStore();

  const tabs = [
    {
      id: 'guide' as const,
      label: language === 'ar' ? 'اكتشف الشركات' : language === 'ku' ? 'کۆمپانیاکان بدۆزەرەوە' : 'Discover Businesses',
      sublabel: language === 'ar' ? 'دليل المدن' : language === 'ku' ? 'ڕێبەری شارەکان' : 'City Directory',
      icon: '🏙️',
      activeColor: 'bg-primary',
      activeText: 'text-white'
    },
    {
      id: 'social' as const,
      label: language === 'ar' ? 'آخر التحديثات' : language === 'ku' ? 'نوێترین نوێکارییەکان' : 'Latest Updates',
      sublabel: language === 'ar' ? 'شكو ماكو' : language === 'ku' ? 'چی هەیە چی نیە' : 'Shaku Maku',
      icon: '📱',
      activeColor: 'bg-accent',
      activeText: 'text-bg-dark'
    }
  ];

  return (
    <div className="sticky top-[60px] sm:top-[73px] z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-center items-center h-16 sm:h-20 gap-2 sm:gap-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 relative flex items-center justify-center gap-3 px-4 py-2 sm:py-3 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? `${tab.activeColor} ${tab.activeText} shadow-lg scale-[1.02]` 
                    : 'bg-slate-50 text-slate-400 hover:bg-white hover:text-primary'
                }`}
              >
                <span className="text-lg sm:text-xl">{tab.icon}</span>
                <div className="flex flex-col items-start text-left">
                  <span className={`text-[7px] sm:text-[9px] font-black uppercase tracking-widest leading-none mb-1 ${isActive ? 'opacity-70' : 'text-slate-400'}`}>
                    {tab.sublabel}
                  </span>
                  <span className="text-[10px] sm:text-sm font-black uppercase tracking-tight leading-none">
                    {tab.label}
                  </span>
                </div>
                {isActive && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-current rounded-full opacity-50"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
