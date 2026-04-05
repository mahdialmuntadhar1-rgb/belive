import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useHomeStore } from "@/stores/homeStore";
import { supabase } from '@/lib/supabaseClient';
import { ChevronDown, MapPin, X } from 'lucide-react';

export default function LocationFilterDynamic() {
  const { selectedGovernorate, setGovernorate, selectedCity, setCity } = useHomeStore();
  const [governorates, setGovernorates] = useState<Array<{ name: string; nameAr: string; count: number }>>([]);
  const [cities, setCities] = useState<Array<{ name: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGovernorates();
  }, []);

  useEffect(() => {
    if (selectedGovernorate) {
      fetchCities(selectedGovernorate);
    } else {
      setCities([]);
    }
  }, [selectedGovernorate]);

  const fetchGovernorates = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('governorate')
        .not('governorate', 'is', null);

      if (error) {
        console.error('Error fetching governorates:', error);
        // Fallback to hardcoded governorates
        setGovernorates([
          { name: "Baghdad", nameAr: "بغداد", count: 500 },
          { name: "Basra", nameAr: "البصرة", count: 200 },
          { name: "Mosul", nameAr: "الموصل", count: 150 },
          { name: "Erbil", nameAr: "أربيل", count: 120 },
        ]);
        return;
      }

      // Count businesses per governorate
      const governorateCount: Record<string, number> = {};
      data.forEach(business => {
        if (business.governorate) {
          governorateCount[business.governorate] = (governorateCount[business.governorate] || 0) + 1;
        }
      });

      // Arabic names mapping
      const arabicNames: Record<string, string> = {
        "Baghdad": "بغداد",
        "Erbil": "أربيل", 
        "Basra": "البصرة",
        "Mosul": "الموصل",
        "Sulaymaniyah": "السليمانية",
        "Duhok": "دهوك",
        "Kirkuk": "كركوك",
        "Najaf": "النجف",
        "Karbala": "كربلاء",
        "Nasiriyah": "الناصرية",
        "Amarah": "العمارة",
        "Hilla": "الحلة",
        "Kut": "الكوت",
        "Diwaniyah": "الديوانية",
        "Ramadi": "الرمادي",
        "Baqubah": "بعقوبة",
        "Samawah": "السماوة",
        "Tikrit": "تكريت",
        "Halabja": "حلبجة",
      };

      // Convert to array and sort by count
      const governorateArray = Object.entries(governorateCount)
        .map(([name, count]) => ({ 
          name, 
          nameAr: arabicNames[name] || name, 
          count 
        }))
        .sort((a, b) => b.count - a.count);

      setGovernorates(governorateArray);
    } catch (error) {
      console.error('Error fetching governorates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async (governorate: string) => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('city')
        .eq('governorate', governorate)
        .not('city', 'is', null);

      if (error) {
        console.error('Error fetching cities:', error);
        setCities([]);
        return;
      }

      // Count businesses per city
      const cityCount: Record<string, number> = {};
      data.forEach(business => {
        if (business.city) {
          cityCount[business.city] = (cityCount[business.city] || 0) + 1;
        }
      });

      // Convert to array and sort by count
      const cityArray = Object.entries(cityCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      setCities(cityArray);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  // Duplicate the list for seamless looping
  const duplicatedGovernorates = [...governorates, ...governorates];

  if (loading) {
    return (
      <div className="w-full mb-10">
        <div className="max-w-6xl mx-auto px-4 mb-4">
          <h3 className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">Select Location</h3>
        </div>
        <div className="w-full overflow-hidden relative group">
          <div className="flex gap-2 py-2">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="mx-2 px-6 py-2.5 rounded-2xl bg-gray-300 h-8 w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-10">
      {/* All Iraq / Reset Header */}
      <div className="max-w-6xl mx-auto px-4 mb-4 flex items-center justify-between">
        <h3 className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em]">Select Location</h3>
        {selectedGovernorate && (
          <button 
            onClick={() => {
              setGovernorate(null);
              setCity(null);
            }}
            className="text-[10px] font-black text-[#2CA6A4] uppercase tracking-widest flex items-center gap-1 hover:underline"
          >
            <X className="w-3 h-3" /> Clear Filters
          </button>
        )}
      </div>

      {/* Governorate Marquee */}
      <div className="w-full overflow-hidden relative group">
        <div className="flex animate-marquee whitespace-nowrap py-2">
          {duplicatedGovernorates.map((gov, idx) => (
            <button
              key={`${gov.name}-${idx}`}
              onClick={() => {
                setGovernorate(gov.name);
                setCity(null);
              }}
              className={`mx-2 px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2 flex items-center gap-2 pointer-events-auto relative z-10 ${
                selectedGovernorate === gov.name
                  ? "bg-[#2CA6A4] text-white border-[#2CA6A4] shadow-lg shadow-[#2CA6A4]/20"
                  : "bg-white text-[#2B2F33] border-[#E5E7EB] hover:border-[#2CA6A4]/30"
              }`}
            >
              {gov.name}
              <span className="text-[9px] bg-[#E5E7EB] text-[#6B7280] px-1.5 py-0.5 rounded-full">
                {gov.count}
              </span>
            </button>
          ))}
        </div>

        <div className="absolute top-0 flex animate-marquee2 whitespace-nowrap py-2">
          {duplicatedGovernorates.map((gov, idx) => (
            <button
              key={`${gov.name}-loop-${idx}`}
              onClick={() => {
                setGovernorate(gov.name);
                setCity(null);
              }}
              className={`mx-2 px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2 flex items-center gap-2 pointer-events-auto relative z-10 ${
                selectedGovernorate === gov.name
                  ? "bg-[#2CA6A4] text-white border-[#2CA6A4] shadow-lg shadow-[#2CA6A4]/20"
                  : "bg-white text-[#2B2F33] border-[#E5E7EB] hover:border-[#2CA6A4]/30"
              }`}
            >
              {gov.name}
              <span className="text-[9px] bg-[#E5E7EB] text-[#6B7280] px-1.5 py-0.5 rounded-full">
                {gov.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* City Selection (Conditional) */}
      <AnimatePresence>
        {selectedGovernorate && cities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-6xl mx-auto px-4 mt-6"
          >
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
              <button
                onClick={() => setCity(null)}
                className={`flex-shrink-0 px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                  selectedCity === null
                    ? "bg-[#2B2F33] text-white"
                    : "bg-[#F5F7F9] text-[#6B7280] hover:bg-[#E5E7EB]"
                }`}
              >
                All {selectedGovernorate}
                <span className="text-[9px] bg-[#E5E7EB] text-[#6B7280] px-1.5 py-0.5 rounded-full">
                  {cities.reduce((sum, city) => sum + city.count, 0)}
                </span>
              </button>
              {cities.map((city) => (
                <button
                  key={city.name}
                  onClick={() => setCity(city.name)}
                  className={`flex-shrink-0 px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                    selectedCity === city.name
                      ? "bg-[#2B2F33] text-white"
                      : "bg-[#F5F7F9] text-[#6B7280] hover:bg-[#E5E7EB]"
                  }`}
                >
                  {city.name}
                  <span className="text-[9px] bg-[#E5E7EB] text-[#6B7280] px-1.5 py-0.5 rounded-full">
                    {city.count}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes marquee2 {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
        .animate-marquee2 {
          animation: marquee2 60s linear infinite;
        }
        .group:hover .animate-marquee, .group:hover .animate-marquee2 {
          animation-play-state: paused;
        }
      `}} />
    </div>
  );
}
