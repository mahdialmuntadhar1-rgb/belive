import { useEffect, useState } from 'react';
import { useHomeStore } from '@/stores/homeStore';
import { motion } from 'motion/react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Utensils, Coffee, Hotel, ShoppingBag, Landmark, 
  GraduationCap, Clapperboard, Plane, Stethoscope, Scale, 
  Hospital, HeartPulse, Home, PartyPopper, MoreHorizontal, 
  Pill, Dumbbell, Sparkles, Store, Armchair, Check, Tag,
  Briefcase, Building, Car, Package
} from 'lucide-react';

// Icon mapping for categories
const ICON_MAP: Record<string, any> = {
  'RESTAURANTS & DINING': Utensils,
  'CAFES & COFFEE': Coffee,
  'HOTELS & STAYS': Hotel,
  'SHOPPING & RETAIL': ShoppingBag,
  'BANKS & FINANCE': Landmark,
  'EDUCATION': GraduationCap,
  'ENTERTAINMENT': Clapperboard,
  'TOURISM & TRAVEL': Plane,
  'DOCTORS & PHYSICIANS': Stethoscope,
  'LAWYERS & LEGAL': Scale,
  'HOSPITALS & CLINICS': Hospital,
  'MEDICAL CLINICS': HeartPulse,
  'REAL ESTATE': Home,
  'EVENTS & VENUES': PartyPopper,
  'OTHERS & GENERAL': MoreHorizontal,
  'PHARMACY & DRUGS': Pill,
  'GYM & FITNESS': Dumbbell,
  'BEAUTY & SALONS': Sparkles,
  'SUPERMARKETS': Store,
  'FURNITURE & HOME': Armchair,
  'BUSINESS SERVICES': Briefcase,
  'CULTURE & HERITAGE': Building,
  'TRANSPORT & MOBILITY': Car,
  'ESSENTIAL SERVICES': Package,
};

interface Category {
  name: string;
  count: number;
}

export default function CategoryGridDynamic() {
  const { selectedCategory, setCategory } = useHomeStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('category')
        .not('category', 'is', null);

      if (error) {
        console.error('Error fetching categories:', error);
        // Fallback to hardcoded categories if error
        setCategories([
          { name: 'RESTAURANTS & DINING', count: 100 },
          { name: 'CAFES & COFFEE', count: 100 },
          { name: 'SHOPPING & RETAIL', count: 100 },
          { name: 'HOTELS & STAYS', count: 100 },
          { name: 'HEALTH & WELLNESS', count: 100 },
        ]);
        return;
      }

      // Count businesses per category
      const categoryCount: Record<string, number> = {};
      data.forEach(business => {
        if (business.category) {
          categoryCount[business.category] = (categoryCount[business.category] || 0) + 1;
        }
      });

      // Convert to array and sort by count
      const categoryArray = Object.entries(categoryCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      setCategories(categoryArray);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-3 mb-10 px-2">
          <Tag className="w-5 h-5 text-[#f59e0b]" />
          <h2 className="text-white font-bold text-xl poppins-bold">
            Categories (0 selected)
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-[#242f3e] rounded-[24px] aspect-[1.3/1] flex flex-col items-center justify-center p-6">
                <div className="w-14 h-14 bg-[#1e293b] rounded-2xl mb-4"></div>
                <div className="h-3 bg-[#1e293b] rounded w-20 mb-1"></div>
                <div className="h-2 bg-[#1e293b] rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-10 px-2">
        <Tag className="w-5 h-5 text-[#f59e0b]" />
        <h2 className="text-white font-bold text-xl poppins-bold">
          Categories ({selectedCategory ? '1' : '0'} selected)
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((cat, index) => {
          const isActive = selectedCategory === cat.name;
          const Icon = ICON_MAP[cat.name] || Store; // Default to Store icon
          
          return (
            <motion.button
              key={`${cat.name}-${index}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCategory(isActive ? null : cat.name)}
              className={`relative flex flex-col items-center justify-center p-6 rounded-[24px] transition-all duration-300 border-2 aspect-[1.3/1] ${
                isActive
                  ? "bg-[#2d3748] border-[#f59e0b] shadow-[0_0_30px_rgba(245,158,11,0.25)]"
                  : "bg-[#242f3e] border-transparent hover:border-[#f59e0b]/30"
              }`}
            >
              {/* Hot Badge - show for top categories */}
              {index < 3 && (
                <div className="absolute -top-1 left-4 bg-[#f59e0b] text-[#1e293b] text-[8px] font-black px-2 py-0.5 rounded-md z-10 uppercase shadow-lg">
                  HOT
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
                  {cat.name}
                </h3>
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400">
                  {cat.count} BUSINESSES
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
