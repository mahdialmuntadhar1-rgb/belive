import React from 'react';
import { motion } from 'motion/react';
import { useHomeStore } from '@/stores/homeStore';
import { CATEGORIES } from '@/constants';

export default function StorySection() {
  const { language, setCategory, selectedCategory } = useHomeStore();

  const handleStoryClick = (catId: string) => {
    setCategory(catId);
    const businessGrid = document.getElementById('business-grid');
    if (businessGrid) {
      businessGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full py-12 overflow-hidden bg-white/50 backdrop-blur-sm border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-8 overflow-x-auto pb-6 scrollbar-hide no-scrollbar snap-x snap-mandatory">
          {CATEGORIES.map((cat, index) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, scale: 0.5, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: index * 0.05, type: 'spring', stiffness: 260, damping: 20 }}
                onClick={() => handleStoryClick(cat.id)}
                className="flex flex-col items-center gap-3 min-w-[100px] group snap-center"
              >
                <div className={`relative p-1.5 rounded-full border-2 transition-all duration-700 ${
                  isActive 
                    ? 'border-primary scale-110 shadow-[0_15px_30px_-5px_rgba(255,159,28,0.4)] rotate-6' 
                    : 'border-slate-200 group-hover:border-primary/50 group-hover:rotate-[-6deg]'
                }`}>
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 relative shadow-inner">
                    <img 
                      src={cat.image} 
                      alt="" 
                      className={`w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125 ${isActive ? 'scale-125 blur-[1px]' : ''}`}
                      referrerPolicy="no-referrer"
                    />
                    <div className={`absolute inset-0 flex items-center justify-center bg-bg-dark/30 group-hover:bg-bg-dark/10 transition-colors duration-500`}>
                      <div className={`w-10 h-10 rounded-xl glass flex items-center justify-center border border-white/20 transition-all duration-700 ${isActive ? 'scale-110 bg-primary/20' : 'group-hover:scale-110'}`}>
                        <Icon className={`w-6 h-6 text-white drop-shadow-2xl transition-transform duration-500 ${isActive ? 'scale-110' : ''}`} />
                      </div>
                    </div>
                  </div>
                  
                  {isActive && (
                    <motion.div 
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-white shadow-lg"
                    />
                  )}
                </div>
                
                <div className="flex flex-col items-center">
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-center transition-colors duration-300 ${
                    isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-main'
                  }`}>
                    {cat.name[language].split(' ')[0]}
                  </span>
                  <div className={`h-1 w-0 bg-primary rounded-full mt-1 transition-all duration-500 ${isActive ? 'w-4' : 'group-hover:w-2'}`} />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
