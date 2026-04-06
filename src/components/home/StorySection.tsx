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
    <div className="w-full py-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
          {CATEGORIES.map((cat, index) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, scale: 0.5, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleStoryClick(cat.id)}
                className="flex flex-col items-center gap-2 min-w-[80px] group"
              >
                <div className={`relative p-1 rounded-full border-2 transition-all duration-500 ${
                  isActive ? 'border-primary scale-110 shadow-[0_0_15px_rgba(255,159,28,0.4)]' : 'border-slate-200 group-hover:border-primary/50'
                }`}>
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 relative">
                    <img 
                      src={cat.image} 
                      alt="" 
                      className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}
                    />
                    <div className={`absolute inset-0 flex items-center justify-center bg-bg-dark/20 group-hover:bg-bg-dark/10 transition-colors`}>
                      <Icon className={`w-6 h-6 text-white drop-shadow-lg transition-transform duration-500 group-hover:scale-110 ${isActive ? 'scale-110' : ''}`} />
                    </div>
                  </div>
                  
                  {isActive && (
                    <motion.div 
                      layoutId="active-story"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full border-2 border-white"
                    />
                  )}
                </div>
                
                <span className={`text-[10px] font-black uppercase tracking-widest text-center transition-colors ${
                  isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-main'
                }`}>
                  {cat.name[language].split(' ')[0]}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
