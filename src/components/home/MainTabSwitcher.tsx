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
      activeColor: 'bg-[#0F7B6C]',
      activeText: 'text-white'
    },
    {
      id: 'social' as const,
      label: language === 'ar' ? 'آخر التحديثات' : language === 'ku' ? 'نوێترین نوێکارییەکان' : 'Latest Updates',
      sublabel: language === 'ar' ? 'شكو ماكو' : language === 'ku' ? 'چی هەیە چی نیە' : 'Shaku Maku',
      icon: '📱',
      activeColor: 'bg-[#C8A96A]',
      activeText: 'text-[#0F7B6C]'
    }
  ];

  return (
    <div className="w-full">
      <div className="flex bg-white/50 backdrop-blur-xl p-1.5 rounded-[32px] border border-slate-200/50 shadow-xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 relative flex items-center justify-center gap-4 px-6 py-4 rounded-[24px] transition-all duration-500 ${
                isActive 
                  ? `${tab.activeColor} ${tab.activeText} shadow-2xl scale-[1.02]` 
                  : 'text-slate-400 hover:text-[#0F7B6C] hover:bg-white'
              }`}
            >
              <span className="text-xl sm:text-2xl">{tab.icon}</span>
              <div className="flex flex-col items-start text-left">
                <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1.5 ${isActive ? 'opacity-70' : 'text-slate-400'}`}>
                  {tab.sublabel}
                </span>
                <span className="text-[11px] sm:text-base font-black uppercase tracking-tight leading-none">
                  {tab.label}
                </span>
              </div>
              {isActive && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-current rounded-full opacity-30"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
