import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useHomeStore } from "@/stores/homeStore";
import { ChevronDown, MapPin, X } from 'lucide-react';

const GOVERNORATES = [
  { name: "Baghdad", nameAr: "بغداد" },
  { name: "Erbil", nameAr: "أربيل" },
  { name: "Basra", nameAr: "البصرة" },
  { name: "Mosul", nameAr: "الموصل" },
  { name: "Sulaymaniyah", nameAr: "السليمانية" },
  { name: "Duhok", nameAr: "دهوك" },
  { name: "Kirkuk", nameAr: "كركوك" },
  { name: "Najaf", nameAr: "النجف" },
  { name: "Karbala", nameAr: "كربلاء" },
  { name: "Nasiriyah", nameAr: "الناصرية" },
  { name: "Amarah", nameAr: "العمارة" },
  { name: "Hilla", nameAr: "الحلة" },
  { name: "Kut", nameAr: "الكوت" },
  { name: "Diwaniyah", nameAr: "الديوانية" },
  { name: "Ramadi", nameAr: "الرمادي" },
  { name: "Baqubah", nameAr: "بعقوبة" },
  { name: "Samawah", nameAr: "السماوة" },
  { name: "Tikrit", nameAr: "تكريت" },
  { name: "Halabja", nameAr: "حلبجة" },
];

export default function LocationFilter() {
  const { selectedGovernorate, setGovernorate, setCity } = useHomeStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full mb-16 px-4">
      <div className="max-w-xl mx-auto flex flex-col items-center text-center">
        {/* Header Label */}
        <div className="flex items-center gap-2 text-[#2CA6A4] mb-4">
          <MapPin className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
            {selectedGovernorate ? "Location Active" : "Getting Started"}
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-[#2B2F33] poppins-bold mb-10 leading-tight tracking-tight">
          {selectedGovernorate 
            ? `Exploring ${selectedGovernorate}` 
            : "Please choose your governorate first"}
        </h2>

        {/* Custom Dropdown */}
        <div className="relative w-full">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full flex items-center justify-between px-8 py-5 rounded-[24px] border-2 transition-all duration-300 shadow-xl ${
              isOpen 
                ? "border-[#2CA6A4] bg-white ring-4 ring-[#2CA6A4]/10" 
                : "border-[#E5E7EB] bg-white hover:border-[#2CA6A4]/30"
            }`}
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
                {selectedGovernorate || "Select Governorate"}
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
                  {GOVERNORATES.map((gov) => (
                    <button
                      key={gov.name}
                      onClick={() => {
                        setGovernorate(gov.name);
                        setCity(null);
                        setIsOpen(false);
                      }}
                      className={`flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-200 group ${
                        selectedGovernorate === gov.name
                          ? "bg-[#2CA6A4] text-white"
                          : "hover:bg-[#F5F7F9] text-[#2B2F33]"
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-bold uppercase tracking-widest">{gov.name}</span>
                        <span className={`text-[10px] font-medium opacity-60 ${
                          selectedGovernorate === gov.name ? "text-white" : "text-[#6B7280]"
                        }`}>
                          {gov.nameAr}
                        </span>
                      </div>
                      {selectedGovernorate === gov.name && (
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
            <X className="w-3 h-3" /> Reset Location
          </motion.button>
        )}
      </div>
    </div>
  );
}
