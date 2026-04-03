import { useState } from 'react';
import { useHomeStore } from '@/stores/homeStore';
import { motion } from 'motion/react';

const CATEGORIES = [
  { id: 'dining_cuisine', name: 'Dining & Cuisine', icon: '🍽️', color: 'bg-orange-100' },
  { id: 'cafe_coffee', name: 'Cafe & Coffee', icon: '☕', color: 'bg-amber-100' },
  { id: 'shopping_retail', name: 'Shopping & Retail', icon: '🛍️', color: 'bg-blue-100' },
  { id: 'entertainment_events', name: 'Entertainment & Events', icon: '🎬', color: 'bg-purple-100' },
  { id: 'accommodation_stays', name: 'Accommodation & Stays', icon: '🏨', color: 'bg-indigo-100' },
  { id: 'culture_heritage', name: 'Culture & Heritage', icon: '🏛️', color: 'bg-rose-100' },
  { id: 'business_services', name: 'Business & Services', icon: '💼', color: 'bg-slate-100' },
  { id: 'health_wellness', name: 'Health & Wellness', icon: '⚕️', color: 'bg-emerald-100' },
  { id: 'doctors', name: 'Doctors', icon: '👨‍⚕️', color: 'bg-teal-100' },
  { id: 'hospitals', name: 'Hospitals', icon: '🏥', color: 'bg-red-100' },
  { id: 'clinics', name: 'Clinics', icon: '🏥', color: 'bg-pink-100' },
  { id: 'transport_mobility', name: 'Transport & Mobility', icon: '🚗', color: 'bg-gray-100' },
  { id: 'public_essential', name: 'Public & Essential', icon: '🏛️', color: 'bg-cyan-100' },
  { id: 'lawyers', name: 'Lawyers', icon: '⚖️', color: 'bg-blue-200' },
  { id: 'education', name: 'Education', icon: '🎓', color: 'bg-yellow-100' }
];

export default function CategoryGrid() {
  const { selectedCategory, setCategory } = useHomeStore();

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-humus-dark poppins-bold">Categories</h2>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCategory(selectedCategory === cat.id ? null : cat.id)}
            className={`flex flex-col items-center p-3 rounded-2xl transition-all border-2 ${
              selectedCategory === cat.id 
                ? 'border-humus-coral bg-white shadow-md' 
                : 'border-transparent bg-white hover:border-humus-gray-200'
            }`}
          >
            <div className={`w-12 h-12 ${cat.color} rounded-full flex items-center justify-center text-2xl mb-2`}>
              {cat.icon}
            </div>
            <span className="text-[10px] md:text-xs font-bold text-center leading-tight poppins-semibold">
              {cat.name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
