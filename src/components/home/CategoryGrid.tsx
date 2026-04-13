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
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-6">
        <AnimatePresence mode="popLayout">
          {categoriesToDisplay.map((cat, idx) => {
            const isActive = selectedCategory === cat.id;
            const Icon = cat.icon;
            
            return (
              <motion.button
                key={cat.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -12, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryClick(cat.id)}
                className={`group relative flex flex-col items-center justify-center aspect-square rounded-[32px] overflow-hidden transition-all duration-500 ${
                  isActive 
                    ? 'shadow-[0_20px_50px_rgba(15,123,108,0.3)] ring-4 ring-[#0F7B6C]' 
                    : 'shadow-xl hover:shadow-2xl'
                }`}
              >
                {/* Background Image with Parallax-like effect */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={cat.image || `https://picsum.photos/seed/${cat.id}/400/400`}
                    alt={cat.name[language]}
                    className={`w-full h-full object-cover transition-all duration-1000 ${
                      isActive ? 'scale-125 blur-[1px]' : 'group-hover:scale-110'
                    }`}
                    referrerPolicy="no-referrer"
                  />
                  {/* Glossy Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-500 ${
                    isActive ? 'from-[#0F7B6C]/90 via-[#0F7B6C]/40 to-transparent opacity-100' : 'from-black/60 via-black/20 to-transparent opacity-40 group-hover:opacity-70'
                  }`} />
                </div>

                {/* Content Layered */}
                <div className="relative z-10 flex flex-col items-center justify-center p-2 sm:p-4 text-center h-full w-full">
                  <motion.div 
                    animate={isActive ? { y: [0, -5, 0] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`w-10 h-10 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-2 sm:mb-4 transition-all duration-500 ${
                      isActive ? 'bg-[#C8A96A] text-white shadow-lg' : 'bg-white/10 backdrop-blur-md text-white group-hover:bg-[#C8A96A]'
                    }`}
                  >
                    <Icon className="w-5 h-5 sm:w-8 sm:h-8" strokeWidth={2.5} />
                  </motion.div>

                  <div className="px-2 py-1 rounded-lg">
                    <h3 className={`text-[10px] sm:text-sm font-black uppercase tracking-tighter text-white drop-shadow-md transition-all duration-300 ${
                      isActive ? 'scale-110' : 'group-hover:scale-105'
                    }`}>
                      {cat.name[language]}
                    </h3>
                  </div>
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
