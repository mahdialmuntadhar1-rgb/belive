import { useState } from 'react';
import { useHomeStore } from '@/stores/homeStore';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Sparkles, RefreshCw, TrendingUp } from 'lucide-react';
import { ICON_MAP, CATEGORIES } from '@/constants';

export default function CategoryGrid() {
  const { selectedCategory, setCategory, language } = useHomeStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const initialItems = 6;
  const categoriesToDisplay = isExpanded ? CATEGORIES : CATEGORIES.slice(0, initialItems);

  const handleCategoryClick = (catId: string) => {
    const isActive = selectedCategory === catId;
    setCategory(isActive ? null : catId);
    
    // Scroll to category section
    const section = document.getElementById(`category-section-${catId}`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full mb-12">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        <AnimatePresence mode="popLayout">
          {categoriesToDisplay.map((cat, idx) => {
            const isActive = selectedCategory === cat.id;
            const Icon = cat.icon;
            
            return (
              <motion.button
                key={cat.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.03 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategoryClick(cat.id)}
                className={`group relative flex flex-col items-center justify-center aspect-square rounded-[32px] overflow-hidden border-2 transition-all duration-500 ${
                  isActive 
                    ? 'border-accent shadow-2xl shadow-accent/20' 
                    : 'border-white shadow-card hover:border-slate-200'
                }`}
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={cat.image || `https://picsum.photos/seed/${cat.id}/400/400`}
                    alt={cat.name[language]}
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      isActive ? 'scale-110 blur-[2px] brightness-50' : 'group-hover:scale-110 brightness-[0.85] group-hover:brightness-75'
                    }`}
                    referrerPolicy="no-referrer"
                  />
                  {/* Overlay Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-500 ${
                    isActive ? 'from-primary/90 via-primary/40 to-transparent opacity-100' : 'from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90'
                  }`} />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center p-4 text-center h-full w-full">
                  <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-3 transition-all duration-500 ${
                    isActive ? 'bg-accent text-bg-dark scale-110 rotate-12 shadow-lg' : 'bg-white/20 backdrop-blur-md text-white group-hover:bg-accent group-hover:text-bg-dark group-hover:rotate-12'
                  }`}>
                    <Icon className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={2.5} />
                  </div>

                  <h3 className={`text-[10px] sm:text-[12px] font-black uppercase tracking-widest text-white drop-shadow-md transition-all duration-300 ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`}>
                    {cat.name[language]}
                  </h3>
                  
                  {isActive && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(245,158,11,1)]"
                    />
                  )}
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {CATEGORIES.length > 6 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 group"
          >
            {isExpanded 
              ? <><RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" /> {language === 'ar' ? 'عرض أقل' : language === 'ku' ? 'بینینی کەمتر' : 'Show Less'}</>
              : <><TrendingUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" /> {language === 'ar' ? 'عرض المزيد' : language === 'ku' ? 'بینینی زیاتر' : 'Load More Categories'}</>
            }
          </button>
        </div>
      )}
    </div>
  );
}
