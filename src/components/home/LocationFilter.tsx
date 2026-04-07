import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useHomeStore } from "@/stores/homeStore";
import { ChevronDown, MapPin, LayoutGrid, Check } from 'lucide-react';
import { CATEGORIES, GOVERNORATES } from '@/constants';
import type { Business } from '@/lib/supabase';

interface LocationFilterProps {
  businesses?: Business[];
}

export default function LocationFilter({ businesses = [] }: LocationFilterProps) {
  const { selectedGovernorate, setGovernorate, selectedCategory, setCategory, language } = useHomeStore();
  const [activeDropdown, setActiveDropdown] = useState<'gov' | 'cat' | null>(null);

  // Filter categories by relevance to the selected governorate
  const relevantCategories = useMemo(() => {
    if (!selectedGovernorate) return CATEGORIES;
    
    // Find categories that have at least one business in the selected governorate
    const categoriesInGov = new Set(
      businesses
        .filter(b => b.governorate === selectedGovernorate)
        .map(b => b.category)
    );
    
    // If we have data, filter. Otherwise, show all (fallback)
    if (categoriesInGov.size === 0) return CATEGORIES;
    
    return CATEGORIES.filter(c => categoriesInGov.has(c.id));
  }, [selectedGovernorate, businesses]);

  const translations = {
    selectGov: { en: "Governorate", ar: "المحافظة", ku: "پارێزگا" },
    selectCat: { en: "Category", ar: "التصنيف", ku: "پۆلێن" },
    allGovs: { en: "All Iraq", ar: "كل العراق", ku: "هەموو عێراق" },
    allCats: { en: "All Categories", ar: "كل التصنيفات", ku: "هەموو پۆلەکان" }
  };

  const getGovName = (govName: string | null) => {
    if (!govName) return translations.allGovs[language];
    const gov = GOVERNORATES.find(g => g.id === govName || g.name.en === govName);
    if (!gov) return govName;
    return language === 'ar' ? gov.name.ar : language === 'ku' ? gov.name.ku : gov.name.en;
  };

  const getCatName = (catId: string | null) => {
    if (!catId) return translations.allCats[language];
    const cat = CATEGORIES.find(c => c.id === catId);
    if (!cat) return catId;
    return cat.name[language];
  };

  return (
    <div className="w-full px-4 mb-16">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Governorate Chips - Premium Style */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                {translations.selectGov[language]}
              </label>
            </div>
            {!selectedGovernorate && (
              <span className="text-[9px] font-black text-primary uppercase tracking-widest animate-pulse">
                {language === 'ar' ? 'اختر مدينة' : language === 'ku' ? 'شارێک هەڵبژێرە' : 'Select a city'}
              </span>
            )}
          </div>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
            <button
              onClick={() => setGovernorate(null)}
              className={`flex-shrink-0 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 border-2 ${
                !selectedGovernorate 
                  ? "bg-bg-dark border-primary text-white shadow-[0_10px_20px_-5px_rgba(255,159,28,0.3)] scale-105" 
                  : "bg-white border-slate-100 text-slate-400 hover:border-primary/30 hover:text-primary"
              }`}
            >
              {translations.allGovs[language]}
            </button>
            {GOVERNORATES.map((gov, idx) => (
              <motion.button
                key={gov.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setGovernorate(gov.name.en)}
                className={`flex-shrink-0 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-500 border-2 ${
                  selectedGovernorate === gov.name.en 
                    ? "bg-bg-dark border-primary text-white shadow-[0_10px_20px_-5px_rgba(255,159,28,0.3)] scale-105" 
                    : "bg-white border-slate-100 text-slate-400 hover:border-primary/30 hover:text-primary"
                }`}
              >
                {language === 'ar' ? gov.name.ar : language === 'ku' ? gov.name.ku : gov.name.en}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Dropdowns - High Fidelity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Governorate Dropdown */}
          <div className="relative group/gov">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'gov' ? null : 'gov')}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-[22px] border-2 transition-all duration-500 shadow-xl ${
                activeDropdown === 'gov' ? "border-primary bg-bg-dark ring-4 ring-primary/10" : "border-slate-100 bg-white hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${selectedGovernorate ? 'bg-primary/10 text-primary' : 'bg-slate-50 text-slate-400'}`}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Location</span>
                  <span className={`text-[11px] font-black uppercase tracking-widest truncate ${selectedGovernorate ? (activeDropdown === 'gov' ? 'text-white' : 'text-bg-dark') : 'text-slate-400'}`}>
                    {getGovName(selectedGovernorate)}
                  </span>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-500 ${activeDropdown === 'gov' ? "rotate-180 text-primary" : ""}`} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'gov' && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute z-50 left-0 right-0 mt-3 bg-white rounded-[28px] border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden max-h-[350px] overflow-y-auto no-scrollbar p-2"
                >
                  <button
                    onClick={() => { setGovernorate(null); setActiveDropdown(null); }}
                    className="w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 text-bg-dark transition-colors"
                  >
                    {translations.allGovs[language]}
                    {!selectedGovernorate && <Check className="w-4 h-4 text-primary" />}
                  </button>
                  <div className="h-[1px] bg-slate-50 mx-4 my-1" />
                  {GOVERNORATES.map((gov) => (
                    <button
                      key={gov.id}
                      onClick={() => { setGovernorate(gov.name.en); setActiveDropdown(null); }}
                      className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                        selectedGovernorate === gov.name.en ? "bg-primary/5 text-primary" : "hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      {language === 'ar' ? gov.name.ar : language === 'ku' ? gov.name.ku : gov.name.en}
                      {selectedGovernorate === gov.name.en && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Category Dropdown */}
          <div className="relative group/cat">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'cat' ? null : 'cat')}
              className={`w-full flex items-center justify-between px-6 py-4 rounded-[22px] border-2 transition-all duration-500 shadow-xl ${
                activeDropdown === 'cat' ? "border-primary bg-bg-dark ring-4 ring-primary/10" : "border-slate-100 bg-white hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${selectedCategory ? 'bg-primary/10 text-primary' : 'bg-slate-50 text-slate-400'}`}>
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Category</span>
                  <span className={`text-[11px] font-black uppercase tracking-widest truncate ${selectedCategory ? (activeDropdown === 'cat' ? 'text-white' : 'text-bg-dark') : 'text-slate-400'}`}>
                    {getCatName(selectedCategory)}
                  </span>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-500 ${activeDropdown === 'cat' ? "rotate-180 text-primary" : ""}`} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'cat' && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute z-50 left-0 right-0 mt-3 bg-white rounded-[28px] border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden max-h-[350px] overflow-y-auto no-scrollbar p-2"
                >
                  <button
                    onClick={() => { setCategory(null); setActiveDropdown(null); }}
                    className="w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 text-bg-dark transition-colors"
                  >
                    {translations.allCats[language]}
                    {!selectedCategory && <Check className="w-4 h-4 text-primary" />}
                  </button>
                  <div className="h-[1px] bg-slate-50 mx-4 my-1" />
                  {relevantCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setCategory(cat.id); setActiveDropdown(null); }}
                      className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                        selectedCategory === cat.id ? "bg-primary/5 text-primary" : "hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <cat.icon className="w-4 h-4 opacity-50" />
                        {cat.name[language]}
                      </div>
                      {selectedCategory === cat.id && <Check className="w-4 h-4 text-primary" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
