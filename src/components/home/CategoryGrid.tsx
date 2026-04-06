import { useState } from 'react';
import { useHomeStore } from '@/stores/homeStore';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';
import { ICON_MAP, CATEGORIES } from '@/constants';

export default function CategoryGrid() {
  const { selectedCategory, setCategory, language } = useHomeStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const initialItems = 5; // Show 5 initially as in the image's top row
  const visibleCategories = isExpanded ? CATEGORIES : CATEGORIES.slice(0, 10); // Show 10 (2 rows) initially? Or just follow the image.

  // The image shows 20 categories in a 5x4 grid.
  // Let's show 10 initially and then expand to 20.
  const categoriesToDisplay = isExpanded ? CATEGORIES : CATEGORIES.slice(0, 10);

  const handleCategoryClick = (catId: string) => {
    const isActive = selectedCategory === catId;
    setCategory(isActive ? null : catId);
    
    // Scroll to business grid
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
            {selectedCategory && (
              <span className="ml-2 text-primary text-sm font-bold">
                ({language === 'ar' ? 'تم اختيار ١' : language === 'ku' ? '١ هەڵبژێردرا' : '1 selected'})
              </span>
            )}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <AnimatePresence mode="popLayout">
          {categoriesToDisplay.map((cat) => {
            const isActive = selectedCategory === cat.id;
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
                className={`group relative aspect-[4/3] flex flex-col items-center justify-center p-4 rounded-[20px] border-2 transition-all duration-500 ${
                  isActive 
                    ? 'bg-[#2D364D] border-primary shadow-[0_0_30px_rgba(255,159,28,0.3)] z-10' 
                    : 'bg-[#1E293B] border-white/5 hover:border-white/20'
                }`}
              >
                {isActive && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-3 h-3 text-bg-dark stroke-[4]" />
                  </div>
                )}

                {cat.isHot && (
                  <div className="absolute top-2 left-2 bg-primary text-bg-dark text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg">
                    Hot
                  </div>
                )}

                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all duration-500 ${
                  isActive ? 'bg-primary text-bg-dark' : 'bg-primary/10 text-primary group-hover:scale-110'
                }`}>
                  <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>

                <div className="text-center w-full">
                  <h3 className={`text-[10px] font-black uppercase tracking-widest mb-1 transition-colors duration-300 line-clamp-1 ${
                    isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                  }`}>
                    {cat.name[language]}
                  </h3>
                  <p className={`text-[9px] font-bold uppercase tracking-tighter transition-colors duration-300 ${
                    isActive ? 'text-primary' : 'text-primary/60'
                  }`}>
                    {cat.types} Types
                  </p>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {CATEGORIES.length > 10 && (
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
