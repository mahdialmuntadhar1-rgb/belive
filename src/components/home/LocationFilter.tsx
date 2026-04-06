import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useHomeStore } from "@/stores/homeStore";
import { ChevronDown, MapPin, Check } from 'lucide-react';
import { GOVERNORATES } from '@/constants';
import type { Business } from '@/lib/supabase';

interface LocationFilterProps {
  businesses?: Business[];
}

// LAUNCH MODE: Governorate-only filtering
// Category dropdown removed - categories are now visual-only on homepage

export default function LocationFilter({ }: LocationFilterProps) {
  const { selectedGovernorate, setGovernorate, language } = useHomeStore();
  const [isOpen, setIsOpen] = useState(false);

  const translations = {
    selectGov: { en: "Governorate", ar: "المحافظة", ku: "پارێزگا" },
    allGovs: { en: "All Iraq", ar: "كل العراق", ku: "هەموو عێراق" }
  };

  const getGovName = (govName: string | null) => {
    if (!govName || govName === 'all') return translations.allGovs[language];
    const gov = GOVERNORATES.find(g => g.id === govName || g.name.en === govName);
    if (!gov) return govName;
    return language === 'ar' ? gov.name.ar : language === 'ku' ? gov.name.ku : gov.name.en;
  };

  return (
    <div className="w-full px-4 mb-12">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Governorate Chips - Quick Select */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
              {translations.selectGov[language]}
            </label>
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => setGovernorate('all')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${
                !selectedGovernorate || selectedGovernorate === 'all'
                  ? "bg-primary border-primary text-bg-dark shadow-sm" 
                  : "bg-white/5 border-white/10 text-slate-400 hover:border-white/30"
              }`}
            >
              {translations.allGovs[language]}
            </button>
            {GOVERNORATES.map((gov) => (
              <button
                key={gov.id}
                onClick={() => setGovernorate(gov.name.en)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${
                  selectedGovernorate === gov.name.en 
                    ? "bg-primary border-primary text-bg-dark shadow-sm" 
                    : "bg-white/5 border-white/10 text-slate-400 hover:border-white/30"
                }`}
              >
                {language === 'ar' ? gov.name.ar : language === 'ku' ? gov.name.ku : gov.name.en}
              </button>
            ))}
          </div>
        </div>

        {/* Governorate Dropdown (Alternative Selection) */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-300 shadow-lg ${
              isOpen ? "border-primary bg-[#1E293B]" : "border-white/5 bg-[#1E293B]"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className={`w-4 h-4 flex-shrink-0 ${selectedGovernorate && selectedGovernorate !== 'all' ? 'text-primary' : 'text-slate-500'}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest truncate ${selectedGovernorate && selectedGovernorate !== 'all' ? 'text-white' : 'text-slate-500'}`}>
                {getGovName(selectedGovernorate)}
              </span>
            </div>
            <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute z-50 left-0 right-0 mt-2 bg-[#1E293B] rounded-xl border border-white/10 shadow-2xl overflow-hidden max-h-[300px] overflow-y-auto no-scrollbar p-1"
              >
                <button
                  onClick={() => { setGovernorate('all'); setIsOpen(false); }}
                  className="w-full flex items-center justify-between px-5 py-4 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/5 text-white"
                >
                  {translations.allGovs[language]}
                  {(!selectedGovernorate || selectedGovernorate === 'all') && <Check className="w-3 h-3 text-primary" />}
                </button>
                {GOVERNORATES.map((gov) => (
                  <button
                    key={gov.id}
                    onClick={() => { setGovernorate(gov.name.en); setIsOpen(false); }}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${
                      selectedGovernorate === gov.name.en ? "bg-primary/10 text-primary" : "hover:bg-white/5 text-white"
                    }`}
                  >
                    {language === 'ar' ? gov.name.ar : language === 'ku' ? gov.name.ku : gov.name.en}
                    {selectedGovernorate === gov.name.en && <Check className="w-3 h-3 text-primary" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
