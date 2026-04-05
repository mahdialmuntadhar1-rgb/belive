import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useHomeStore } from "@/stores/homeStore";
import { ChevronDown, MapPin, X } from 'lucide-react';
import { useMetadata } from '@/hooks/useMetadata';

export default function LocationFilter() {
  const { selectedGovernorate, setGovernorate, setCity, language } = useHomeStore();
  const [isOpen, setIsOpen] = useState(false);
  const { governorates, loading } = useMetadata();

  const translations = {
    active: {
      en: "Location Active",
      ar: "الموقع مفعل",
      ku: "شوێن چالاکە"
    },
    start: {
      en: "Getting Started",
      ar: "ابدأ الآن",
      ku: "دەستپێکردن"
    },
    exploring: {
      en: "Exploring",
      ar: "استكشاف",
      ku: "گەڕان لە"
    },
    choose: {
      en: "Please choose your governorate first",
      ar: "يرجى اختيار محافظتك أولاً",
      ku: "تکایە سەرەتا پارێزگاکەت هەڵبژێرە"
    },
    select: {
      en: "Select Governorate",
      ar: "اختر المحافظة",
      ku: "پارێزگا هەڵبژێرە"
    },
    reset: {
      en: "Reset Location",
      ar: "إعادة ضبط الموقع",
      ku: "سڕینەوەی شوێن"
    }
  };

  const getGovName = (govName: string | null) => {
    if (!govName) return null;
    const gov = governorates.find(g => g.name_en === govName);
    if (!gov) return govName;
    if (language === 'ar') return gov.name_ar;
    if (language === 'ku') return gov.name_ku;
    return gov.name_en;
  };

  return (
    <div className="w-full mb-16 px-4">
      <div className="max-w-xl mx-auto flex flex-col items-center text-center">
        {/* Header Label */}
        <div className="flex items-center gap-2 text-[#2CA6A4] mb-4">
          <MapPin className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
            {selectedGovernorate ? translations.active[language] : translations.start[language]}
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-[#2B2F33] poppins-bold mb-10 leading-tight tracking-tight">
          {selectedGovernorate 
            ? `${translations.exploring[language]} ${getGovName(selectedGovernorate)}` 
            : translations.choose[language]}
        </h2>

        {/* Custom Dropdown */}
        <div className="relative w-full">
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={loading}
            className={`w-full flex items-center justify-between px-8 py-5 rounded-[24px] border-2 transition-all duration-300 shadow-xl ${
              isOpen 
                ? "border-[#2CA6A4] bg-white ring-4 ring-[#2CA6A4]/10" 
                : "border-[#E5E7EB] bg-white hover:border-[#2CA6A4]/30"
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                selectedGovernorate ? "bg-[#2CA6A4] text-white" : "bg-[#F5F7F9] text-[#6B7280]"
              }`}>
                <MapPin className="w-5 h-5" />
              </div>
              <span className={`text-lg font-bold poppins-bold ${
                selectedGovernorate ? "text-[#2B2F33]" : "text-[#9CA3AF]"
              }`}>
                {loading ? 'Loading...' : (getGovName(selectedGovernorate) || translations.select[language])}
              </span>
            </div>
            <ChevronDown className={`w-6 h-6 text-[#6B7280] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute z-50 left-0 right-0 mt-4 bg-white rounded-[32px] border border-[#E5E7EB] shadow-2xl overflow-hidden max-h-[400px] overflow-y-auto no-scrollbar p-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {governorates.map((gov) => (
                    <button
                      key={gov.id}
                      onClick={() => {
                        setGovernorate(gov.name_en);
                        setCity(null);
                        setIsOpen(false);
                      }}
                      className={`flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-200 group ${
                        selectedGovernorate === gov.name_en
                          ? "bg-[#2CA6A4] text-white"
                          : "hover:bg-[#F5F7F9] text-[#2B2F33]"
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-bold uppercase tracking-widest">
                          {language === 'ar' ? gov.name_ar : language === 'ku' ? gov.name_ku : gov.name_en}
                        </span>
                        <span className={`text-[10px] font-medium opacity-60 ${
                          selectedGovernorate === gov.name_en ? "text-white" : "text-[#6B7280]"
                        }`}>
                          {language === 'en' ? gov.name_ar : gov.name_en}
                        </span>
                      </div>
                      {selectedGovernorate === gov.name_en && (
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                          <X className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reset Button */}
        {selectedGovernorate && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => {
              setGovernorate(null);
              setCity(null);
            }}
            className="mt-6 text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em] hover:text-[#2CA6A4] transition-colors flex items-center gap-2"
          >
            <X className="w-3 h-3" /> {translations.reset[language]}
          </motion.button>
        )}
      </div>
    </div>
  );
}
