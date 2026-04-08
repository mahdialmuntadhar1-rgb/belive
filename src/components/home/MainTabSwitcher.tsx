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
    <div className="sticky top-[73px] z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 flex justify-center">
        <div className="flex gap-8">
          <button 
            onClick={() => onTabChange('guide')}
            className={`py-4 text-[11px] font-black uppercase tracking-[0.2em] relative transition-colors flex items-center gap-2 ${activeTab === 'guide' ? 'text-accent' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <span className="text-lg">🏙️</span>
            {language === 'ar' ? 'مدينتي' : language === 'ku' ? 'شارەکەم' : 'My City'}
            {activeTab === 'guide' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
          <button 
            onClick={() => onTabChange('social')}
            className={`py-4 text-[11px] font-black uppercase tracking-[0.2em] relative transition-colors flex items-center gap-2 ${activeTab === 'social' ? 'text-accent' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <span className="text-lg">📱</span>
            {language === 'ar' ? 'شكو ماكو' : language === 'ku' ? 'شکو ماکۆ' : 'Shaku Maku'}
            {activeTab === 'social' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
