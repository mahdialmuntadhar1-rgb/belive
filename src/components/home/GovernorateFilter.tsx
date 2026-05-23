import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronDown, MapPin, Check, Loader2, X } from 'lucide-react';
import { useHomeStore } from '@/stores/homeStore';
import { supabase } from '@/lib/supabaseClient';

export default function GovernorateFilter() {
  const { selectedGovernorate, setGovernorate, language } = useHomeStore();
  const [governorates, setGovernorates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isRTL = language === 'ar' || language === 'ku';

  useEffect(() => {
    async function fetchGovernorates() {
      try {
        setLoading(true);
        // We fetch unique governorates from the businesses table
        const { data, error } = await supabase
          .from('businesses')
          .select('governorate');

        if (error) throw error;

        if (data) {
          // Extract unique values and filter out nulls/empties
          const unique = Array.from(new Set(data.map((item: any) => item.governorate)))
            .filter(Boolean)
            .sort() as string[];
          
          setGovernorates(unique);
        }
      } catch (err) {
        console.error('Error fetching governorates:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchGovernorates();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredGovernorates = governorates.filter(gov => 
    gov.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (gov: string | null) => {
    console.log('Selected Governorate:', gov || 'All');
    setGovernorate(gov || ''); // homeStore uses empty string for "All" or a string
    setIsOpen(false);
    setSearch('');
  };

  const currentSelectionName = selectedGovernorate || (language === 'ar' ? 'كل العراق' : language === 'ku' ? 'هەموو عێراق' : 'All Iraq');

  return (
    <div className="w-full px-4 mb-8 sm:mb-12 relative z-[60]" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-xl mx-auto" ref={dropdownRef}>
        <div className="relative">
          {/* Dropdown Trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-100 p-2 flex items-center transition-all duration-300 ${isOpen ? 'ring-4 ring-primary/10 border-primary/20' : 'hover:border-primary/20'}`}
          >
            <div className={`flex items-center gap-4 flex-1 h-14 sm:h-16 px-4 sm:px-6`}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex flex-col items-start min-w-0">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">
                  {language === 'ar' ? 'المحافظة' : language === 'ku' ? 'پارێزگا' : 'Governorate'}
                </span>
                <span className="text-sm sm:text-lg font-black text-[#111827] truncate poppins-bold uppercase tracking-tight">
                  {currentSelectionName}
                </span>
              </div>
            </div>
            
            <div className="px-6 flex items-center gap-3 border-l border-slate-100 h-10">
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-500 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
            </div>
          </button>

          {/* Dropdown Content */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute top-full left-0 right-0 mt-4 bg-white rounded-[32px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden"
              >
                {/* Search Bar inside Dropdown */}
                <div className="p-4 border-b border-slate-50">
                  <div className="relative group">
                    <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors`} />
                    <input
                      type="text"
                      autoFocus
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={language === 'ar' ? 'ابحث عن محافظة...' : language === 'ku' ? 'بگەڕێ بۆ پارێزگا...' : 'Search governorate...'}
                      className={`w-full bg-slate-50 border-none rounded-2xl py-4 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                    />
                    {search && (
                      <button 
                        onClick={() => setSearch('')}
                        className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full`}
                      >
                        <X className="w-3 h-3 text-slate-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Options List */}
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                  {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-4">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching governorates...</p>
                    </div>
                  ) : governorates.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                        {language === 'ar' ? 'لم يتم العثور على محافظات' : language === 'ku' ? 'هیچ پارێزگایەک نەدۆزرایەوە' : 'No governorates found'}
                      </p>
                    </div>
                  ) : filteredGovernorates.length === 0 && search ? (
                    <div className="py-12 text-center">
                      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                        {language === 'ar' ? 'لا توجد نتائج للبحث' : language === 'ku' ? 'ئەنجامێک نەدۆزرایەوە' : 'No results found'}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* All Option */}
                      {!search && (
                        <button
                          onClick={() => handleSelect(null)}
                          className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${!selectedGovernorate ? 'bg-primary/5 text-primary' : 'hover:bg-slate-50 text-slate-600'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${!selectedGovernorate ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                              <MapPin className="w-4 h-4" />
                            </div>
                            {language === 'ar' ? 'كل العراق' : language === 'ku' ? 'هەموو عێراق' : 'All Iraq'}
                          </div>
                          {!selectedGovernorate && <Check className="w-4 h-4 text-primary" />}
                        </button>
                      )}

                      {filteredGovernorates.map((gov) => (
                        <button
                          key={gov}
                          onClick={() => handleSelect(gov)}
                          className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${selectedGovernorate === gov ? 'bg-primary/5 text-primary' : 'hover:bg-slate-50 text-slate-600'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedGovernorate === gov ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                              <MapPin className="w-4 h-4" />
                            </div>
                            {gov}
                          </div>
                          {selectedGovernorate === gov && <Check className="w-4 h-4 text-primary" />}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
