import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, PlusCircle, MapPin, LogOut, Settings, ChevronDown, Search, Briefcase, LayoutDashboard, Building2, Sparkles } from "lucide-react";
import debounce from "lodash/debounce";
import { motion, AnimatePresence } from "motion/react";
import AuthModal from "@/components/auth/AuthModal";
import BusinessDetailModal from "@/components/home/BusinessDetailModal";
import AddBusinessModal from "@/components/home/AddBusinessModal";
import MyCity from "@/components/home/MyCity";
import Shakumaku from "@/components/home/Shakumaku";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useShakuMakuFeed } from "@/hooks/useShakuMakuFeed";
import { useAuthStore } from "@/stores/authStore";
import { useHomeStore } from "@/stores/homeStore";
import type { Business } from "@/lib/supabase";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isAddBusinessModalOpen, setIsAddBusinessModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { user, profile, signOut, loading: authLoading } = useAuthStore();
  const { 
    language,
    setLanguage,
    activeTab,
    setActiveTab
  } = useHomeStore();
  
  const { 
    businesses, 
    loading: businessesLoading, 
    error,
    hasMore,
    totalCount,
    loadMore,
    refresh
  } = useBusinesses(debouncedQuery);

  const {
    posts: shakumakuPosts,
    loading: shakumakuLoading,
    error: shakumakuError,
    hasMore: shakumakuHasMore,
    loadMore: loadMoreShakumaku
  } = useShakuMakuFeed();

  // Debounce search query
  const debouncedSetQuery = useMemo(
    () => debounce((query: string) => setDebouncedQuery(query), 500),
    []
  );

  useEffect(() => {
    debouncedSetQuery(searchQuery);
    return () => debouncedSetQuery.cancel();
  }, [searchQuery, debouncedSetQuery]);

  const isRTL = language === 'ar' || language === 'ku';

  const translations = {
    mycity: {
      en: 'My City',
      ar: 'مدينتي',
      ku: 'شارەکەم'
    },
    shakumaku: {
      en: 'Shaku Maku',
      ar: 'شاكو ماكو',
      ku: 'شاکۆ ماکۆ'
    },
    explore: {
      en: 'Explore Businesses',
      ar: 'استكشف الشركات',
      ku: 'گەڕان بەدوای کارەکاندا'
    },
    addBusiness: {
      en: 'Add Business',
      ar: 'أضف عملك',
      ku: 'کارەکەت زیاد بکە'
    },
    settings: {
      en: 'Settings',
      ar: 'الإعدادات',
      ku: 'ڕێکخستنەکان'
    },
    signOut: {
      en: 'Sign Out',
      ar: 'تسجيل الخروج',
      ku: 'چوونەدەرەوە'
    },
    dashboard: {
      en: 'Business Dashboard',
      ar: 'لوحة تحكم الأعمال',
      ku: 'داشبۆردی بازرگانی'
    },
    owner: {
      en: 'Owner',
      ar: 'مالك',
      ku: 'خاوەن'
    },
    member: {
      en: 'Member',
      ar: 'عضو',
      ku: 'ئەندام'
    }
  };

  return (
    <div className="min-h-screen bg-bg-light selection:bg-primary/30" dir={isRTL ? 'rtl' : 'ltr'}>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authMode}
      />
      <BusinessDetailModal business={selectedBusiness} onClose={() => setSelectedBusiness(null)} />
      
      {/* Header */}
      <header className="sticky top-0 z-[60] bg-white/95 backdrop-blur-2xl border-b border-slate-100 shadow-[0_1px_10px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-6">
          {/* Left: Logo */}
          <div 
            className="flex items-center gap-3 group cursor-pointer" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-11 h-11 bg-bg-dark rounded-2xl flex items-center justify-center shadow-xl group-hover:bg-primary transition-all duration-700 group-hover:rotate-[10deg]">
              <span className="text-white font-black text-2xl poppins-bold">B</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-text-main poppins-bold tracking-tighter leading-none uppercase">Belive</h1>
              <p className="text-[9px] text-primary font-black uppercase tracking-[0.3em] mt-1">Iraqi Business Hub</p>
            </div>
          </div>

          {/* Center: Tab Navigation */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
              <button
                onClick={() => setActiveTab('mycity')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black transition-all duration-300 uppercase tracking-wider ${
                  activeTab === 'mycity'
                    ? 'bg-white text-bg-dark shadow-lg'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Building2 className="w-4 h-4" />
                {translations.mycity[language]}
              </button>
              <button
                onClick={() => setActiveTab('shakumaku')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black transition-all duration-300 uppercase tracking-wider ${
                  activeTab === 'shakumaku'
                    ? 'bg-bg-dark text-white shadow-lg'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                {translations.shakumaku[language]}
              </button>
            </div>
          </div>

          {/* Right: Language & User */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-50 p-1 rounded-xl">
              {(['en', 'ar', 'ku'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    language === lang
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {lang === 'en' ? 'EN' : lang === 'ar' ? 'ع' : 'کو'}
                </button>
              ))}
            </div>

            {authLoading ? (
              <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse" />
            ) : !user ? (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="px-5 py-2.5 bg-bg-dark text-white text-[11px] font-black rounded-xl hover:bg-primary hover:text-bg-dark transition-all uppercase tracking-wider"
              >
                {language === 'ar' ? 'دخول' : language === 'ku' ? 'چوونەژوورەوە' : 'Login'}
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-bg-dark flex items-center justify-center text-white text-xs font-black">
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-[70]"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 mb-2">
                        <p className="text-xs font-bold text-bg-dark truncate">{profile?.full_name || user.email}</p>
                        {profile?.role === 'business_owner' && (
                          <span className="text-[9px] font-bold text-primary uppercase">{translations.owner[language]}</span>
                        )}
                      </div>
                      
                      {profile?.role === 'business_owner' && (
                        <Link
                          to="/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          {translations.dashboard[language]}
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          setIsAddBusinessModalOpen(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <PlusCircle className="w-4 h-4" />
                        {translations.addBusiness[language]}
                      </button>

                      <Link
                        to="/admin/shakumaku"
                        onClick={() => setShowUserMenu(false)}
                        className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Manage Shakumaku
                      </Link>

                      <div className="h-px bg-slate-100 my-1" />
                      
                      <button
                        onClick={() => {
                          signOut();
                          setShowUserMenu(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        {translations.signOut[language]}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="md:hidden border-t border-slate-100">
          <div className="flex">
            <button
              onClick={() => setActiveTab('mycity')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-black uppercase tracking-wider transition-all ${
                activeTab === 'mycity'
                  ? 'text-bg-dark border-b-2 border-bg-dark'
                  : 'text-slate-400'
              }`}
            >
              <Building2 className="w-4 h-4" />
              {translations.mycity[language]}
            </button>
            <button
              onClick={() => setActiveTab('shakumaku')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-black uppercase tracking-wider transition-all ${
                activeTab === 'shakumaku'
                  ? 'text-bg-dark border-b-2 border-bg-dark'
                  : 'text-slate-400'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              {translations.shakumaku[language]}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'mycity' ? (
            <motion.div
              key="mycity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <MyCity
                businesses={businesses}
                loading={businessesLoading}
                hasMore={hasMore}
                totalCount={totalCount}
                onBusinessClick={setSelectedBusiness}
                onLoadMore={loadMore}
              />
            </motion.div>
          ) : (
            <motion.div
              key="shakumaku"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Shakumaku
                posts={shakumakuPosts}
                loading={shakumakuLoading}
                error={shakumakuError}
                hasMore={shakumakuHasMore}
                onLoadMore={loadMoreShakumaku}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AddBusinessModal
        isOpen={isAddBusinessModalOpen}
        onClose={() => setIsAddBusinessModalOpen(false)}
        onSuccess={() => refresh()}
      />
    </div>
  );
}
