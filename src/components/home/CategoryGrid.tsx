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
    
    // Scroll to business grid
    const businessGrid = document.getElementById('business-grid');
    if (businessGrid) {
      businessGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full mb-16 bg-bg-dark p-6 sm:p-12 rounded-[48px] border border-white/5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] relative overflow-hidden group/grid">
      {/* Background Decorative Element */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[100px] group-hover/grid:bg-primary/10 transition-colors duration-1000" />
      
      <div className="flex items-center justify-between mb-12 px-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 group-hover/grid:rotate-12 transition-transform duration-700">
            <Sparkles className="w-5 h-5 text-bg-dark" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white poppins-bold uppercase tracking-tighter">
              {language === 'ar' ? 'التصنيفات المميزة' : language === 'ku' ? 'پۆلە دیارەکان' : 'Premium Categories'}
            </h2>
            <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] mt-1">
              {language === 'ar' ? 'تصفح حسب النوع' : language === 'ku' ? 'گەڕان بەپێی جۆر' : 'Browse by Industry'}
            </p>
          </div>
        </div>
        
        {selectedCategory && (
          <button 
            onClick={() => setCategory(null)}
            className="px-5 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[9px] font-black rounded-xl border border-white/5 transition-all uppercase tracking-widest flex items-center gap-2"
          >
            <RefreshCw className="w-3 h-3" />
            {language === 'ar' ? 'إعادة تعيين' : language === 'ku' ? 'پاککردنەوە' : 'Reset Filter'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
        <AnimatePresence mode="popLayout">
          {categoriesToDisplay.map((cat, idx) => {
            const isActive = selectedCategory === cat.id;
            const Icon = cat.icon;
            
            return (
              <motion.button
                key={cat.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryClick(cat.id)}
                className={`group relative aspect-[4/5] flex flex-col items-center justify-center p-4 rounded-[32px] overflow-hidden border-2 transition-all duration-700 ${
                  isActive 
                    ? 'border-primary shadow-[0_20px_40px_-10px_rgba(255,159,28,0.4)] z-10' 
                    : 'border-white/5 hover:border-white/20'
                }`}
              >
                {/* Background Image (Blurred) */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={(cat as any).image} 
                    alt="" 
                    className={`w-full h-full object-cover transition-all duration-1000 ${
                      isActive ? 'scale-125 blur-[1px]' : 'scale-100 blur-[6px] opacity-30 group-hover:opacity-60 group-hover:blur-[2px] group-hover:scale-110'
                    }`}
                  />
                  <div className={`absolute inset-0 transition-colors duration-700 ${
                    isActive ? 'bg-bg-dark/40' : 'bg-bg-dark/70 group-hover:bg-bg-dark/40'
                  }`} />
                </div>

                <div className="relative z-10 flex flex-col items-center w-full">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-700 shadow-2xl ${
                    isActive ? 'bg-primary text-bg-dark scale-110 rotate-3' : 'bg-white/10 text-white group-hover:bg-white/20 group-hover:scale-110 group-hover:-rotate-3'
                  }`}>
                    <Icon className="w-7 h-7" strokeWidth={2.5} />
                  </div>

                  <h3 className={`text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-center px-2 transition-colors duration-500 leading-tight ${
                    isActive ? 'text-white' : 'text-white/60 group-hover:text-white'
                  }`}>
                    {cat.name[language]}
                  </h3>
                  
                  {isActive && (
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '2rem' }}
                      className="h-1 bg-primary rounded-full mt-3"
                    />
                  )}
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {CATEGORIES.length > 6 && (
        <div className="mt-12 text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-12 py-5 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[11px] font-black uppercase tracking-[0.25em] rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl flex items-center gap-3 mx-auto group/more"
          >
            {isExpanded 
              ? <><RefreshCw className="w-4 h-4 group-hover/more:rotate-180 transition-transform duration-700" /> {language === 'ar' ? 'عرض أقل' : language === 'ku' ? 'بینینی کەمتر' : 'Show Less'}</>
              : <><TrendingUp className="w-4 h-4 group-hover/more:translate-y-[-2px] transition-transform" /> {language === 'ar' ? 'عرض المزيد' : language === 'ku' ? 'بینینی زیاتر' : 'Explore All Categories'}</>
            }
          </button>
        </div>
      )}
    </div>
  );
}
