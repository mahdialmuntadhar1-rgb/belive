import { useHomeStore } from '@/stores/homeStore';
import { CATEGORIES } from '@/constants';

// LAUNCH MODE: Visual-only category display
// Categories are displayed as horizontal informational squares only
// No filtering, no clicking, purely decorative

export default function CategoryGrid() {
  const { language } = useHomeStore();

  return (
    <div className="w-full mb-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 px-2">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <h2 className="text-sm font-black text-text-main poppins-bold uppercase tracking-tight">
          {language === 'ar' ? 'استكشف الفئات' : language === 'ku' ? 'پۆلەکان بگەڕێ' : 'Explore Categories'}
        </h2>
      </div>

      {/* Horizontal scrollable category squares - VISUAL ONLY */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          
          return (
            <div
              key={cat.id}
              className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm group hover:shadow-md transition-all"
            >
              {/* Background Image with dark overlay for text readability */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={(cat as any).image} 
                  alt="" 
                  className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center p-2">
                <div className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center mb-2 shadow-sm">
                  <Icon className="w-4 h-4 text-primary" strokeWidth={2} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-tight text-center text-white drop-shadow-md line-clamp-2">
                  {cat.name[language]}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
