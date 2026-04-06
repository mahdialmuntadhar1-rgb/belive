import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MapPin, Loader2, SearchX, CheckCircle2, Phone, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import { CATEGORIES } from '@/constants';

interface BusinessGridProps {
  businesses: Business[];
  loading?: boolean;
  hasMore?: boolean;
  totalCount?: number;
  onLoadMore?: () => void;
  onBusinessClick?: (business: Business) => void;
}

export default function BusinessGrid({ 
  businesses, 
  loading, 
  hasMore, 
  totalCount = 0,
  onLoadMore, 
  onBusinessClick 
}: BusinessGridProps) {
  const { language } = useHomeStore();

  const translations = {
    noResults: { en: 'No results found', ar: 'لم يتم العثور على نتائج', ku: 'هیچ ئەنجامێک نەدۆزرایەوە' },
    noResultsDesc: {
      en: "We couldn't find any businesses matching your current filters. Try broadening your search.",
      ar: 'لم نتمكن من العثور على أي شركات تطابق الفلاتر الحالية. حاول توسيع نطاق بحثك.',
      ku: 'نەمانتوانی هیچ کارێک بدۆزینەوە کە لەگەڵ فلتەرەکانتدا بگونجێت.'
    },
    loadMore: { en: 'Load More', ar: 'تحميل المزيد', ku: 'بارکردنی زیاتر' },
    loading: { en: 'Loading...', ar: 'جاري التحميل...', ku: 'بارکردن...' },
    verified: { en: 'Verified', ar: 'موثق', ku: 'پشتڕاستکراوە' },
    call: { en: 'Call', ar: 'اتصال', ku: 'پەیوەندی' },
    showing: { en: 'Showing', ar: 'عرض', ku: 'پیشاندانی' },
    of: { en: 'of', ar: 'من', ku: 'لە' }
  };

  const getBusinessName = (biz: Business) => {
    if (language === 'ar' && biz.nameAr) return biz.nameAr;
    if (language === 'ku' && biz.nameKu) return biz.nameKu;
    return biz.name;
  };

  const getBusinessImage = (biz: Business) => {
    if (biz.image) return biz.image;
    const cat = CATEGORIES.find(c => c.id === biz.category);
    return cat?.image || `https://picsum.photos/seed/${biz.id}/600/400`;
  };

  if (loading && businesses.length === 0) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4 mb-12">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 animate-pulse">
          <div className="aspect-[16/10] bg-slate-100" />
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-slate-100 rounded-lg w-3/4" />
                <div className="h-3 bg-slate-100 rounded-lg w-1/2" />
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
            </div>
            <div className="pt-4 flex gap-3">
              <div className="h-12 bg-slate-100 rounded-2xl flex-1" />
              <div className="h-12 bg-slate-100 rounded-2xl w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (!loading && businesses.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
        <SearchX className="w-12 h-12 text-slate-300" />
      </div>
      <h3 className="text-xl font-black text-text-main mb-3 poppins-bold uppercase tracking-tight">{translations.noResults[language]}</h3>
      <p className="text-sm text-text-muted max-w-[320px] mb-10 leading-relaxed">{translations.noResultsDesc[language]}</p>
      <button 
        onClick={() => window.location.reload()}
        className="flex items-center gap-3 px-8 py-4 bg-primary text-bg-dark text-xs font-black rounded-2xl uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
      >
        <RefreshCw className="w-4 h-4" />
        Reset Filters
      </button>
    </div>
  );

  return (
    <div className="w-full mb-12 space-y-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
        <AnimatePresence mode="popLayout">
          {businesses.map((biz, index) => (
            <motion.div
              key={biz.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index % 6) * 0.1 }}
              className="group relative flex flex-col bg-white rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
            >
              {/* Image Section */}
              <div 
                className="aspect-[16/10] w-full overflow-hidden relative cursor-pointer"
                onClick={() => onBusinessClick?.(biz)}
              >
                <img 
                  src={getBusinessImage(biz)} 
                  alt={biz.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <div className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl shadow-lg flex items-center gap-2 border border-white/20">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[9px] font-black text-bg-dark uppercase tracking-widest">
                      {CATEGORIES.find(c => c.id === biz.category)?.name[language] || biz.category}
                    </span>
                  </div>
                </div>

                {/* Rating Badge */}
                <div className="absolute bottom-4 right-4">
                  <div className="px-3 py-1.5 bg-bg-dark/80 backdrop-blur-md rounded-xl shadow-lg flex items-center gap-2 border border-white/10">
                    <Star className="w-3 h-3 text-primary fill-primary" />
                    <span className="text-[10px] font-black text-white">{biz.rating?.toFixed(1) || '5.0'}</span>
                  </div>
                </div>
              </div>
              
              {/* Info Section */}
              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 
                      className="text-lg font-black text-text-main poppins-bold uppercase tracking-tight group-hover:text-primary transition-colors cursor-pointer line-clamp-1"
                      onClick={() => onBusinessClick?.(biz)}
                    >
                      {getBusinessName(biz)}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-text-muted">
                      <MapPin className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{biz.governorate} • {biz.city}</span>
                    </div>
                  </div>
                  {biz.isVerified && (
                    <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary" title={translations.verified[language]}>
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  )}
                </div>
                
                <div className="mt-auto flex items-center gap-3">
                  <button 
                    onClick={() => onBusinessClick?.(biz)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-bg-dark text-white text-[10px] font-black rounded-2xl uppercase tracking-widest hover:bg-primary hover:text-bg-dark transition-all duration-300 shadow-lg shadow-bg-dark/10"
                  >
                    <span className="hidden sm:inline">View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <a 
                    href={`tel:${biz.phone}`}
                    className="w-12 h-12 flex items-center justify-center bg-slate-50 text-text-main rounded-2xl hover:bg-primary hover:text-bg-dark transition-all duration-300 border border-slate-100 group/btn"
                  >
                    <Phone className="w-4 h-4 transition-transform group-hover/btn:rotate-12" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div className="flex flex-col items-center gap-6 py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
              {translations.showing[language]} {businesses.length} {translations.of[language]} {totalCount}
            </div>
            <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(businesses.length / totalCount) * 100}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          <button
            onClick={onLoadMore}
            disabled={loading}
            className="group relative px-12 py-5 bg-white border-2 border-bg-dark text-bg-dark text-[11px] font-black uppercase tracking-[0.3em] rounded-[24px] hover:bg-bg-dark hover:text-white transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-xl shadow-slate-200"
          >
            <span className="relative z-10 flex items-center gap-3">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {translations.loading[language]}
                </>
              ) : (
                <>
                  {translations.loadMore[language]}
                  <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                </>
              )}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
