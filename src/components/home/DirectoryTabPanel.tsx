import React, { useState } from 'react';
import { LayoutGrid, Map as MapIcon, Star, TrendingUp, Briefcase, Loader2, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import HeroSection from './HeroSection';
import LocationFilter from './LocationFilter';
import CategoryGrid from './CategoryGrid';
import BusinessCard from './BusinessCard';
import BusinessMap from './BusinessMap';
import CategorySection from './CategorySection';
import { useHomeStore } from '@/stores/homeStore';
import { useFeaturedBusinesses } from '@/hooks/useFeaturedBusinesses';
import { CATEGORIES } from '@/constants';
import { Business } from '@/lib/supabase';

interface DirectoryTabPanelProps {
  businesses: Business[];
  loading: boolean;
  hasMore: boolean;
  totalCount: number;
  loadMore: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onBusinessClick: (business: Business) => void;
  viewMode: 'grid' | 'map';
  setViewMode: (mode: 'grid' | 'map') => void;
}

export default function DirectoryTabPanel({
  businesses,
  loading,
  hasMore,
  totalCount,
  loadMore,
  searchQuery,
  setSearchQuery,
  onBusinessClick,
  viewMode,
  setViewMode
}: DirectoryTabPanelProps) {
  const { language, setCategory } = useHomeStore();
  const { businesses: featuredBusinesses } = useFeaturedBusinesses();
  const [categoryLimits, setCategoryLimits] = useState<Record<string, number>>(
    CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.id]: 3 }), {})
  );

  const translations = {
    showing: { en: 'Showing', ar: 'عرض', ku: 'پیشاندانی' },
    of: { en: 'of', ar: 'من', ku: 'لە' },
    services: { en: 'local services across Iraq', ar: 'خدمة محلية في العراق', ku: 'خزمەتگوزاری ناوخۆیی لە عێراق' },
    exploreCategories: { en: 'Explore Categories', ar: 'استكشف الفئات', ku: 'پۆلەکان بگەڕێ' },
    businessDirectory: { en: 'Business Directory', ar: 'دليل الأعمال', ku: 'ڕێبەری کارەکان' },
    featured: { en: 'Featured Businesses', ar: 'أماكن مميزة', ku: 'شوێنە دیارەکان' },
    loadMore: { en: 'Load More', ar: 'عرض المزيد', ku: 'زیاتر ببینە' }
  };

  const handleLoadMoreCategory = (categoryId: string) => {
    setCategoryLimits(prev => ({
      ...prev,
      [categoryId]: prev[categoryId] + 3
    }));
  };

  return (
    <div className="space-y-12">
      {/* 1. Hero Section */}
      <HeroSection 
        businesses={businesses} 
        onBusinessClick={onBusinessClick} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* 2. Filters & Discovery */}
        <div className="max-w-4xl mx-auto pt-8">
          <LocationFilter businesses={businesses} />

          {/* Popular Now Chips */}
          <div className="flex items-center gap-4 mb-12 px-1 overflow-x-auto no-scrollbar pb-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full border border-accent/20 whitespace-nowrap">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase tracking-widest">Popular:</span>
            </div>
            {CATEGORIES.slice(0, 6).map((cat) => (
              <button 
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className="px-5 py-2 bg-white border border-slate-100 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest hover:border-accent hover:text-accent transition-all shadow-sm whitespace-nowrap flex items-center gap-2 group"
              >
                <cat.icon className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                {cat.name[language]}
              </button>
            ))}
          </div>

          {/* Category Grid */}
          <div className="mb-20">
            <h2 className="text-xl font-black text-primary poppins-bold uppercase tracking-tight mb-8 px-1">
              {translations.exploreCategories[language]}
            </h2>
            <CategoryGrid />
          </div>
        </div>

        {/* 3. View Toggle & Directory Header */}
        <div className="flex items-center justify-between mb-12 px-1">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-accent rounded-full" />
            <h2 className="text-2xl font-black text-primary poppins-bold uppercase tracking-tight">
              {translations.businessDirectory[language]}
            </h2>
          </div>
          
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                viewMode === 'grid' ? 'bg-white text-accent shadow-sm' : 'text-slate-400 hover:text-primary'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                viewMode === 'map' ? 'bg-white text-accent shadow-sm' : 'text-slate-400 hover:text-primary'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>
        </div>

        {/* 4. Content Area */}
        {viewMode === 'map' ? (
          <div className="mb-12 rounded-[40px] overflow-hidden border border-slate-100 shadow-card">
            <BusinessMap businesses={businesses} onBusinessClick={onBusinessClick} />
          </div>
        ) : (
          <div className="space-y-24">
            {/* Featured Section - Independent Data Source */}
            {featuredBusinesses.length > 0 && (
              <div className="space-y-10">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-2xl font-black text-primary poppins-bold uppercase tracking-tight">
                    {translations.featured[language]}
                  </h2>
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                    <Star className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex gap-6 overflow-x-auto no-scrollbar pb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
                  {featuredBusinesses.slice(0, 10).map(business => (
                    <BusinessCard key={business.id} biz={business} variant="featured" onClick={onBusinessClick} />
                  ))}
                </div>
              </div>
            )}

            {/* Category Sections - 3 per category + Load More */}
            <div className="space-y-24">
              {CATEGORIES.map(category => {
                const categoryBusinesses = businesses.filter(b => b.category === category.id);
                if (categoryBusinesses.length === 0) return null;

                const limit = categoryLimits[category.id] || 3;
                const displayedBusinesses = categoryBusinesses.slice(0, limit);
                const hasMoreInCategory = categoryBusinesses.length > limit;

                return (
                  <div key={category.id} className="space-y-8">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center text-accent">
                          <category.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-primary poppins-bold uppercase tracking-tight">
                            {category.name[language]}
                          </h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                            {categoryBusinesses.length} {language === 'ar' ? 'عمل تجاري' : 'Businesses'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      {displayedBusinesses.map(business => (
                        <BusinessCard 
                          key={business.id} 
                          biz={business} 
                          onClick={onBusinessClick} 
                        />
                      ))}
                    </div>

                    {hasMoreInCategory && (
                      <div className="flex justify-center pt-4">
                        <button
                          onClick={() => handleLoadMoreCategory(category.id)}
                          className="px-8 py-3 bg-white border border-slate-200 text-primary text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:border-accent hover:text-accent transition-all shadow-sm flex items-center gap-2"
                        >
                          {translations.loadMore[language]}
                          <ChevronRight className={`w-4 h-4 ${language === 'ar' || language === 'ku' ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Global Load More */}
            {hasMore && (
              <div className="flex flex-col items-center gap-8 py-20 bg-slate-50/50 rounded-[60px] border border-slate-100">
                <div className="flex flex-col items-center gap-3">
                  <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    {translations.showing[language]} <span className="text-primary">{businesses.length}</span> {translations.of[language]} <span className="text-primary">{totalCount}</span> {translations.services[language]}
                  </div>
                  <div className="w-64 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent"
                      style={{ width: `${(businesses.length / totalCount) * 100}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-16 py-6 bg-primary text-white text-[12px] font-black uppercase tracking-[0.4em] rounded-[28px] hover:bg-accent hover:text-primary transition-all shadow-card disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Load More Businesses'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
