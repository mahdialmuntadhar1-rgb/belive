import React, { useState } from 'react';
import { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import BusinessGrid from './BusinessGrid';
import { LucideIcon } from 'lucide-react';

interface CategorySectionProps {
  key?: string | number;
  category: {
    id: string;
    name: { en: string; ar: string; ku: string };
    icon: LucideIcon;
    isHot?: boolean;
    [key: string]: any;
  };
  businesses: Business[];
  loading: boolean;
  onRefresh?: () => void;
  onBusinessClick: (biz: Business) => void;
}

export default function CategorySection({ category, businesses, loading, onRefresh, onBusinessClick }: CategorySectionProps) {
  const { language } = useHomeStore();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const initialCount = 3;
  const visibleBusinesses = isExpanded ? businesses : businesses.slice(0, initialCount);

  const getCategoryStyles = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('rest') || c.includes('food')) return { bg: 'bg-orange-50/50', text: 'text-orange-600', iconBg: 'bg-orange-100', iconText: 'text-orange-600' };
    if (c.includes('cafe') || c.includes('coffee')) return { bg: 'bg-amber-50/50', text: 'text-amber-700', iconBg: 'bg-amber-100', iconText: 'text-amber-700' };
    if (c.includes('hotel')) return { bg: 'bg-blue-50/50', text: 'text-blue-700', iconBg: 'bg-blue-100', iconText: 'text-blue-700' };
    if (c.includes('med') || c.includes('pharm') || c.includes('hosp')) return { bg: 'bg-cyan-50/50', text: 'text-cyan-700', iconBg: 'bg-cyan-100', iconText: 'text-cyan-700' };
    return { bg: 'bg-slate-50/50', text: 'text-primary', iconBg: 'bg-primary/10', iconText: 'text-primary' };
  };

  const styles = getCategoryStyles(category.name.en);

  if (businesses.length === 0 && !loading) return null;

  return (
    <div className={`py-12 sm:py-16 px-4 sm:px-6 rounded-[40px] ${styles.bg} border border-white/50 space-y-10`}>
      {/* Category Header - Centered */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={`w-16 h-16 ${styles.iconBg} rounded-[24px] flex items-center justify-center ${styles.iconText} shadow-sm border border-white/20`}>
          <category.icon className="w-8 h-8" />
        </div>
        <div>
          <h2 className={`text-3xl sm:text-4xl font-black ${styles.text} poppins-bold leading-tight uppercase tracking-tighter`}>
            {category.name[language]}
          </h2>
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className={`w-1.5 h-1.5 rounded-full ${styles.iconBg}`} />
            <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em]">
              {businesses.length} {language === 'ar' ? 'منشأة متوفرة' : language === 'ku' ? 'شوێنی بەردەست' : 'establishments available'}
            </p>
            <div className={`w-1.5 h-1.5 rounded-full ${styles.iconBg}`} />
          </div>
        </div>
      </div>
      
      {/* Business Grid - Shows 3 initially */}
      <div className="max-w-7xl mx-auto">
        <BusinessGrid 
          businesses={visibleBusinesses} 
          loading={loading}
          onRefresh={onRefresh}
          onBusinessClick={onBusinessClick}
        />
      </div>

      {/* Independent Load More / Less Button */}
      {businesses.length > initialCount && (
        <div className="flex justify-center relative z-10">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="group flex items-center gap-4 px-10 py-4 bg-white border border-slate-100 rounded-2xl text-[11px] font-black text-text-main uppercase tracking-[0.2em] hover:border-primary hover:text-primary transition-all duration-500 shadow-premium active:scale-95"
          >
            <div className={`w-2 h-2 rounded-full bg-primary ${!isExpanded ? 'animate-pulse' : ''}`} />
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
