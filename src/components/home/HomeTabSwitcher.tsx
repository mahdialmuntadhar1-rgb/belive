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

  return (
    <div className="max-w-3xl mx-auto pt-10 pb-8 px-1">
      <div className="grid grid-cols-2 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-lg shadow-slate-100/80">
        {(['social', 'explore'] as const).map((tab) => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => onChange(tab)}
              className={`relative py-3 sm:py-3.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-[0.18em] transition-colors duration-300 ${
                isActive ? 'text-bg-dark' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="home-tab-active-pill"
                  className="absolute inset-0 bg-primary/30 border border-primary/40 rounded-xl"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">{labels[tab][language]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
