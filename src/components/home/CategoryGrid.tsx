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
              className="flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 relative rounded-2xl overflow-hidden border border-white/10 bg-[#1A2238] group"
            >
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <img 
                  src={(cat as any).image} 
                  alt="" 
                  className="w-full h-full object-cover opacity-30 blur-[2px]"
                />
                <div className="absolute inset-0 bg-bg-dark/50" />
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center p-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-2">
                  <Icon className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-tight text-center text-white/90 line-clamp-2">
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
