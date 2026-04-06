import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useHomeStore } from "@/stores/homeStore";
import { ChevronDown, MapPin, LayoutGrid, X, Check } from 'lucide-react';
import { useMetadata } from '@/hooks/useMetadata';

export default function LocationFilter() {
  const { selectedGovernorate, setGovernorate, selectedCategory, setCategory, language } = useHomeStore();
  const [activeDropdown, setActiveDropdown] = useState<'gov' | 'cat' | null>(null);
  const { governorates, categories, loading } = useMetadata();

  const translations = {
    selectGov: { en: "Governorate", ar: "المحافظة", ku: "پارێزگا" },
    selectCat: { en: "Category", ar: "التصنيف", ku: "پۆلێن" },
    allGovs: { en: "All Iraq", ar: "كل العراق", ku: "هەموو عێراق" },
    allCats: { en: "All Categories", ar: "كل التصنيفات", ku: "هەموو پۆلەکان" }
  };

  const getGovName = (govName: string | null) => {
    if (!govName) return translations.allGovs[language];
    const gov = governorates.find(g => g.name_en === govName);
    if (!gov) return govName;
    return language === 'ar' ? gov.name_ar : language === 'ku' ? gov.name_ku : gov.name_en;
  };

  const getCatName = (catId: string | null) => {
    if (!catId) return translations.allCats[language];
    const cat = categories.find(c => c.id === catId);
    if (!cat) return catId;
    return cat.name[language];
  };

  return (
    <div className="w-full px-4 mb-8">
      <div className="flex gap-3 max-w-2xl mx-auto">
        {/* Governorate Dropdown */}
        <div className="relative flex-1">
          <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 px-1">
            {translations.selectGov[language]}
          </label>
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'gov' ? null : 'gov')}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all duration-300 shadow-sm ${
              activeDropdown === 'gov' ? "border-primary bg-white ring-4 ring-primary/10" : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className={`w-4 h-4 flex-shrink-0 ${selectedGovernorate ? 'text-primary' : 'text-slate-400'}`} />
              <span className={`text-xs font-bold truncate ${selectedGovernorate ? 'text-text-main' : 'text-slate-400'}`}>
                {getGovName(selectedGovernorate)}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeDropdown === 'gov' ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {activeDropdown === 'gov' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-[300px] overflow-y-auto no-scrollbar p-2"
              >
                <button
                  onClick={() => { setGovernorate(null); setActiveDropdown(null); }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  {translations.allGovs[language]}
                  {!selectedGovernorate && <Check className="w-3 h-3 text-primary" />}
                </button>
                {governorates.map((gov) => (
                  <button
                    key={gov.id}
                    onClick={() => { setGovernorate(gov.name_en); setActiveDropdown(null); }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-colors ${
                      selectedGovernorate === gov.name_en ? "bg-primary/10 text-primary" : "hover:bg-slate-50 text-text-main"
                    }`}
                  >
                    {language === 'ar' ? gov.name_ar : language === 'ku' ? gov.name_ku : gov.name_en}
                    {selectedGovernorate === gov.name_en && <Check className="w-3 h-3 text-primary" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Category Dropdown */}
        <div className="relative flex-1">
          <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 px-1">
            {translations.selectCat[language]}
          </label>
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'cat' ? null : 'cat')}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 transition-all duration-300 shadow-sm ${
              activeDropdown === 'cat' ? "border-primary bg-white ring-4 ring-primary/10" : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <LayoutGrid className={`w-4 h-4 flex-shrink-0 ${selectedCategory ? 'text-primary' : 'text-slate-400'}`} />
              <span className={`text-xs font-bold truncate ${selectedCategory ? 'text-text-main' : 'text-slate-400'}`}>
                {getCatName(selectedCategory)}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${activeDropdown === 'cat' ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {activeDropdown === 'cat' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-h-[300px] overflow-y-auto no-scrollbar p-2"
              >
                <button
                  onClick={() => { setCategory(null); setActiveDropdown(null); }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold hover:bg-slate-50"
                >
                  {translations.allCats[language]}
                  {!selectedCategory && <Check className="w-3 h-3 text-primary" />}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setCategory(cat.id); setActiveDropdown(null); }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-colors ${
                      selectedCategory === cat.id ? "bg-primary/10 text-primary" : "hover:bg-slate-50 text-text-main"
                    }`}
                  >
                    {cat.name[language]}
                    {selectedCategory === cat.id && <Check className="w-3 h-3 text-primary" />}
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
