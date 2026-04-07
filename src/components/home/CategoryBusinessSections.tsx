import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, RefreshCw, SearchX } from 'lucide-react';
import type { Business } from '@/lib/supabase';
import { CATEGORIES } from '@/constants';
import { useHomeStore } from '@/stores/homeStore';
import BusinessCard from './BusinessCard';

interface CategoryBusinessSectionsProps {
  businesses: Business[];
  loading?: boolean;
  hasMore?: boolean;
  totalCount?: number;
  onLoadMore?: () => void;
  onBusinessClick?: (business: Business) => void;
}

const INITIAL_VISIBLE_PER_CATEGORY = 3;
const LOAD_MORE_STEP = 3;

export default function CategoryBusinessSections({
  businesses,
  loading,
  hasMore,
  totalCount = 0,
  onLoadMore,
  onBusinessClick
}: CategoryBusinessSectionsProps) {
  const { language } = useHomeStore();
  const [expandedCounts, setExpandedCounts] = useState<Record<string, number>>({});

  const categorySections = useMemo(() => {
    const grouped = new Map<string, Business[]>();

    businesses.forEach((business) => {
      const key = business.category || 'general';
      const list = grouped.get(key) || [];
      list.push(business);
      grouped.set(key, list);
    });

    return Array.from(grouped.entries())
      .map(([categoryId, items]) => {
        const featuredCount = items.filter((biz) => biz.isFeatured).length;
        const verifiedCount = items.filter((biz) => biz.isVerified).length;
        const densityScore = (featuredCount + verifiedCount) / Math.max(items.length, 1);
        const categoryMeta = CATEGORIES.find((category) => category.id === categoryId);
        const title = categoryMeta?.name[language] || categoryId;

        return {
          categoryId,
          items,
          title,
          count: items.length,
          densityScore
        };
      })
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        if (b.densityScore !== a.densityScore) return b.densityScore - a.densityScore;
        return a.title.localeCompare(b.title, language);
      });
  }, [businesses, language]);

  useEffect(() => {
    setExpandedCounts((prev) => {
      const next: Record<string, number> = {};
      categorySections.forEach(({ categoryId }) => {
        next[categoryId] = Math.max(prev[categoryId] || INITIAL_VISIBLE_PER_CATEGORY, INITIAL_VISIBLE_PER_CATEGORY);
      });
      return next;
    });
  }, [categorySections]);

  const translations = {
    noResults: { en: 'No results found', ar: 'لم يتم العثور على نتائج', ku: 'هیچ ئەنجامێک نەدۆزرایەوە' },
    noResultsDesc: {
      en: "We couldn't find any businesses matching your current filters. Try broadening your search.",
      ar: 'لم نتمكن من العثور على أي شركات تطابق الفلاتر الحالية. حاول توسيع نطاق بحثك.',
      ku: 'نەمانتوانی هیچ کارێک بدۆزینەوە کە لەگەڵ فلتەرەکانتدا بگونجێت.'
    },
    loadMoreInCategory: { en: 'Load More in Category', ar: 'تحميل المزيد في الفئة', ku: 'بارکردنی زیاتر لە پۆلەکەدا' },
    loadMore: { en: 'Load More Businesses', ar: 'تحميل المزيد من الشركات', ku: 'بارکردنی کاری زیاتر' },
    loading: { en: 'Loading...', ar: 'جاري التحميل...', ku: 'بارکردن...' },
    showing: { en: 'Showing', ar: 'عرض', ku: 'پیشاندانی' },
    of: { en: 'of', ar: 'من', ku: 'لە' }
  };

  if (loading && businesses.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 px-4 mb-24">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-[40px] overflow-hidden shadow-2xl shadow-slate-200/40 border border-slate-100 animate-pulse">
            <div className="aspect-[16/11] bg-slate-100" />
            <div className="p-8 space-y-4">
              <div className="h-6 bg-slate-100 rounded-xl w-3/4" />
              <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!loading && businesses.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-28 h-28 bg-slate-50 rounded-[32px] flex items-center justify-center mb-8 shadow-inner rotate-3">
          <SearchX className="w-14 h-14 text-slate-300" />
        </div>
        <h3 className="text-2xl font-black text-bg-dark mb-3 uppercase tracking-tighter">{translations.noResults[language]}</h3>
        <p className="text-sm text-slate-400 max-w-[360px] mb-8 leading-relaxed font-medium">{translations.noResultsDesc[language]}</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-14 px-4 pb-24">
      {categorySections.map((section) => {
        const visibleCount = expandedCounts[section.categoryId] || INITIAL_VISIBLE_PER_CATEGORY;
        const visibleItems = section.items.slice(0, visibleCount);
        const hasMoreInCategory = visibleCount < section.items.length;

        return (
          <section key={section.categoryId} className="space-y-7">
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-black text-bg-dark uppercase tracking-[0.16em]">{section.title}</h3>
              <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">{section.count}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {visibleItems.map((business, index) => (
                <motion.div key={business.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                  <BusinessCard biz={business} onClick={onBusinessClick} />
                </motion.div>
              ))}
            </div>

            {hasMoreInCategory && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setExpandedCounts((prev) => ({
                    ...prev,
                    [section.categoryId]: (prev[section.categoryId] || INITIAL_VISIBLE_PER_CATEGORY) + LOAD_MORE_STEP
                  }))}
                  className="px-8 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 hover:border-primary hover:text-primary transition-colors"
                >
                  {translations.loadMoreInCategory[language]}
                </button>
              </div>
            )}
          </section>
        );
      })}

      {hasMore && (
        <div className="flex flex-col items-center gap-6 py-10 bg-slate-50/60 rounded-[40px] border border-slate-100">
          <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
            {translations.showing[language]} <span className="text-bg-dark">{businesses.length}</span> {translations.of[language]} <span className="text-bg-dark">{totalCount}</span>
          </div>
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loading}
            className="px-10 py-4 bg-bg-dark text-white text-[11px] font-black uppercase tracking-[0.25em] rounded-2xl hover:bg-primary hover:text-bg-dark transition-colors disabled:opacity-50"
          >
            <span className="flex items-center gap-3">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {loading ? translations.loading[language] : translations.loadMore[language]}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
