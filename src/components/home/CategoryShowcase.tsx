import { useHomeStore } from '@/stores/homeStore';
import { motion } from 'motion/react';
import { useMetadata } from '@/hooks/useMetadata';
import { LayoutGrid } from 'lucide-react';
import { ICON_MAP } from '@/constants';

const CATEGORY_IMAGES: Record<string, string> = {
  'RESTAURANTS & DINING': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=300&auto=format&fit=crop',
  'CAFES & COFFEE': 'https://images.unsplash.com/photo-1501339819398-ed495197ff21?q=80&w=300&auto=format&fit=crop',
  'BEAUTY & SALONS': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=300&auto=format&fit=crop',
  'MEDICAL CLINICS': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=300&auto=format&fit=crop',
  'HOSPITALS & CLINICS': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=300&auto=format&fit=crop',
  'PHARMACY & DRUGS': 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=300&auto=format&fit=crop',
  'SUPERMARKETS': 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=300&auto=format&fit=crop',
  'HOTELS & STAYS': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=300&auto=format&fit=crop',
  'GYM & FITNESS': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=300&auto=format&fit=crop',
  'FURNITURE & HOME': 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=300&auto=format&fit=crop',
  'ELECTRONICS': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=300&auto=format&fit=crop',
  'FASHION & APPAREL': 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=300&auto=format&fit=crop',
  'CARS & VEHICLES': 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=300&auto=format&fit=crop',
  'REAL ESTATE': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=300&auto=format&fit=crop',
  'EDUCATION': 'https://images.unsplash.com/photo-1523050335392-9bc567597f81?q=80&w=300&auto=format&fit=crop',
  'SERVICES': 'https://images.unsplash.com/photo-1581578731548-c64695ce6958?q=80&w=300&auto=format&fit=crop',
};

export default function CategoryShowcase() {
  const { selectedCategory, setCategory, language } = useHomeStore();
  const { categories, loading } = useMetadata();

  if (loading && categories.length === 0) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar px-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex-shrink-0 w-24 h-24 bg-slate-100 animate-pulse rounded-[20px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full py-8 bg-transparent mb-4">
      <div className="flex gap-6 overflow-x-auto no-scrollbar px-4 snap-x">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCategory(null)}
          className="flex-shrink-0 flex flex-col items-center gap-3 snap-start group"
        >
          <div className={`w-20 h-20 rounded-full p-1 transition-all duration-500 ${
            !selectedCategory 
              ? 'bg-gradient-to-tr from-primary via-secondary to-accent p-[3px]' 
              : 'bg-slate-200 group-hover:bg-primary/50'
          }`}>
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white">
              <LayoutGrid size={28} className={!selectedCategory ? 'text-primary' : 'text-slate-400'} />
            </div>
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
            !selectedCategory ? 'text-primary' : 'text-slate-500'
          }`}>
            {language === 'ar' ? 'الكل' : language === 'ku' ? 'هەموو' : 'All'}
          </span>
        </motion.button>

        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const imageUrl = CATEGORY_IMAGES[cat.name.en] || `https://picsum.photos/seed/${cat.id}/300/300`;
          
          return (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setCategory(isActive ? null : cat.id);
                const businessGrid = document.getElementById('business-grid');
                if (businessGrid) {
                  businessGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="flex-shrink-0 flex flex-col items-center gap-3 snap-start group"
            >
              <div className={`w-20 h-20 rounded-full p-1 transition-all duration-500 ${
                isActive 
                  ? 'bg-gradient-to-tr from-primary via-secondary to-accent p-[3px]' 
                  : 'bg-slate-200 group-hover:bg-primary/50'
              }`}>
                <div className="w-full h-full rounded-full bg-white overflow-hidden border-2 border-white relative">
                  <img 
                    src={imageUrl} 
                    alt="" 
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
                      isActive ? 'brightness-100' : 'brightness-90 grayscale-[0.2]'
                    }`}
                    referrerPolicy="no-referrer"
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                    </div>
                  )}
                </div>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-tight transition-colors text-center w-20 line-clamp-1 ${
                isActive ? 'text-primary' : 'text-slate-500'
              }`}>
                {cat.name[language]}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
