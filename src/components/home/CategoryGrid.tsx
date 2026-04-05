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
        <Tag className="w-5 h-5 text-[#f59e0b]" />
        <h2 className="text-white font-bold text-xl poppins-bold">
          {translations.categories[language]} ({selectedCategory ? '1' : '0'} {translations.selected[language]})
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const Icon = cat.icon || (cat.icon_name ? ICON_MAP[cat.icon_name] : Utensils) || Utensils;
          
          return (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCategory(isActive ? null : cat.id)}
              className={`relative flex flex-col items-center justify-center p-6 rounded-[24px] transition-all duration-300 border-2 aspect-[1.3/1] ${
                isActive
                  ? "bg-[#2d3748] border-[#f59e0b] shadow-[0_0_30px_rgba(245,158,11,0.25)]"
                  : "bg-[#242f3e] border-transparent hover:border-[#f59e0b]/30"
              }`}
            >
              {/* Hot Badge */}
              {cat.isHot && (
                <div className="absolute -top-1 left-4 bg-[#f59e0b] text-[#1e293b] text-[8px] font-black px-2 py-0.5 rounded-md z-10 uppercase shadow-lg">
                  {translations.hot[language]}
                </div>
              )}

              {/* Selected Checkmark */}
              {isActive && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-[#f59e0b] rounded-full flex items-center justify-center shadow-lg">
                  <Check className="w-3 h-3 text-[#1e293b] stroke-[4]" />
                </div>
              )}

              <div className={`mb-4 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isActive ? 'bg-[#f59e0b] shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-[#1e293b]'
              }`}>
                <Icon className={`w-7 h-7 ${isActive ? 'text-[#1e293b]' : 'text-[#f59e0b]'}`} />
              </div>

              <div className="text-center">
                <h3 className="text-[11px] font-black tracking-wider mb-1 uppercase leading-tight text-white poppins-bold">
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
