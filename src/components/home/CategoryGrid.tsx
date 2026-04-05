import { useHomeStore } from '@/stores/homeStore';
import { motion } from 'motion/react';
import { 
  Utensils, Coffee, Hotel, ShoppingBag, Landmark, 
  GraduationCap, Clapperboard, Plane, Stethoscope, Scale, 
  Hospital, HeartPulse, Home, PartyPopper, MoreHorizontal, 
  Pill, Dumbbell, Sparkles, Store, Armchair, Check, Tag
} from 'lucide-react';

const CATEGORIES = [
  { id: 'dining', name: 'RESTAURANTS & DINING', icon: Utensils, types: 4 },
  { id: 'cafe', name: 'CAFES & COFFEE', icon: Coffee, types: 3 },
  { id: 'hotels', name: 'HOTELS & STAYS', icon: Hotel, types: 3 },
  { id: 'shopping', name: 'SHOPPING & RETAIL', icon: ShoppingBag, types: 3 },
  { id: 'banks', name: 'BANKS & FINANCE', icon: Landmark, types: 3 },
  { id: 'education', name: 'EDUCATION', icon: GraduationCap, types: 3 },
  { id: 'entertainment', name: 'ENTERTAINMENT', icon: Clapperboard, types: 3 },
  { id: 'tourism', name: 'TOURISM & TRAVEL', icon: Plane, types: 3 },
  { id: 'doctors', name: 'DOCTORS & PHYSICIANS', icon: Stethoscope, types: 6 },
  { id: 'lawyers', name: 'LAWYERS & LEGAL', icon: Scale, types: 3 },
  { id: 'hospitals', name: 'HOSPITALS & CLINICS', icon: Hospital, types: 4 },
  { id: 'clinics', name: 'MEDICAL CLINICS', icon: HeartPulse, types: 5 },
  { id: 'realestate', name: 'REAL ESTATE', icon: Home, types: 4 },
  { id: 'events', name: 'EVENTS & VENUES', icon: PartyPopper, types: 4, isHot: true },
  { id: 'others', name: 'OTHERS & GENERAL', icon: MoreHorizontal, types: 4 },
  { id: 'pharmacy', name: 'PHARMACY & DRUGS', icon: Pill, types: 3 },
  { id: 'gym', name: 'GYM & FITNESS', icon: Dumbbell, types: 4 },
  { id: 'beauty', name: 'BEAUTY & SALONS', icon: Sparkles, types: 4 },
  { id: 'supermarkets', name: 'SUPERMARKETS', icon: Store, types: 4 },
  { id: 'furniture', name: 'FURNITURE & HOME', icon: Armchair, types: 4 },
];

export default function CategoryGrid() {
  const { selectedCategory, setCategory } = useHomeStore();

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-10 px-2">
        <Tag className="w-5 h-5 text-[#f59e0b]" />
        <h2 className="text-white font-bold text-xl poppins-bold">
          Categories ({selectedCategory ? '1' : '0'} selected)
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const Icon = cat.icon;
          
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
                  {cat.types} TYPES
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
