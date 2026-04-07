import React, { useState } from 'react';
import { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import BusinessGrid from './BusinessGrid';
import { LucideIcon } from 'lucide-react';

interface CategorySectionProps {
  category: {
    id: string;
    name: { en: string; ar: string; ku: string };
    icon: LucideIcon;
    isHot?: boolean;
    [key: string]: any;
  };
  businesses: Business[];
  loading: boolean;
  onBusinessClick: (biz: Business) => void;
}

export default function CategorySection({ category, businesses, loading, onBusinessClick }: CategorySectionProps) {
  const { language } = useHomeStore();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const initialCount = 3;
  const visibleBusinesses = isExpanded ? businesses : businesses.slice(0, initialCount);

  if (businesses.length === 0 && !loading) return null;

  return (
    <div className="space-y-6">
      {/* Category Header - Right Aligned like the image */}
      <div className="flex items-center justify-end gap-4 px-1">
        <div className="text-right">
          <h2 className="text-2xl font-black text-bg-dark poppins-bold leading-tight">
            {category.name[language]}
          </h2>
          <p className="text-[11px] font-bold text-slate-400">
            {businesses.length} {language === 'ar' ? 'منشأة متوفرة' : language === 'ku' ? 'شوێنی بەردەست' : 'establishments available'}
          </p>
        </div>
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-primary border border-slate-100 shadow-sm">
          <category.icon className="w-6 h-6" />
        </div>
      </div>
      
      {/* Business Grid - Shows 3 initially */}
      <BusinessGrid 
        businesses={visibleBusinesses} 
        loading={loading}
        onBusinessClick={onBusinessClick}
      />

      {/* Independent Load More / Less Button - "Stuck" to the section */}
      {businesses.length > initialCount && (
        <div className="flex justify-center -mt-6 relative z-10">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="group flex items-center gap-3 px-8 py-3 bg-white border border-slate-200 rounded-full text-[11px] font-black text-slate-500 uppercase tracking-widest hover:border-primary hover:text-primary transition-all duration-300 shadow-sm active:scale-95"
          >
            <div className={`w-1.5 h-1.5 rounded-full bg-primary ${!isExpanded ? 'animate-pulse' : ''}`} />
            <span>
              {isExpanded 
                ? (language === 'ar' ? 'عرض أقل' : language === 'ku' ? 'بینینی کەمتر' : 'Show Less')
                : (language === 'ar' ? `عرض المزيد` : language === 'ku' ? `بینینی زیاتر` : `Load More`)
              }
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
