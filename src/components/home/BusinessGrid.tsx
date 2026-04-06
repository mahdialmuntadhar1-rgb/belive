import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MapPin, Loader2, SearchX, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import { CATEGORIES } from '@/constants';

interface BusinessGridProps {
  businesses: Business[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onBusinessClick?: (business: Business) => void;
}

export default function BusinessGrid({ businesses, loading, hasMore, onLoadMore, onBusinessClick }: BusinessGridProps) {
  const { language } = useHomeStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const translations = {
    noResults: { en: 'No results found', ar: 'لم يتم العثور على نتائج', ku: 'هیچ ئەنجامێک نەدۆزرایەوە' },
    noResultsDesc: {
      en: "We couldn't find any businesses matching your current filters. Try broadening your search.",
      ar: 'لم نتمكن من العثور على أي شركات تطابق الفلاتر الحالية. حاول توسيع نطاق بحثك.',
      ku: 'نەمانتوانی هیچ کارێک بدۆزینەوە کە لەگەڵ فلتەرەکانتدا بگونجێت.'
    },
    seeMore: { en: 'See more', ar: 'عرض المزيد', ku: 'بینینی زیاتر' },
    seeLess: { en: 'See less', ar: 'عرض أقل', ku: 'بینینی کەمتر' },
    verified: { en: 'Verified', ar: 'موثق', ku: 'پشتڕاستکراوە' }
  };

  const getBusinessName = (biz: Business) => {
    if (language === 'ar' && biz.nameAr) return biz.nameAr;
    if (language === 'ku' && biz.nameKu) return biz.nameKu;
    return biz.name;
  };

  const getBusinessImage = (biz: Business) => {
    if (biz.image) return biz.image;
    
    const category = biz.category.toLowerCase();
    if (category.includes('dining') || category.includes('restaurant') || category.includes('food')) {
      return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=400&auto=format&fit=crop';
    }
    if (category.includes('furniture') || category.includes('home')) {
      return 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=400&auto=format&fit=crop';
    }
    if (category.includes('doctor') || category.includes('medical') || category.includes('clinic')) {
      return 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop';
    }
    if (category.includes('cafe') || category.includes('coffee')) {
      return 'https://images.unsplash.com/photo-1501339819398-ed495197ff21?q=80&w=400&auto=format&fit=crop';
    }
    if (category.includes('gym') || category.includes('fitness')) {
      return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop';
    }
    
    return `https://picsum.photos/seed/${biz.id}/400/400`;
  };

  if (loading && businesses.length === 0) return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-1 mb-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="aspect-square bg-slate-100 animate-pulse rounded-[32px]" />
      ))}
    </div>
  );

  if (!loading && businesses.length === 0) return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <SearchX className="w-10 h-10 text-slate-300 mb-4" />
      <h3 className="text-sm font-bold text-text-main mb-1 poppins-bold">{translations.noResults[language]}</h3>
      <p className="text-[10px] text-text-muted max-w-[200px]">{translations.noResultsDesc[language]}</p>
    </div>
  );

  const displayedBusinesses = isExpanded ? businesses : businesses.slice(0, 6);

  return (
    <div className="w-full mb-12">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5 px-1">
        <AnimatePresence mode="popLayout">
          {displayedBusinesses.map((biz) => (
            <motion.div
              key={biz.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => onBusinessClick?.(biz)}
              className="group relative flex flex-col bg-white rounded-[32px] overflow-hidden shadow-social cursor-pointer border border-slate-100 transition-all duration-500 hover:shadow-2xl hover:border-primary/30"
            >
              {/* Piece 1: Image */}
              <div className="aspect-[4/3] w-full overflow-hidden relative">
                <img 
                  src={getBusinessImage(biz)} 
                  alt={biz.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <div className="flex items-center gap-1 glass-dark px-2 py-1 rounded-lg border border-white/20">
                    <Star className="w-2 h-2 text-secondary fill-secondary" />
                    <span className="text-[8px] font-black text-white">{biz.rating?.toFixed(1) || '5.0'}</span>
                  </div>
                </div>
              </div>
              
              {/* Piece 2: Information */}
              <div className="p-4 flex flex-col flex-1 bg-white">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[11px] font-black text-text-main poppins-bold leading-tight line-clamp-1 uppercase tracking-tight group-hover:text-primary transition-colors">
                    {getBusinessName(biz)}
                  </h3>
                  {biz.isVerified && (
                    <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
                  )}
                </div>
                
                <div className="flex items-center gap-1 text-text-muted text-[8px] font-black uppercase tracking-widest mt-auto">
                  <MapPin className="w-2.5 h-2.5 text-primary" />
                  <span className="truncate">{biz.governorate}</span>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {businesses.length > 6 && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-3 px-10 py-4 glass border border-slate-200 text-text-main text-[11px] font-black rounded-2xl hover:bg-bg-dark hover:text-white transition-all uppercase tracking-[0.2em] shadow-social active:scale-95"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                {translations.seeLess[language]}
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                {translations.seeMore[language]}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
