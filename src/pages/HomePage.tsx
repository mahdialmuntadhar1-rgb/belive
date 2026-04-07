import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, PlusCircle, LogOut, Settings, ChevronDown, Briefcase, LayoutDashboard } from "lucide-react";
import debounce from "lodash/debounce";
import { motion, AnimatePresence } from "motion/react";
import HeroSection from "@/components/home/HeroSection";
import HomeTabSwitcher, { type HomeTab } from "@/components/home/HomeTabSwitcher";
import HomeSocialSection from "@/components/home/HomeSocialSection";
import HomeExploreSection from "@/components/home/HomeExploreSection";
import AuthModal from "@/components/auth/AuthModal";
import BusinessDetailModal from "@/components/home/BusinessDetailModal";
import AddBusinessModal from "@/components/home/AddBusinessModal";
import { useBusinesses } from "@/hooks/useBusinesses";
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
  const [activeTab, setActiveTab] = useState<HomeTab>('social');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { user, profile, signOut, loading: authLoading } = useAuthStore();
  const { 
    language,
    setLanguage
  } = useHomeStore();
  
  const { 
    businesses, 
    loading: businessesLoading, 
    hasMore,
    totalCount,
    loadMore,
    refresh
  } = useBusinesses(debouncedQuery);

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
    explore: {
      en: 'Explore Businesses',
      ar: 'استكشف الشركات',
      ku: 'گەڕان بەدوای کارەکاندا'
    },
    directory: {
      en: 'Directory',
      ar: 'الدليل',
      ku: 'دایرێکتۆری'
    },
    subtitle: {
      en: 'Discover the best local services across Iraq',
      ar: 'اكتشف أفضل الخدمات المحلية في جميع أنحاء العراق',
      ku: 'باشترین خزمەتگوزارییە ناوخۆییەکان لە سەرانسەری عێراق بدۆزەرەوە'
    },
    showing: {
      en: 'Showing',
      ar: 'عرض',
      ku: 'پیشاندانی'
    },
    of: {
      en: 'of',
      ar: 'من',
      ku: 'لە'
    },
    services: {
      en: 'local services across Iraq',
      ar: 'خدمة محلية في العراق',
      ku: 'خزمەتگوزاری ناوخۆیی لە عێراق'
    },
    grid: {
      en: 'Grid',
      ar: 'شبكة',
      ku: 'تۆڕ'
    },
    map: {
      en: 'Map',
      ar: 'خريطة',
      ku: 'نەخشە'
    },
    manage: {
      en: 'Manage Business',
      ar: 'إدارة الأعمال',
      ku: 'بەڕێوەبردنی کار'
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
          {/* Left: Branch (English Only) */}
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

          {/* Center: Language Selection with Flags */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
              <button 
                onClick={() => setLanguage('en')}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[10px] font-black transition-all duration-500 uppercase tracking-widest ${language === 'en' ? 'bg-white text-primary shadow-premium' : 'text-slate-400 hover:text-primary'}`}
              >
                <span className="text-sm">🇺🇸</span>
                <span>English</span>
              </button>
              <button 
                onClick={() => setLanguage('ar')}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[10px] font-black transition-all duration-500 uppercase tracking-widest ${language === 'ar' ? 'bg-white text-primary shadow-premium' : 'text-slate-400 hover:text-primary'}`}
              >
                <span className="text-sm">🇮🇶</span>
                <span>عربي</span>
              </button>
              <button 
                onClick={() => setLanguage('ku')}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[10px] font-black transition-all duration-500 uppercase tracking-widest ${language === 'ku' ? 'bg-white text-primary shadow-premium' : 'text-slate-400 hover:text-primary'}`}
              >
                <span className="text-sm">☀️</span>
                <span>کوردی</span>
              </button>
            </div>
          </div>

          {/* Right: Registration/User */}
          <div className="flex items-center gap-4">
            {authLoading ? (
              <div className="w-12 h-12 rounded-2xl bg-slate-50 animate-pulse" />
            ) : (
              <>
                {user && (
                  <button 
                    onClick={() => setIsAddBusinessModalOpen(true)}
                    className="hidden sm:flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 text-text-main text-[10px] font-black rounded-2xl hover:border-primary hover:text-primary transition-all uppercase tracking-widest shadow-sm hover:shadow-premium"
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>{translations.addBusiness[language]}</span>
                  </button>
                )}

                {user && profile?.role === 'business_owner' && (
                  <Link 
                    to="/dashboard"
                    className="hidden lg:flex items-center gap-3 px-6 py-3 bg-secondary text-bg-dark text-[10px] font-black rounded-2xl shadow-xl shadow-secondary/20 hover:bg-secondary-dark hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                  >
                    <Briefcase className="w-5 h-5" />
                    <span>{translations.dashboard[language]}</span>
                  </Link>
                )}

                {!user ? (
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        setAuthMode('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="hidden sm:flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 text-text-main text-[10px] font-black rounded-2xl hover:border-primary hover:text-primary transition-all uppercase tracking-widest shadow-sm hover:shadow-premium"
                    >
                      <PlusCircle className="w-5 h-5" />
                      <span>{translations.addBusiness[language]}</span>
                    </button>
                    <button 
                      onClick={() => {
                        setAuthMode('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="px-6 py-3 text-text-muted text-[10px] font-black rounded-2xl hover:text-primary transition-all uppercase tracking-widest"
                    >
                      {language === 'ar' ? 'دخول' : language === 'ku' ? 'چوونەژوورەوە' : 'Login'}
                    </button>
                    <button 
                      onClick={() => {
                        setAuthMode('signup');
                        setIsAuthModalOpen(true);
                      }}
                      className="flex items-center gap-3 px-8 py-3 bg-primary text-bg-dark text-[10px] font-black rounded-2xl shadow-2xl shadow-primary/20 hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                    >
                      <User className="w-5 h-5" />
                      <span className="hidden sm:inline">{language === 'ar' ? 'تسجيل' : language === 'ku' ? 'تۆمارکردن' : 'Register'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <button 
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-3 p-1.5 rounded-2xl bg-white border border-slate-100 hover:border-primary transition-all shadow-sm group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-bg-dark flex items-center justify-center text-white text-[12px] font-black group-hover:bg-primary transition-colors">
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
                          className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-[70] overflow-hidden"
                        >
                          <div className="px-4 py-3 border-b border-slate-100 mb-2 bg-slate-50/50">
                            <p className="text-[10px] font-black text-text-main truncate">{profile?.full_name || user.email}</p>
                            <p className="text-[8px] font-bold text-text-muted truncate mt-0.5 opacity-60">{user.email}</p>
                            {profile?.role === 'business_owner' && (
                              <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-secondary/10 text-secondary rounded-full">
                                <Briefcase className="w-2.5 h-2.5" />
                                <span className="text-[7px] font-black uppercase tracking-widest">{translations.owner[language]}</span>
                              </div>
                            )}
                          </div>
                          
                          {profile?.role === 'business_owner' && (
                            <Link 
                              to="/dashboard"
                              onClick={() => setShowUserMenu(false)}
                              className="w-full px-4 py-2.5 text-left text-[11px] font-bold text-text-muted hover:bg-slate-50 hover:text-secondary flex items-center gap-3 transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4" /> {translations.dashboard[language]}
                            </Link>
                          )}

                          <button className="w-full px-4 py-2.5 text-left text-[11px] font-bold text-text-muted hover:bg-slate-50 hover:text-primary flex items-center gap-3 transition-colors">
                            <Settings className="w-4 h-4" /> {translations.settings[language]}
                          </button>
                          
                          <div className="h-px bg-slate-100 my-1" />
                          
                          <button 
                            onClick={() => {
                              signOut();
                              setShowUserMenu(false);
                            }}
                            className="w-full px-4 py-2.5 text-left text-[11px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> {translations.signOut[language]}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      <main className="pb-24">
        {/* 1. Hero Section */}
        <HeroSection 
          businesses={businesses} 
          onBusinessClick={setSelectedBusiness} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <HomeTabSwitcher activeTab={activeTab} onChange={setActiveTab} />
          <AnimatePresence mode="wait" initial={false}>
            {activeTab === 'social' ? (
              <motion.div
                key="social-tab-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <HomeSocialSection businesses={businesses} loading={businessesLoading} />
              </motion.div>
            ) : (
              <motion.div
                key="explore-tab-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <HomeExploreSection
                  businesses={businesses}
                  loading={businessesLoading}
                  hasMore={hasMore}
                  totalCount={totalCount}
                  onLoadMore={loadMore}
                  onBusinessClick={setSelectedBusiness}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AddBusinessModal 
        isOpen={isAddBusinessModalOpen} 
        onClose={() => setIsAddBusinessModalOpen(false)}
        onSuccess={() => refresh()}
      />

      {/* Footer */}
      <footer className="bg-bg-dark text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
                  <span className="text-white font-black text-2xl poppins-bold">B</span>
                </div>
                <h3 className="text-3xl font-black poppins-bold tracking-tighter">Belive</h3>
              </div>
              <p className="text-slate-400 leading-relaxed mb-10 text-base max-w-sm">
                Iraq's most trusted business discovery platform. Connecting millions of users with local businesses across all 19 governorates.
              </p>
              <div className="flex gap-4">
                {['facebook', 'instagram', 'twitter', 'linkedin'].map(social => (
                  <a key={social} href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-500 group">
                    <span className="text-[10px] font-black uppercase tracking-tighter group-hover:scale-110 transition-transform">{social.slice(0, 2)}</span>
                  </a>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <h4 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-8">Directory</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Browse Categories</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Popular Cities</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Featured Listings</a></li>
                <li><a href="#" className="hover:text-white transition-colors">New Businesses</a></li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-8">For Business</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Claim Listing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Advertise</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Business Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              </ul>
            </div>

            <div className="lg:col-span-4">
              <h4 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-8">Mobile App</h4>
              <p className="text-sm text-slate-500 mb-8 font-medium">Download the Belive app for the best experience on the go.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#" className="flex-1 bg-white/5 border border-white/10 p-4 rounded-[20px] flex items-center gap-4 hover:bg-white/10 transition-all group">
                  <div className="text-3xl group-hover:scale-110 transition-transform">🍎</div>
                  <div>
                    <p className="text-[8px] uppercase font-black text-slate-500 tracking-widest">Available on</p>
                    <p className="text-sm font-black">App Store</p>
                  </div>
                </a>
                <a href="#" className="flex-1 bg-white/5 border border-white/10 p-4 rounded-[20px] flex items-center gap-4 hover:bg-white/10 transition-all group">
                  <div className="text-3xl group-hover:scale-110 transition-transform">🤖</div>
                  <div>
                    <p className="text-[8px] uppercase font-black text-slate-500 tracking-widest">Get it on</p>
                    <p className="text-sm font-black">Google Play</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/5 mt-24 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">
            <p>&copy; {new Date().getFullYear()} Belive. ALL RIGHTS RESERVED.</p>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/20 font-black text-[10px]">BL</div>
              <div className="flex gap-12">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
