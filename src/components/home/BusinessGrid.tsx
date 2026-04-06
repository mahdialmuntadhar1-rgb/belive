import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MapPin, Loader2, SearchX, CheckCircle2, Phone, ArrowRight } from 'lucide-react';
import { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';

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
    call: { en: 'Call', ar: 'اتصال', ku: 'پەیوەندی' }
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 mb-12">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100 animate-pulse">
          <div className="aspect-[4/3] bg-slate-100" />
          <div className="p-5 space-y-3">
            <div className="h-4 bg-slate-100 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
            <div className="pt-4 flex gap-2">
              <div className="h-8 bg-slate-100 rounded-xl flex-1" />
              <div className="h-8 bg-slate-100 rounded-xl w-10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (!loading && businesses.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
        <SearchX className="w-10 h-10 text-slate-300" />
      </div>
      <h3 className="text-lg font-black text-text-main mb-2 poppins-bold">{translations.noResults[language]}</h3>
      <p className="text-sm text-text-muted max-w-[280px] mb-8">{translations.noResultsDesc[language]}</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-primary text-bg-dark text-xs font-black rounded-xl uppercase tracking-widest shadow-lg shadow-primary/20"
      >
        Reset Filters
      </button>
    </div>
  );

  return (
    <div className="w-full mb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4">
        <AnimatePresence mode="popLayout">
          {businesses.map((biz) => (
            <motion.div
              key={biz.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group relative flex flex-col bg-white rounded-[32px] overflow-hidden shadow-social border border-slate-100 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
            >
              {/* Image Section */}
              <div 
                className="aspect-[4/3] w-full overflow-hidden relative cursor-pointer"
                onClick={() => onBusinessClick?.(biz)}
              >
                <img 
                  src={getBusinessImage(biz)} 
                  alt={biz.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {biz.isVerified && (
                    <div className="flex items-center gap-1.5 bg-primary px-2.5 py-1 rounded-full shadow-lg">
                      <CheckCircle2 className="w-3 h-3 text-bg-dark" />
                      <span className="text-[9px] font-black text-bg-dark uppercase tracking-wider">{translations.verified[language]}</span>
                    </div>
                  )}
                </div>

                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1.5 glass-dark px-2.5 py-1 rounded-full border border-white/20 shadow-lg">
                    <Star className="w-3 h-3 text-secondary fill-secondary" />
                    <span className="text-[10px] font-black text-white">{biz.rating?.toFixed(1) || '5.0'}</span>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <span className="px-2 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-[8px] font-black text-white uppercase tracking-widest">
                    {biz.category}
                  </span>
                </div>
              </div>
              
              {/* Info Section */}
              <div className="p-5 flex flex-col flex-1">
                <div className="mb-4">
                  <h3 
                    className="text-sm font-black text-text-main poppins-bold leading-tight mb-1 line-clamp-1 uppercase tracking-tight group-hover:text-primary transition-colors cursor-pointer"
                    onClick={() => onBusinessClick?.(biz)}
                  >
                    {getBusinessName(biz)}
                  </h3>
                  <div className="flex items-center gap-1 text-text-muted text-[10px] font-bold">
                    <MapPin className="w-3 h-3 text-primary" />
                    <span className="truncate">{biz.governorate} • {biz.city}</span>
                  </div>
                </div>
                
                <div className="mt-auto flex items-center gap-2">
                  <a 
                    href={`tel:${biz.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-primary hover:text-bg-dark text-text-main rounded-xl transition-all duration-300 border border-slate-100 group/btn"
                  >
                    <Phone className="w-3.5 h-3.5 transition-transform group-hover/btn:rotate-12" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{translations.call[language]}</span>
                  </a>
                  <button 
                    onClick={() => onBusinessClick?.(biz)}
                    className="w-10 h-10 flex items-center justify-center bg-bg-dark text-white rounded-xl hover:bg-primary hover:text-bg-dark transition-all duration-300 shadow-md"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div className="mt-12 flex flex-col items-center gap-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {businesses.length} / {totalCount} {language === 'ar' ? 'شركات' : language === 'ku' ? 'کارەکان' : 'Businesses'}
          </p>
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="flex items-center gap-3 px-12 py-4 bg-bg-dark text-white text-[11px] font-black rounded-2xl hover:bg-primary hover:text-bg-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-[0.2em] shadow-xl active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {translations.loading[language]}
              </>
            ) : (
              <>
                {translations.loadMore[language]}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
