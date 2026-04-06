import { motion } from 'motion/react';
import { useHomeStore } from '@/stores/homeStore';
import { useMetadata } from '@/hooks/useMetadata';
import { ICON_MAP } from '@/constants';
import { Utensils } from 'lucide-react';

export default function StoryRow() {
  const { selectedCategory, setCategory, language } = useHomeStore();
  const { categories, loading } = useMetadata();

  if (loading && categories.length === 0) return null;

  return (
    <div className="w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((cat) => {
            const filterValue = cat.name?.en || cat.id;
            const isActive = selectedCategory === filterValue;
            const Icon = cat.icon || (cat.icon_name ? ICON_MAP[cat.icon_name] : Utensils) || Utensils;

            return (
              <motion.div
                key={cat.id}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCategory(isActive ? null : filterValue)}
                className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group"
              >
                <div className={`relative p-1 rounded-[20px] shadow-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-tr from-[#2CA6A4] to-[#E87A41] shadow-[#2CA6A4]/20'
                    : 'bg-gradient-to-tr from-slate-200 to-slate-300 shadow-slate-200/50 group-hover:from-[#2CA6A4]/60 group-hover:to-[#E87A41]/60'
                }`}>
                  <div className="w-16 h-16 rounded-[16px] overflow-hidden border-[3px] border-white bg-slate-800 flex items-center justify-center">
                    <Icon className={`w-7 h-7 transition-colors ${isActive ? 'text-white' : 'text-[#2CA6A4]'}`} />
                  </div>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-[0.15em] transition-colors text-center max-w-[70px] leading-tight ${
                  isActive ? 'text-[#2CA6A4]' : 'text-[#2B2F33] group-hover:text-[#2CA6A4]'
                }`}>
                  {cat.name[language]}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
