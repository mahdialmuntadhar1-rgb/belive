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
import { useAdminDB } from '@/hooks/useAdminDB';
import { useBuildModeContext } from '@/contexts/BuildModeContext';
import EditableWrapper from '../BuildModeEditor/EditableWrapper';
import { CATEGORIES } from '@/constants';
import { Business } from '@/lib/supabase';

interface DirectoryTabPanelProps {
  businesses: Business[];
  loading: boolean;
  hasMore: boolean;
  totalCount: number;
  loadMore: () => void;
  refresh: () => void;
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
  refresh,
  searchQuery,
  setSearchQuery,
  onBusinessClick,
  viewMode,
  setViewMode
}: DirectoryTabPanelProps) {
  const { language, setCategory, selectedCategory } = useHomeStore();
  const { isAdmin } = useBuildModeContext();
  const { updateContent } = useAdminDB();

  const [headerContent, setHeaderContent] = useState({
    title_ar: 'اكتشف أفضل ما في مدينتك',
    title_ku: 'باشترینەکانی شارەکەت بدۆزەرەوە',
    title_en: 'Discover the Best in Your City',
    description_ar: 'تصفح آلاف الشركات المحلية، المطاعم، والخدمات الموثوقة في جميع أنحاء العراق.',
    description_ku: 'هەزاران کۆمپانیای ناوخۆیی، چێشتخانە و خزمەتگوزارییە باوەڕپێکراوەکان لە سەرانسەری عێراق بگەڕێ.',
    description_en: 'Browse thousands of local businesses, restaurants, and trusted services across Iraq.'
  });

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
      <EditableWrapper
        title="تعديل ترويسة الدليل"
        fields={[
          { name: 'title_ar', label: 'العنوان (عربي)', type: 'text' },
          { name: 'title_ku', label: 'العنوان (كردي)', type: 'text' },
          { name: 'title_en', label: 'Title (EN)', type: 'text' },
          { name: 'description_ar', label: 'الوصف (عربي)', type: 'textarea' },
          { name: 'description_ku', label: 'الوصف (كردي)', type: 'textarea' },
          { name: 'description_en', label: 'Description (EN)', type: 'textarea' }
        ]}
        initialData={headerContent}
        onSave={async (data) => {
          setHeaderContent(data);
          try {
            await updateContent('site_settings', 'directory_header', data);
          } catch (e) {
            console.warn('Persistence failed for directory_header');
          }
        }}
      >
        <div className="mb-16 text-center max-w-4xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-6xl font-black text-[#111827] poppins-bold uppercase tracking-tighter mb-6 leading-[1.1]"
          >
            {language === 'ar' ? headerContent.title_ar : language === 'ku' ? headerContent.title_ku : headerContent.title_en}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto"
          >
            {language === 'ar' ? headerContent.description_ar : language === 'ku' ? headerContent.description_ku : headerContent.description_en}
          </motion.p>
        </div>
      </EditableWrapper>

      {/* 1.5 Sticky Search Bar */}
      <div className="sticky top-[64px] sm:top-[73px] z-40 py-4 sm:py-6 bg-[#F7F7F5]/80 backdrop-blur-xl -mx-4 px-4 mb-12 border-b border-slate-200/50 transition-all duration-300">
        <div className="max-w-3xl mx-auto relative group">
          <div className="relative flex items-center bg-white rounded-3xl shadow-2xl overflow-hidden p-1.5 sm:p-2 border border-slate-200/50">
            <div className={`flex items-center flex-1 ${language === 'ar' || language === 'ku' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="px-4 sm:px-6 text-[#0F7B6C]">
                <Search className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'ar' ? 'ابحث عن أي شيء...' : language === 'ku' ? 'بگەڕێ بۆ هەر شتێک...' : 'Search for anything...'}
                className={`flex-1 py-3 sm:py-4 text-sm sm:text-lg font-bold text-[#111827] focus:outline-none bg-transparent placeholder:text-slate-400 ${language === 'ar' || language === 'ku' ? 'text-right' : 'text-left'}`}
              />
            </div>
            <button className="px-8 sm:px-12 py-3 sm:py-4 bg-[#0F7B6C] text-white font-black text-[10px] sm:text-xs uppercase tracking-[0.3em] rounded-2xl hover:bg-[#C8A96A] hover:text-[#0F7B6C] transition-all active:scale-95 shadow-lg">
              {language === 'ar' ? 'بحث' : language === 'ku' ? 'گەڕان' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Location & Category Filters */}
      <LocationFilter businesses={businesses} />

      {/* 3. Main Category Selector */}
      <div className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#C8A96A] rounded-full" />
            <h2 className="text-xl sm:text-2xl font-black text-[#111827] poppins-bold uppercase tracking-tight">
              {translations.exploreCategories[language]}
            </h2>
          </div>
        </div>
        <CategoryGrid />
      </div>

      {/* 2. View Toggle & Directory Header */}
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#0F7B6C] rounded-full" />
          <h2 className="text-xl sm:text-2xl font-black text-[#111827] poppins-bold uppercase tracking-tight">
            {translations.businessDirectory[language]}
          </h2>
        </div>
        
        <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              viewMode === 'grid' ? 'bg-[#0F7B6C] text-white shadow-md' : 'text-slate-400 hover:text-[#0F7B6C]'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              viewMode === 'map' ? 'bg-[#0F7B6C] text-white shadow-md' : 'text-slate-400 hover:text-[#0F7B6C]'
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
                onRefresh={refresh}
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
