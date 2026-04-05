import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useHomeStore } from "@/stores/homeStore";
import { ChevronDown, MapPin, X } from 'lucide-react';
import { CITIES } from '@/constants';

interface CityDropdownProps {
  governorateId: string | null;
}

export default function CityDropdown({ governorateId }: CityDropdownProps) {
  const { selectedCity, setCity, language } = useHomeStore();
  const [isOpen, setIsOpen] = useState(false);

  const translations = {
    choose: {
      en: "Please choose your governorate first",
      ar: "يرجى اختيار محافظتك أولاً",
      ku: "تکایە سەرەتا پارێزگاکەت هەڵبژێرە"
    },
    select: {
      en: "Select City",
      ar: "اختر المدينة",
      ku: "شار هەڵبژێرە"
    },
    reset: {
      en: "Reset City",
      ar: "إعادة ضبط المدينة",
      ku: "سڕینەوەی شار"
    }
  };

  const cities = governorateId ? CITIES[governorateId] || [] : [];

  const getCityName = (cityId: string | null) => {
    if (!cityId) return null;
    const city = cities.find(c => c.id === cityId);
    if (!city) return cityId;
    return city.name[language as keyof typeof city.name];
  };

  if (!governorateId) return null;

  return (
    <div className="w-full px-4 mb-8">
      <div className="relative w-full max-w-md mx-auto">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border-2 transition-all duration-300 shadow-lg ${
            isOpen 
              ? "border-[#2CA6A4] bg-white ring-4 ring-[#2CA6A4]/10" 
              : "border-[#E5E7EB] bg-white hover:border-[#2CA6A4]/30"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              selectedCity ? "bg-[#2CA6A4] text-white" : "bg-[#F5F7F9] text-[#6B7280]"
            }`}>
              <MapPin className="w-4 h-4" />
            </div>
            <span className={`text-sm font-bold poppins-bold ${
              selectedCity ? "text-[#2B2F33]" : "text-[#9CA3AF]"
            }`}>
              {getCityName(selectedCity) || translations.select[language]}
            </span>
          </div>
          <ChevronDown className={`w-5 h-5 text-[#6B7280] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl overflow-hidden max-h-[300px] overflow-y-auto no-scrollbar p-2"
            >
              <div className="flex flex-col gap-1">
                {cities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => {
                      setCity(city.id);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                      selectedCity === city.id
                        ? "bg-[#2CA6A4] text-white"
                        : "hover:bg-[#F5F7F9] text-[#2B2F33]"
                    }`}
                  >
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {city.name[language as keyof typeof city.name]}
                    </span>
                    {selectedCity === city.id && (
                      <X className="w-3 h-3 text-white" onClick={(e) => {
                        e.stopPropagation();
                        setCity(null);
                        setIsOpen(false);
                      }} />
                    )}
                  </button>
                ))}
                {cities.length === 0 && (
                  <div className="px-4 py-8 text-center text-xs font-bold text-[#6B7280] uppercase tracking-widest">
                    No cities available
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
