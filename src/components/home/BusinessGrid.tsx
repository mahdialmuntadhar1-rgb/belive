import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, SearchX, RefreshCw } from 'lucide-react';
import { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import BusinessCard from './BusinessCard';

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
    showing: { en: 'Showing', ar: 'عرض', ku: 'پیشاندانی' },
    of: { en: 'of', ar: 'من', ku: 'لە' }
  };

  if (loading && businesses.length === 0) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 px-4 mb-24">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-[40px] overflow-hidden shadow-2xl shadow-slate-200/40 border border-slate-100 animate-pulse">
          <div className="aspect-[16/11] bg-slate-100 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          </div>
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-3 flex-1">
                <div className="h-6 bg-slate-100 rounded-xl w-3/4" />
                <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
              </div>
              <div className="w-14 h-14 bg-slate-100 rounded-2xl shrink-0" />
            </div>
            <div className="pt-6 flex gap-4">
              <div className="h-14 bg-slate-100 rounded-2xl flex-1" />
              <div className="h-14 bg-slate-100 rounded-2xl w-14" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (!loading && businesses.length === 0) return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-32 px-4 text-center"
    >
      <div className="w-32 h-32 bg-slate-50 rounded-[40px] flex items-center justify-center mb-10 shadow-inner rotate-3">
        <SearchX className="w-16 h-16 text-slate-300" />
      </div>
      <h3 className="text-3xl font-black text-bg-dark mb-4 poppins-bold uppercase tracking-tighter">{translations.noResults[language]}</h3>
      <p className="text-sm text-slate-400 max-w-[360px] mb-12 leading-relaxed font-medium">{translations.noResultsDesc[language]}</p>
      <button 
        onClick={() => window.location.reload()}
        className="flex items-center gap-4 px-10 py-5 bg-bg-dark text-white text-[11px] font-black rounded-2xl uppercase tracking-[0.25em] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all group"
      >
        <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
        {language === 'ar' ? 'إعادة ضبط الفلاتر' : language === 'ku' ? 'پاککردنەوەی فلتەرەکان' : 'Reset All Filters'}
      </button>
    </motion.div>
  );

  return (
    <div className="w-full mb-24 space-y-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
        <AnimatePresence mode="popLayout">
          {businesses.map((biz, idx) => (
            <motion.div
              key={biz.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <BusinessCard
                biz={biz}
                onClick={onBusinessClick}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div className="flex flex-col items-center gap-8 py-16 bg-slate-50/50 rounded-[60px] border border-slate-100 mx-4">
          <div className="flex flex-col items-center gap-3">
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
              {translations.showing[language]} <span className="text-bg-dark">{businesses.length}</span> {translations.of[language]} <span className="text-bg-dark">{totalCount}</span>
            </div>
            <div className="w-64 h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-accent"
                initial={{ width: 0 }}
                animate={{ width: `${(businesses.length / totalCount) * 100}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </div>

          <button
            onClick={onLoadMore}
            disabled={loading}
            className="group relative px-16 py-6 bg-bg-dark text-white text-[12px] font-black uppercase tracking-[0.35em] rounded-[28px] hover:bg-primary hover:text-bg-dark transition-all duration-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] hover:shadow-primary/30 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-4">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {translations.loading[language]}
                </>
              ) : (
                <>
                  {translations.loadMore[language]}
                  <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-1000" />
                </>
              )}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
