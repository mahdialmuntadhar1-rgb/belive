import { useHomeStore } from '@/stores/homeStore';
import { motion } from 'motion/react';
import { Check, Tag, Utensils } from 'lucide-react';
import { ICON_MAP } from '@/constants';
import { useMetadata } from '@/hooks/useMetadata';

export default function CategoryGrid() {
  const { selectedCategory, setCategory, language } = useHomeStore();
  const { categories, loading } = useMetadata();

  const translations = {
    categories: {
      en: 'Categories',
      ar: 'التصنيفات',
      ku: 'پۆلەکان'
    },
    selected: {
      en: 'selected',
      ar: 'محدد',
      ku: 'دیاریکراوە'
    },
    types: {
      en: 'TYPES',
      ar: 'أنواع',
      ku: 'جۆر'
    },
    hot: {
      en: 'HOT',
      ar: 'رائج',
      ku: 'گەرم'
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f59e0b]"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-10 px-2">
        <Tag className="w-5 h-5 text-secondary" />
        <h2 className="text-white font-bold text-xl poppins-bold">
          {translations.categories[language]} ({selectedCategory ? '1' : '0'} {translations.selected[language]})
        </h2>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
        {categories.map((cat) => {
          const filterValue = cat.name?.en || cat.name?.['en'] || cat.id;
          const isActive = selectedCategory === filterValue;
          const Icon = cat.icon || (cat.icon_name ? ICON_MAP[cat.icon_name] : Utensils) || Utensils;

          return (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCategory(isActive ? null : filterValue)}
              className={`relative flex flex-col items-center justify-center p-3 sm:p-6 rounded-xl sm:rounded-[24px] transition-all duration-300 border-2 aspect-square sm:aspect-[1.3/1] ${
                isActive
                  ? "bg-slate-800 border-primary shadow-[0_0_30px_rgba(0,191,165,0.25)]"
                  : "bg-slate-900 border-transparent hover:border-primary/30"
              }`}
            >
              {/* Hot Badge */}
              {cat.isHot && (
                <div className="absolute -top-1 left-2 sm:left-4 bg-secondary text-white text-[7px] sm:text-[8px] font-black px-1.5 sm:px-2 py-0.5 rounded-md z-10 uppercase shadow-lg">
                  {translations.hot[language]}
                </div>
              )}

              {/* Selected Checkmark */}
              {isActive && (
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-4 h-4 sm:w-5 sm:h-5 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <Check className="w-2.5 h-2.5 sm:w-3 h-3 text-white stroke-[4]" />
                </div>
              )}

              <div className={`mb-2 sm:mb-4 w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isActive ? 'bg-primary shadow-[0_0_15px_rgba(0,191,165,0.4)]' : 'bg-slate-800'
              }`}>
                <Icon className={`w-5 h-5 sm:w-7 sm:h-7 ${isActive ? 'text-white' : 'text-primary'}`} />
              </div>

              <div className="text-center">
                <h3 className="text-[8px] sm:text-[11px] font-black tracking-wider mb-0.5 sm:mb-1 uppercase leading-tight text-white poppins-bold">
                  {cat.name[language]}
                </h3>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
