import { useState, useMemo, useEffect } from "react";
import debounce from "lodash/debounce";
import HomeHeader from "@/components/home/HomeHeader";
import HeroSection from "@/components/home/HeroSection";
import GovernorateFilter from "@/components/home/GovernorateFilter";
import FeaturesSection from "@/components/home/FeaturesSection";
import MainTabSwitcher from "@/components/home/MainTabSwitcher";
import DirectoryTabPanel from "@/components/home/DirectoryTabPanel";
import SocialFeed from "@/components/home/SocialFeed";
import AuthModal from "@/components/auth/AuthModal";
import BusinessDetailModal from "@/components/home/BusinessDetailModal";
import AddBusinessModal from "@/components/home/AddBusinessModal";
import PWAInstallButton from "@/components/common/PWAInstallButton";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useHomeStore } from "@/stores/homeStore";
import type { Business } from "@/lib/supabase";

import { useLocalBuildStore, OWNER_EMAIL } from "@/stores/localBuildStore";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function HomePage() {
  const { isBuildMode, setBuildMode, canEdit } = useLocalBuildStore();
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isAddBusinessModalOpen, setIsAddBusinessModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'social'>('guide');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const { language, setLanguage } = useHomeStore();
  
  // Set Arabic as default on first load if not set
  useEffect(() => {
    if (!language) {
      setLanguage('ar');
    }
  }, [language, setLanguage]);

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

  return (
    <div className="selection:bg-primary/20" dir={isRTL ? 'rtl' : 'ltr'}>
      <HomeHeader 
        onAddBusiness={() => setIsAddBusinessModalOpen(true)}
        onAuth={(mode) => {
          setAuthMode(mode);
          setIsAuthModalOpen(true);
        }}
      />

      <main className="pt-4 sm:pt-8">
        <HeroSection 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <GovernorateFilter />

        <FeaturesSection />

        <div className="mb-12">
          <MainTabSwitcher 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        <div className="pb-24">
          <AnimatePresence mode="wait">
            {activeTab === 'guide' ? (
              <motion.div
                key="guide"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="relative z-10">
                  <DirectoryTabPanel 
                    businesses={businesses}
                    loading={businessesLoading}
                    hasMore={hasMore}
                    totalCount={totalCount}
                    loadMore={loadMore}
                    refresh={refresh}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onBusinessClick={setSelectedBusiness}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="social"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-white/50 backdrop-blur-sm py-12 sm:py-20"
              >
                <div className="max-w-4xl mx-auto px-4">
                  <SocialFeed onBusinessClick={setSelectedBusiness} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authMode}
      />
      
      <BusinessDetailModal 
        business={selectedBusiness} 
        onClose={() => setSelectedBusiness(null)} 
      />
      
      <AddBusinessModal 
        isOpen={isAddBusinessModalOpen} 
        onClose={() => setIsAddBusinessModalOpen(false)}
        onSuccess={() => refresh()}
      />

      <PWAInstallButton />

      {/* Build Mode Toggle - Only for Owner */}
      {canEdit(user?.email, profile?.role) && (
        <div className="fixed bottom-8 left-8 z-[100] flex items-center gap-3">
          <button
            onClick={() => setBuildMode(!isBuildMode)}
            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all flex items-center gap-2 ${
              isBuildMode 
                ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                : 'bg-white text-slate-400 hover:text-primary shadow-slate-200'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isBuildMode ? 'bg-white animate-pulse' : 'bg-slate-300'}`} />
            {isBuildMode ? 'Build Mode: On' : 'Enter Build Mode'}
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-text-main text-white pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 bg-primary rounded-[20px] flex items-center justify-center shadow-xl border border-white/10">
                  <span className="text-accent font-black text-3xl poppins-bold">ش</span>
                </div>
                <h3 className="text-4xl font-black poppins-bold tracking-tighter uppercase">
                  {language === 'ar' ? 'شكو ماكو' : 'Shaku Maku'}
                </h3>
              </div>
              <p className="text-slate-400 leading-relaxed mb-12 text-lg max-w-md">
                {language === 'ar' 
                  ? 'دليل الأعمال الأكثر ثقة في العراق. نربط الملايين من المستخدمين بالشركات المحلية في جميع المحافظات.'
                  : 'Iraq\'s most trusted business discovery platform. Connecting millions of users with local businesses across all 19 governorates.'}
              </p>
            </div>
            
            <div className="lg:col-span-4 lg:col-start-9">
              <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.4em] mb-10">
                {language === 'ar' ? 'تطبيق الهاتف' : 'Mobile App'}
              </h4>
              <p className="text-base text-slate-500 mb-10 font-medium leading-relaxed">
                {language === 'ar' ? 'قم بتحميل تطبيق شكو ماكو للحصول على أفضل تجربة.' : 'Download the Shaku Maku app for the best experience on the go.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="flex-1 bg-white/5 border border-white/10 p-5 rounded-[24px] flex items-center gap-5 group hover:bg-white/10 transition-all cursor-pointer">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.05 20.28c-.98.95-2.05 1.88-3.19 1.9-1.19.02-1.58-.75-2.95-.75-1.36 0-1.79.73-2.93.77-1.16.04-2.35-.99-3.33-1.91-2-1.89-3.53-5.33-1.51-8.83 1-1.74 2.8-2.85 4.76-2.88 1.49-.02 2.89 1.01 3.8 1.01.9 0 2.62-1.23 4.41-1.05.75.03 2.85.3 4.2 2.26-.11.07-2.5 1.46-2.47 4.35.03 3.44 3.03 4.62 3.06 4.64-.03.07-.48 1.65-1.59 2.73zM12.03 5.95c-.08-2.02 1.62-3.8 3.53-4.16.18 2.15-1.84 4.15-3.53 4.16z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest mb-1">Available on</p>
                    <p className="text-base font-black">App Store</p>
                  </div>
                </div>
                <div className="flex-1 bg-white/5 border border-white/10 p-5 rounded-[24px] flex items-center gap-5 group hover:bg-white/10 transition-all cursor-pointer">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.31-.632V2.447c0-.23.08-.453.23-.633h.079zm11.33 10.186l3.34 1.89c.77.437.77 1.565 0 2.002l-2.733 1.548-3.13-3.13 2.523-2.31zm-1.143-1.143L11.273 8.334 3.99 1.432c.368-.113.774-.032 1.082.21l8.724 4.94zm-1.143 1.143L10.13 14.523l-7.64 7.64c-.308.242-.714.323-1.082.21l11.246-11.246z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest mb-1">Get it on</p>
                    <p className="text-base font-black">Google Play</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/5 mt-32 pt-16 flex flex-col md:flex-row justify-between items-center gap-10 text-[11px] text-slate-500 font-black uppercase tracking-[0.4em]">
            <p>&copy; {new Date().getFullYear()} Shaku Maku. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-16">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
