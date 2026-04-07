import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MapPin, CheckCircle2, Phone, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import { CATEGORIES, ICON_MAP } from '@/constants';

interface CategorizedBusinessGridProps {
  businesses: Business[];
  loading?: boolean;
  onBusinessClick?: (business: Business) => void;
}

const INITIAL_CARDS_PER_CATEGORY = 3;

// Normalize category string to match CATEGORIES array
function normalizeCategory(category: string): string {
  return category.toLowerCase().trim().replace(/[_\s]+/g, '_');
}

// Get display name for a category from CATEGORIES or fallback
function getCategoryDisplayName(category: string, language: string): string {
  const normalized = normalizeCategory(category);
  const categoryDef = CATEGORIES.find(c => c.id === normalized || normalizeCategory(c.id) === normalized);
  if (categoryDef) {
    return categoryDef.name[language as keyof typeof categoryDef.name] || categoryDef.name.en;
  }
  // Fallback: capitalize first letter of each word
  return category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// Get icon for category from CATEGORIES
function getCategoryIcon(category: string): any {
  const normalized = normalizeCategory(category);
  const categoryDef = CATEGORIES.find(c => c.id === normalized || normalizeCategory(c.id) === normalized);
  return categoryDef?.icon || ICON_MAP.Store;
}

// Group businesses by their actual category field from database
function groupByCategory(businesses: Business[]): Record<string, Business[]> {
  const groups: Record<string, Business[]> = {};
  
  for (const business of businesses) {
    const category = business.category || 'general';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(business);
  }
  
  return groups;
}

export default function CategorizedBusinessGrid({ 
  businesses, 
  loading, 
  onBusinessClick 
}: CategorizedBusinessGridProps) {
  const { language } = useHomeStore();
  // Track expanded state per category: { [category]: boolean }
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const translations = {
    noResults: { en: 'No results found', ar: 'لم يتم العثور على نتائج', ku: 'هیچ ئەنجامێک نەدۆزرایەوە' },
    noResultsDesc: {
      en: "We couldn't find any businesses matching your current filters.",
      ar: 'لم نتمكن من العثور على أي شركات تطابق الفلاتر الحالية.',
      ku: 'نەمانتوانی هیچ کارێک بدۆزینەوە کە لەگەڵ فلتەرەکانتدا بگونجێت.'
    },
    loadMore: { en: 'Load More', ar: 'تحميل المزيد', ku: 'زیاتر' },
    loadLess: { en: 'Load Less', ar: 'تحميل أقل', ku: 'کەمتر' },
    verified: { en: 'Verified', ar: 'موثق', ku: 'پشتڕاستکراوە' },
    call: { en: 'Call', ar: 'اتصال', ku: 'پەیوەندی' }
  };

  // Group businesses by their actual category field
  const categorizedBusinesses = useMemo(() => {
    return groupByCategory(businesses);
  }, [businesses]);

  // Get sorted category keys (categories with most businesses first)
  const sortedCategories = useMemo(() => {
    return Object.keys(categorizedBusinesses).sort((a, b) => 
      categorizedBusinesses[b].length - categorizedBusinesses[a].length
    );
  }, [categorizedBusinesses]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
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
    <div className="space-y-12">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-48 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                <div className="aspect-[4/3] bg-slate-100" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  if (!loading && businesses.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
        <span className="text-3xl">🔍</span>
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
    <div className="w-full space-y-12">
      {sortedCategories.map((category) => {
        const categoryBusinesses = categorizedBusinesses[category];
        const isExpanded = expandedCategories[category] || false;
        const hasMore = categoryBusinesses.length > INITIAL_CARDS_PER_CATEGORY;
        const displayCount = isExpanded ? categoryBusinesses.length : INITIAL_CARDS_PER_CATEGORY;
        const visibleBusinesses = categoryBusinesses.slice(0, displayCount);
        const CategoryIcon = getCategoryIcon(category);

        return (
          <div key={category} className="space-y-4">
            {/* Category Title - Prominent Section Header */}
            <div className="flex items-center justify-between px-1 border-b-2 border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CategoryIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-black text-text-main poppins-bold uppercase tracking-tight">
                    {getCategoryDisplayName(category, language)}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400">
                    {categoryBusinesses.length} {language === 'ar' ? 'نشاط تجاري' : language === 'ku' ? 'کار' : 'Businesses'}
                  </p>
                </div>
              </div>
            </div>

            {/* Business Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {visibleBusinesses.map((biz) => (
                  <motion.div
                    key={biz.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 transition-all duration-500 hover:shadow-lg hover:-translate-y-1"
                  >
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
                      
                      {/* Rating Badge */}
                      <div className="absolute top-3 right-3">
                        <div className="flex items-center gap-1 glass-dark px-2 py-1 rounded-full border border-white/20 shadow-sm">
                          <Star className="w-3 h-3 text-secondary fill-secondary" />
                          <span className="text-[10px] font-black text-white">{biz.rating?.toFixed(1) || '5.0'}</span>
                        </div>
                      </div>

                      {/* Verified Badge - Icon Only */}
                      {biz.isVerified && (
                        <div className="absolute top-3 left-3">
                          <div className="flex items-center justify-center w-6 h-6 bg-primary rounded-full shadow-sm">
                            <CheckCircle2 className="w-3.5 h-3.5 text-bg-dark" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Info Section - Minimal */}
                    <div className="p-4 flex flex-col flex-1">
                      <h4 
                        className="text-sm font-black text-text-main poppins-bold leading-tight mb-1 line-clamp-1 uppercase tracking-tight group-hover:text-primary transition-colors cursor-pointer"
                        onClick={() => onBusinessClick?.(biz)}
                      >
                        {getBusinessName(biz)}
                      </h4>
                      <div className="flex items-center gap-1 text-text-muted text-[10px] font-bold mb-3">
                        <MapPin className="w-3 h-3 text-primary" />
                        <span className="truncate">{biz.governorate} • {biz.city}</span>
                      </div>
                      
                      <div className="mt-auto flex items-center gap-2">
                        <a 
                          href={`tel:${biz.phone}`}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-primary hover:text-bg-dark text-text-main rounded-lg transition-all duration-300 border border-slate-100 text-[10px] font-black uppercase tracking-widest"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {translations.call[language]}
                        </a>
                        <button 
                          onClick={() => onBusinessClick?.(biz)}
                          className="w-9 h-9 flex items-center justify-center bg-bg-dark text-white rounded-lg hover:bg-primary hover:text-bg-dark transition-all duration-300 shadow-sm"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Load More / Load Less Button */}
            {hasMore && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => toggleCategory(category)}
                  className="flex items-center gap-2 px-5 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-black text-text-main hover:bg-slate-50 hover:border-slate-300 transition-all uppercase tracking-widest shadow-sm"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      {translations.loadLess[language]}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      {translations.loadMore[language]}
                      <span className="ml-1 text-[10px] text-slate-400">
                        ({categoryBusinesses.length - INITIAL_CARDS_PER_CATEGORY} more)
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
