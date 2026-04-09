import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, MapPin, Building2, Sparkles } from 'lucide-react';
import type { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import { CATEGORIES, GOVERNORATES } from '@/constants';
import BusinessCard from './BusinessCard';
import CityDropdown from './CityDropdown';

interface MyCityProps {
  businesses: Business[];
  loading: boolean;
  hasMore: boolean;
  totalCount: number;
  onBusinessClick: (business: Business) => void;
  onLoadMore: () => void;
}

const ITEMS_PER_BATCH = 3;

export default function MyCity({ 
  businesses, 
  loading, 
  hasMore, 
  totalCount,
  onBusinessClick, 
  onLoadMore 
}: MyCityProps) {
  const { 
    language, 
    selectedGovernorate, 
    selectedCity, 
    categoryDisplayCounts,
    incrementCategoryDisplay,
    resetCategoryDisplay,
    setGovernorate 
  } = useHomeStore();

  const isRTL = language === 'ar' || language === 'ku';

  // Group businesses by category - maintains stable order from CATEGORIES
  const businessesByCategory = useMemo(() => {
    const grouped: Record<string, Business[]> = {};
    
    // Initialize all categories in stable order
    CATEGORIES.forEach(cat => {
      grouped[cat.id] = [];
    });
    grouped['other'] = [];

    // Track unknown categories for dev warning
    const unknownCategories = new Set<string>();

    // Group businesses
    businesses.forEach(business => {
      const matchedCategory = CATEGORIES.find(c => c.id === business.category);
      if (!matchedCategory && business.category) {
        unknownCategories.add(business.category);
      }
      const categoryId = matchedCategory?.id || 'other';
      if (!grouped[categoryId]) grouped[categoryId] = [];
      grouped[categoryId].push(business);
    });

    // Runtime guard: warn about DB taxonomy mismatch
    if (unknownCategories.size > 0 && process.env.NODE_ENV === 'development') {
      console.warn('[MyCity] Unknown categories in DB (not in constants.ts):', Array.from(unknownCategories));
    }

    // Only return categories that have businesses, maintaining CATEGORIES order
    const orderedEntries: [string, Business[]][] = [];
    CATEGORIES.forEach(cat => {
      if (grouped[cat.id]?.length > 0) {
        orderedEntries.push([cat.id, grouped[cat.id]]);
      }
    });
    if (grouped['other']?.length > 0) {
      orderedEntries.push(['other', grouped['other']]);
    }
    
    return Object.fromEntries(orderedEntries);
  }, [businesses]);

  // Stable category order from CATEGORIES
  const categoryIds = useMemo(() => {
    const ordered: string[] = [];
    CATEGORIES.forEach(cat => {
      if (businessesByCategory[cat.id]?.length > 0) ordered.push(cat.id);
    });
    if (businessesByCategory['other']?.length > 0) ordered.push('other');
    return ordered;
  }, [businessesByCategory]);
  const hasCategories = categoryIds.length > 0;

  const translations = {
    allIraq: {
      en: 'All Iraq',
      ar: 'كل العراق',
      ku: 'هەموو عێراق'
    },
    showing: {
      en: 'Showing',
      ar: 'عرض',
      ku: 'پیشاندان'
    },
    of: {
      en: 'of',
      ar: 'من',
      ku: 'لە'
    },
    businesses: {
      en: 'businesses',
      ar: 'نشاط تجاري',
      ku: 'کارەکان'
    },
    loadMore: {
      en: 'Load More',
      ar: 'عرض المزيد',
      ku: 'زیاتر ببینە'
    },
    showLess: {
      en: 'Show Less',
      ar: 'عرض أقل',
      ku: 'کەمتر ببینە'
    },
    noBusinesses: {
      en: 'No businesses found in this area',
      ar: 'لم يتم العثور على نشاط تجاري في هذه المنطقة',
      ku: 'هیچ کارێک نەدۆزرایەوە لەم ناوچەیە'
    },
    selectCity: {
      en: 'Select a city to explore',
      ar: 'اختر مدينة للاستكشاف',
      ku: 'شارێک هەڵبژێرە بۆ گەڕان'
    },
    discoverByCategory: {
      en: 'Discover by Category',
      ar: 'استكشف حسب الفئة',
      ku: 'دۆزینەوە بەپێی پۆلە'
    }
  };

  // Get display count for category (incremental: 3, 6, 9...)
  const getDisplayCount = (categoryId: string, totalCount: number) => {
    const savedCount = categoryDisplayCounts[categoryId];
    if (savedCount) return Math.min(savedCount, totalCount);
    return Math.min(ITEMS_PER_BATCH, totalCount);
  };

  // Handle load more: increment by 3
  const handleLoadMore = (categoryId: string, totalCount: number, currentCount: number) => {
    if (currentCount >= totalCount) {
      // At max, reset to 3 (Show Less behavior)
      resetCategoryDisplay(categoryId);
    } else {
      // Increment by 3
      incrementCategoryDisplay(categoryId, totalCount);
    }
  };

  if (loading && businesses.length === 0) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-48 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-48 bg-slate-100 rounded-2xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* City Filter Bar */}
      <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Governorate Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto pb-2 sm:pb-0">
            <button
              onClick={() => setGovernorate('')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                !selectedGovernorate
                  ? 'bg-bg-dark text-white shadow-lg'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              {translations.allIraq[language]}
            </button>
            
            {GOVERNORATES.slice(0, 6).map((gov) => (
              <button
                key={gov.id}
                onClick={() => setGovernorate(gov.id)}
                className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wide whitespace-nowrap transition-all ${
                  selectedGovernorate === gov.id
                    ? 'bg-primary text-bg-dark shadow-md'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {gov.name[language]}
              </button>
            ))}
            
            <div className="hidden sm:block">
              <CityDropdown governorateId={selectedGovernorate} />
            </div>
          </div>

          {/* Count Display */}
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>{translations.showing[language]} {businesses.length} {translations.of[language]} {totalCount} {translations.businesses[language]}</span>
          </div>
        </div>

        {/* Selected Location Display */}
        {(selectedGovernorate || selectedCity) && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-bold text-slate-600">
              {selectedCity 
                ? `${selectedCity}, ${selectedGovernorate ? GOVERNORATES.find(g => g.id === selectedGovernorate)?.name[language] : ''}`
                : GOVERNORATES.find(g => g.id === selectedGovernorate)?.name[language]
              }
            </span>
            <button 
              onClick={() => {
                setGovernorate('');
              }}
              className="ml-2 text-[10px] text-slate-400 hover:text-red-500 underline"
            >
              {language === 'ar' ? 'مسح' : language === 'ku' ? 'سڕینەوە' : 'Clear'}
            </button>
          </div>
        )}
      </div>

      {/* Category Sections */}
      {!hasCategories && !loading ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-400 font-bold text-sm">
            {translations.noBusinesses[language]}
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {categoryIds.map((categoryId, categoryIndex) => {
            const category = CATEGORIES.find(c => c.id === categoryId) || {
              id: 'other',
              name: { en: 'Other', ar: 'أخرى', ku: 'ئەوانی تر' },
              icon: Building2
            };
            
            const categoryBusinesses = businessesByCategory[categoryId];
            const totalInCategory = categoryBusinesses.length;
            const displayCount = getDisplayCount(categoryId, totalInCategory);
            const visibleBusinesses = categoryBusinesses.slice(0, displayCount);

            const CategoryIcon = category.icon || Building2;

            return (
              <motion.section
                key={categoryId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
                className="relative"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <CategoryIcon className="w-5 h-5 text-bg-dark" />
                    </div>
                    <div>
                      <h3 className="font-black text-bg-dark text-lg uppercase tracking-tight">
                        {category.name[language]}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {totalInCategory} {translations.businesses[language]}
                      </p>
                    </div>
                  </div>
                  
                  {/* Expand/Collapse Button - Shows current/max */}
                  {totalInCategory > ITEMS_PER_BATCH && (
                    <button
                      onClick={() => handleLoadMore(categoryId, totalInCategory, displayCount)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all bg-slate-50 text-slate-500 hover:bg-slate-100"
                    >
                      {displayCount >= totalInCategory ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          {translations.showLess[language]}
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          {translations.loadMore[language]} ({displayCount}/{totalInCategory})
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Business Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {visibleBusinesses.map((business, idx) => (
                      <motion.div
                        key={business.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                        layout
                      >
                        <BusinessCard
                          biz={business}
                          variant="compact"
                          onClick={onBusinessClick}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Load More / Show Less Buttons (Inline) - Incremental 3→6→9 */}
                {totalInCategory > ITEMS_PER_BATCH && (
                  <div className="mt-4 flex items-center justify-center gap-3">
                    {displayCount < totalInCategory && (
                      <button
                        onClick={() => handleLoadMore(categoryId, totalInCategory, displayCount)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-slate-100 rounded-xl text-[11px] font-bold uppercase tracking-wider text-slate-600 hover:border-primary hover:text-primary transition-all shadow-sm"
                      >
                        <ChevronDown className="w-4 h-4" />
                        {translations.loadMore[language]}
                        <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[9px]">
                          +{Math.min(ITEMS_PER_BATCH, totalInCategory - displayCount)} ({displayCount}/{totalInCategory})
                        </span>
                      </button>
                    )}
                    
                    {displayCount >= totalInCategory && (
                      <button
                        onClick={() => handleLoadMore(categoryId, totalInCategory, displayCount)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-50 rounded-xl text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-100 transition-all"
                      >
                        <ChevronUp className="w-4 h-4" />
                        {translations.showLess[language]}
                      </button>
                    )}
                  </div>
                )}

                {/* Divider */}
                {categoryIndex < categoryIds.length - 1 && (
                  <div className="mt-12 border-b border-slate-100" />
                )}
              </motion.section>
            );
          })}
        </div>
      )}

      {/* Global Load More */}
      {hasMore && (
        <div className="flex justify-center pt-8">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-8 py-3 bg-bg-dark text-white rounded-xl text-[12px] font-black uppercase tracking-wider hover:bg-primary hover:text-bg-dark transition-all disabled:opacity-50 shadow-lg"
          >
            {loading 
              ? (language === 'ar' ? 'جاري التحميل...' : language === 'ku' ? 'بارکردن...' : 'Loading...')
              : (language === 'ar' ? 'تحميل المزيد' : language === 'ku' ? 'زیاتر ببینە' : 'Load More Businesses')
            }
          </button>
        </div>
      )}
    </div>
  );
}
