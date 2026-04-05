import React from 'react';
import { motion } from 'motion/react';
import { Star, MapPin, Loader2, SearchX, CheckCircle2 } from 'lucide-react';
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

  const translations = {
    noResults: {
      en: 'No results found',
      ar: 'لم يتم العثور على نتائج',
      ku: 'هیچ ئەنجامێک نەدۆزرایەوە'
    },
    noResultsDesc: {
      en: "We couldn't find any businesses matching your current filters or search query. Try broadening your search.",
      ar: 'لم نتمكن من العثور على أي شركات تطابق الفلاتر الحالية أو استعلام البحث. حاول توسيع نطاق بحثك.',
      ku: 'نەمانتوانی هیچ کارێک بدۆزینەوە کە لەگەڵ فلتەرەکانت یان گەڕانەکەتدا بگونجێت. هەوڵبدە گەڕانەکەت فراوانتر بکەیت.'
    },
    resetFilters: {
      en: 'Reset Filters',
      ar: 'إعادة ضبط الفلاتر',
      ku: 'سڕینەوەی فلتەرەکان'
    },
    loadingMore: {
      en: 'Loading more places...',
      ar: 'جاري تحميل المزيد من الأماكن...',
      ku: 'بارکردنی شوێنی زیاتر...'
    },
    loadMore: {
      en: 'Load More Results',
      ar: 'تحميل المزيد من النتائج',
      ku: 'بارکردنی ئەنجامی زیاتر'
    },
    endOfDirectory: {
      en: "You've reached the end of the directory",
      ar: 'لقد وصلت إلى نهاية الدليل',
      ku: 'گەیشتیتە کۆتایی دایرێکتۆرییەکە'
    },
    verified: {
      en: 'Verified',
      ar: 'موثق',
      ku: 'پشتڕاستکراوە'
    }
  };

  const getBusinessName = (biz: Business) => {
    if (language === 'ar' && biz.nameAr) return biz.nameAr;
    if (language === 'ku' && biz.nameKu) return biz.nameKu;
    return biz.name;
  };

  const getCategoryName = (catId: string) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    if (!cat) return catId.replace('_', ' ');
    return cat.name[language as keyof typeof cat.name];
  };

  // Initial loading state (skeleton)
  if (loading && businesses.length === 0) return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 mb-12">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="aspect-[4/3] bg-slate-100 animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-slate-100 animate-pulse rounded w-3/4" />
            <div className="h-3 bg-slate-100 animate-pulse rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  // Empty state
  if (!loading && businesses.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
        <SearchX className="w-10 h-10 text-text-muted" />
      </div>
      <h3 className="text-xl font-bold text-text-main mb-3 poppins-bold">{translations.noResults[language]}</h3>
      <p className="text-sm text-text-muted max-w-xs leading-relaxed">
        {translations.noResultsDesc[language]}
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-8 px-6 py-2.5 bg-primary text-white font-bold rounded-full text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
      >
        {translations.resetFilters[language]}
      </button>
    </div>
  );

  return (
    <div id="explore-section" className="px-4 mb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {businesses.map((biz) => (
          <motion.div
            key={biz.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            onClick={() => onBusinessClick?.(biz)}
            className="group relative aspect-square rounded-[40px] overflow-hidden transition-all duration-500 border-4 border-transparent hover:border-primary shadow-xl shadow-black/5 cursor-pointer"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src={biz.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop'} 
                alt={biz.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-500 group-hover:from-black/95" />
            </div>

            {/* Content */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end items-start text-left">
              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                <span className="px-3 py-1.5 bg-primary text-white text-[10px] font-black rounded-xl shadow-xl uppercase tracking-widest border border-white/20">
                  {getCategoryName(biz.category)}
                </span>
                {biz.isVerified && (
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-white px-3 py-1.5 rounded-xl shadow-xl border border-white/20 w-fit">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-widest">{translations.verified[language]}</span>
                  </div>
                )}
              </div>

              <div className="absolute top-6 right-6">
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xl border border-white/20">
                  <Star className="w-3.5 h-3.5 text-secondary fill-secondary" />
                  <span className="text-[11px] font-black text-white">{biz.rating?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>

              <h3 className="text-2xl font-black text-white mb-2 poppins-bold leading-tight tracking-tight group-hover:text-primary transition-colors">
                {getBusinessName(biz)}
              </h3>
              
              <div className="flex items-center gap-2 text-white/70 text-sm font-medium">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="line-clamp-1">{biz.city}, {biz.governorate}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More Section */}
      {(hasMore || loading) && (
        <div className="mt-16 flex flex-col items-center gap-4">
          {loading ? (
            <div className="flex items-center gap-3 text-primary font-bold text-sm animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{translations.loadingMore[language]}</span>
            </div>
          ) : (
            <button
              onClick={onLoadMore}
              className="group relative px-10 py-4 bg-white border-2 border-slate-200 text-primary font-black rounded-2xl hover:border-primary hover:bg-primary hover:text-white transition-all duration-500 shadow-xl shadow-black/5 flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10 uppercase tracking-[0.2em] text-xs">{translations.loadMore[language]}</span>
              <div className="relative z-10 w-6 h-6 bg-slate-50 group-hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                <Loader2 className="w-3.5 h-3.5 group-hover:animate-spin" />
              </div>
            </button>
          )}
          
          {!hasMore && !loading && businesses.length > 0 && (
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-4">
              {translations.endOfDirectory[language]}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
