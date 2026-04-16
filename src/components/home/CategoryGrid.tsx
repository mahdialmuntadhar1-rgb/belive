import { useState } from 'react';
import { useHomeStore } from '@/stores/homeStore';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Sparkles, RefreshCw, TrendingUp } from 'lucide-react';
import { ICON_MAP, CATEGORIES } from '@/constants';

export default function CategoryGrid() {
  const { selectedCategory, setCategory, language } = useHomeStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const initialItems = 9;
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
    <div className="w-full mb-16">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        <AnimatePresence mode="popLayout">
          {categoriesToDisplay.map((cat, idx) => {
            const isActive = selectedCategory === cat.id;
            const Icon = cat.icon;
            // Create visual rhythm by highlighting every 3rd or 4th item, or specific ones
            const isHighlighted = idx % 4 === 0 || cat.id === 'dining' || cat.id === 'events';
            
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ 
                  delay: idx * 0.03,
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategoryClick(cat.id)}
                className={`group relative flex flex-col items-center justify-center aspect-[4/5] rounded-[2.5rem] overflow-hidden transition-all duration-500 border ${
                  isActive 
                    ? 'border-[#0F7B6C] shadow-[0_20px_50px_rgba(15,123,108,0.25)]' 
                    : isHighlighted 
                      ? 'border-white/20 shadow-[0_15px_35px_rgba(200,169,106,0.15)]'
                      : 'border-white/10 shadow-xl hover:shadow-2xl'
                } bg-white`}
              >
                {/* Background Image with sophisticated overlays */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={cat.image || `https://picsum.photos/seed/${cat.id}/600/800`}
                    alt={cat.name[language]}
                    className={`w-full h-full object-cover transition-all duration-1000 ${
                      isActive ? 'scale-110 blur-[2px]' : 'group-hover:scale-110'
                    }`}
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Multi-layered Gradients for depth */}
                  <div className={`absolute inset-0 transition-opacity duration-700 ${
                    isActive 
                      ? 'bg-gradient-to-b from-[#0F7B6C]/80 via-[#0F7B6C]/40 to-[#0F7B6C]/90 opacity-100' 
                      : 'bg-gradient-to-b from-black/20 via-black/40 to-black/80 opacity-60 group-hover:opacity-80'
                  }`} />
                  
                  {/* Highlight Glow for rhythm */}
                  {isHighlighted && !isActive && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#C8A96A]/20 to-transparent opacity-50" />
                  )}
                </div>

                {/* Glassmorphism Border Effect */}
                <div className="absolute inset-0 border-[0.5px] border-white/20 rounded-[2.5rem] z-10 pointer-events-none" />

                {/* Content Layered */}
                <div className="relative z-20 flex flex-col items-center justify-end p-4 sm:p-6 text-center h-full w-full">
                  {/* Icon Container with premium styling */}
                  <motion.div 
                    animate={isActive ? { y: [0, -4, 0] } : {}}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-[1.5rem] flex items-center justify-center mb-4 transition-all duration-500 ${
                      isActive 
                        ? 'bg-[#C8A96A] text-white shadow-[0_10px_20px_rgba(200,169,106,0.4)]' 
                        : isHighlighted
                          ? 'bg-white/20 backdrop-blur-xl text-white border border-white/30 shadow-lg group-hover:bg-[#C8A96A]'
                          : 'bg-white/10 backdrop-blur-md text-white border border-white/10 group-hover:bg-[#C8A96A]'
                    }`}
                  >
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={1.5} />
                  </motion.div>

                  <div className="space-y-1">
                    <h3 className={`text-xs sm:text-sm font-black tracking-tight text-white drop-shadow-lg transition-all duration-300 ${
                      isActive ? 'scale-105' : 'group-hover:scale-105'
                    } ${language === 'ar' ? 'font-arabic' : 'font-sans uppercase'}`}>
                      {cat.name[language]}
                    </h3>
                    
                    {/* Subtle count or subtitle */}
                    <div className={`h-1 w-8 mx-auto rounded-full transition-all duration-500 ${
                      isActive ? 'bg-[#C8A96A] w-12' : 'bg-white/30 group-hover:bg-[#C8A96A] group-hover:w-12'
                    }`} />
                  </div>
                </div>

                {/* Premium Shine Effect on Hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
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
