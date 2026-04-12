import React, { useState } from 'react';
import { LayoutGrid, Map as MapIcon, Star, TrendingUp, Briefcase, Loader2, ChevronRight, Search } from 'lucide-react';
import { motion } from 'motion/react';
import HeroSection from './HeroSection';
import LocationFilter from './LocationFilter';
import CategoryGrid from './CategoryGrid';
import BusinessCard from './BusinessCard';
import BusinessMap from './BusinessMap';
import CategorySection from './CategorySection';
import { useHomeStore } from '@/stores/homeStore';
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
  const { language, setCategory, selectedCategory } = useHomeStore();

  const translations = {
    showing: { en: 'Showing', ar: 'عرض', ku: 'پیشاندانی' },
    of: { en: 'of', ar: 'من', ku: 'لە' },
    services: { en: 'local services across Iraq', ar: 'خدمة محلية في العراق', ku: 'خزمەتگوزاری ناوخۆیی لە عێراق' },
    exploreCategories: { en: 'Explore Categories', ar: 'استكشف الفئات', ku: 'پۆلەکان بگەڕێ' },
    businessDirectory: { en: 'Business Directory', ar: 'دليل الأعمال', ku: 'ڕێبەری کارەکان' },
    featured: { en: 'Featured Businesses', ar: 'أماكن مميزة', ku: 'شوێنە دیارەکان' },
    loadMore: { en: 'Load More', ar: 'عرض المزيد', ku: 'زیاتر ببینە' },
    loadLess: { en: 'Show Less', ar: 'عرض أقل', ku: 'کەمتر ببینە' }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      {/* Intro Text */}
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-4xl font-black text-primary poppins-bold uppercase tracking-tight mb-4">
          {language === 'ar' ? 'اكتشف أفضل ما في مدينتك' : language === 'ku' ? 'باشترینەکانی شارەکەت بدۆزەرەوە' : 'Discover the Best in Your City'}
        </h2>
        <p className="text-sm sm:text-lg text-slate-500 font-medium leading-relaxed">
          {language === 'ar' 
            ? 'تصفح آلاف الشركات المحلية، المطاعم، والخدمات الموثوقة في جميع أنحاء العراق.' 
            : language === 'ku'
            ? 'هەزاران کۆمپانیای ناوخۆیی، چێشتخانە و خزمەتگوزارییە باوەڕپێکراوەکان لە سەرانسەری عێراق بگەڕێ.'
            : 'Browse thousands of local businesses, restaurants, and trusted services across Iraq.'}
        </p>
      </div>

      {/* 1.5 Sticky Search Bar */}
      <div className="sticky top-[124px] sm:top-[169px] z-40 py-2 sm:py-4 bg-white/95 backdrop-blur-xl -mx-4 px-4 mb-6 sm:mb-12 border-b border-slate-100 shadow-sm transition-all duration-300">
        <div className="max-w-2xl mx-auto relative group">
          <div className="relative flex items-center bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden p-1 sm:p-1.5 border border-slate-200">
            <div className={`flex items-center flex-1 ${language === 'ar' || language === 'ku' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="px-2 sm:px-4 text-slate-400">
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'ar' ? 'ابحث عن أي شيء...' : language === 'ku' ? 'بگەڕێ بۆ هەر شتێک...' : 'Search for anything...'}
                className={`flex-1 py-2 sm:py-3 text-xs sm:text-sm font-bold text-bg-dark focus:outline-none bg-transparent placeholder:text-slate-400 ${language === 'ar' || language === 'ku' ? 'text-right' : 'text-left'}`}
              />
            </div>
            <button className="px-4 sm:px-6 py-2 sm:py-3 bg-primary text-bg-dark font-black text-[9px] sm:text-[10px] uppercase tracking-widest rounded-lg sm:rounded-xl hover:bg-accent transition-all active:scale-95">
              {language === 'ar' ? 'بحث' : language === 'ku' ? 'گەڕان' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Location & Category Filters */}
      <LocationFilter businesses={businesses} />

      {/* 3. Main Category Selector */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-6 bg-accent rounded-full" />
          <h2 className="text-xl font-black text-primary poppins-bold uppercase tracking-tight">
            {translations.exploreCategories[language]}
          </h2>
        </div>
        <CategoryGrid />
      </div>

      {/* 2. View Toggle & Directory Header */}
      <div className="flex items-center justify-between mb-16">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-primary rounded-full" />
          <h2 className="text-xl font-black text-primary poppins-bold uppercase tracking-tight">
            {translations.businessDirectory[language]}
          </h2>
        </div>
        
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              viewMode === 'grid' ? 'bg-white text-accent shadow-sm' : 'text-slate-400 hover:text-primary'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              viewMode === 'map' ? 'bg-white text-accent shadow-sm' : 'text-slate-400 hover:text-primary'
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Map</span>
          </button>
        </div>
      </div>

      {/* 3. Content Area */}
      {viewMode === 'map' ? (
        <div className="mb-12 rounded-[40px] overflow-hidden border border-slate-100 shadow-card">
          <BusinessMap businesses={businesses} onBusinessClick={onBusinessClick} />
        </div>
      ) : (
        <div className="space-y-32">
          {/* Category Sections - 3 per category + Independent Load More */}
          {CATEGORIES.map(category => {
            // If a category is selected, only show that category
            if (selectedCategory && selectedCategory !== category.id) return null;

            const categoryBusinesses = businesses.filter(b => b.category === category.id);
            if (categoryBusinesses.length === 0) return null;

            return (
              <CategorySection 
                key={category.id}
                category={category}
                businesses={categoryBusinesses}
                loading={loading}
                onBusinessClick={onBusinessClick}
              />
            );
          })}

          {/* Global Load More fallback if needed, but usually the category load more is enough */}
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
  );
}
