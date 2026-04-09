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
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategoryClick(cat.id)}
                className={`group relative flex flex-col items-center justify-center p-6 rounded-3xl border transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary border-primary shadow-lg shadow-primary/20' 
                    : 'bg-white border-slate-100 hover:border-accent hover:shadow-md'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400 group-hover:text-accent'
                }`}>
                  <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>

                <h3 className={`text-[9px] font-black uppercase tracking-widest text-center px-1 transition-colors duration-300 ${
                  isActive ? 'text-white' : 'text-slate-500 group-hover:text-primary'
                }`}>
                  {cat.name[language]}
                </h3>
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
