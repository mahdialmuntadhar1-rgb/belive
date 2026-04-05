import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { useHomeStore } from '@/stores/homeStore';

interface ChipItem {
  id: string;
  name: {
    en: string;
    ar: string;
    ku: string;
  };
  icon?: any;
}

interface ChipSelectorProps {
  items: ChipItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  title?: string;
  rows?: number;
}

export default function ChipSelector({ items, selectedId, onSelect, title, rows = 2 }: ChipSelectorProps) {
  const { language } = useHomeStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Split items into rows
  const itemsPerRow = Math.ceil(items.length / rows);
  const rowItems = Array.from({ length: rows }, (_, i) => 
    items.slice(i * itemsPerRow, (i + 1) * itemsPerRow)
  );

  return (
    <div className="w-full mb-6">
      {title && (
        <div className="flex items-center justify-between mb-3 px-4">
          <h3 className="text-sm font-black text-[#2B2F33] uppercase tracking-widest opacity-70">
            {title}
          </h3>
          {selectedId && (
            <button 
              onClick={() => onSelect(null)}
              className="text-[10px] font-black text-[#2CA6A4] uppercase tracking-widest hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      )}
      
      <div className="flex flex-col gap-3">
        {rowItems.map((row, rowIndex) => (
          <div 
            key={rowIndex}
            className="flex overflow-x-auto no-scrollbar gap-2 px-4 pb-1"
          >
            {row.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedId === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelect(isSelected ? null : item.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border-2 transition-all duration-300 ${
                    isSelected 
                      ? "bg-[#2CA6A4] border-[#2CA6A4] text-white shadow-lg shadow-[#2CA6A4]/20" 
                      : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#2CA6A4]/30"
                  }`}
                >
                  {Icon && <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-[#2CA6A4]"}`} />}
                  <span className="text-xs font-bold whitespace-nowrap poppins-bold">
                    {item.name[language as keyof typeof item.name]}
                  </span>
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
