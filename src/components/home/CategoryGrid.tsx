import { useState } from 'react';
import { useHomeStore } from '@/stores/homeStore';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES } from '@/constants';

export default function CategoryGrid() {
  const { language } = useHomeStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const initialItems = 6;
  const categoriesToDisplay = isExpanded ? CATEGORIES : CATEGORIES.slice(0, initialItems);

  // LAUNCH MODE: Category click disabled - visual only
  // This prevents category selection from affecting the feed
  const handleCategoryClick = (_catId: string) => {
    // No-op: categories are visual-only for launch
    // Scroll to business grid for visual feedback only
    const businessGrid = document.getElementById('business-grid');
    if (businessGrid) {
      businessGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full mb-12 bg-[#1A2238] p-4 sm:p-8 rounded-[32px] border border-white/5 shadow-2xl">
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-bg-dark rotate-45" />
          </div>
          <h2 className="text-lg font-black text-white poppins-bold uppercase tracking-tight">
            {language === 'ar' ? 'التصنيفات' : language === 'ku' ? 'پۆلەکان' : 'Categories'}
            {/* LAUNCH MODE: Selection indicator disabled */}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        <AnimatePresence mode="popLayout">
          {categoriesToDisplay.map((cat) => {
            const Icon = cat.icon;
            
            return (
              <motion.button
                key={cat.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryClick(cat.id)}
                className={`group relative aspect-square flex flex-col items-center justify-center p-2 rounded-[24px] overflow-hidden border-2 transition-all duration-500 cursor-default border-white/5 hover:border-white/20`}
              >
                {/* Background Image (Blurred) */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={(cat as any).image} 
                    alt="" 
                    className={`w-full h-full object-cover transition-all duration-700 scale-100 blur-[4px] opacity-40 group-hover:opacity-60 group-hover:blur-[2px]`}
                  />
                  <div className={`absolute inset-0 transition-colors duration-500 bg-bg-dark/60 group-hover:bg-bg-dark/40`} />
                </div>

                <div className="relative z-10 flex flex-col items-center">

                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-all duration-500 bg-white/10 text-white group-hover:scale-110`}>
                    <Icon className="w-5 h-5" strokeWidth={2.5} />
                  </div>

                  <h3 className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-center px-1 transition-colors duration-300 line-clamp-2 text-white group-hover:text-primary`}>
                    {cat.name[language]}
                  </h3>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {CATEGORIES.length > 6 && (
        <div className="mt-10 text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-10 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all hover:scale-105 active:scale-95"
          >
            {isExpanded 
              ? (language === 'ar' ? 'عرض أقل' : language === 'ku' ? 'بینینی کەمتر' : 'Show Less') 
              : (language === 'ar' ? 'عرض المزيد' : language === 'ku' ? 'بینینی زیاتر' : 'Load More Categories')
            }
          </button>
        </div>
      )}
    </div>
  );
}
