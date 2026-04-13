import { useState, useMemo, useEffect } from "react";
import debounce from "lodash/debounce";
import HomeHeader from "@/components/home/HomeHeader";
import HeroSection from "@/components/home/HeroSection";
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

import { ArrowRight, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function HomePage() {
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
    <div className="min-h-screen bg-[#F7F7F5] selection:bg-[#0F7B6C]/20" dir={isRTL ? 'rtl' : 'ltr'}>
      <HomeHeader 
        onAddBusiness={() => setIsAddBusinessModalOpen(true)}
        onAuth={(mode) => {
          setAuthMode(mode);
          setIsAuthModalOpen(true);
        }}
      />

      <main className="pt-4 sm:pt-8">
        <HeroSection 
          businesses={businesses} 
          onBusinessClick={setSelectedBusiness}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <div className="max-w-7xl mx-auto px-4 mb-12">
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
                  <div className="text-center mb-16">
                    <h2 className="text-4xl sm:text-6xl font-black text-[#111827] poppins-bold uppercase tracking-tighter mb-4">
                      {language === 'ar' ? 'شكو ماكو' : 'Shaku Maku'}
                    </h2>
                    <p className="text-slate-500 font-medium text-lg">
                      {language === 'ar' ? 'آخر أخبار وعروض الشركات في العراق' : 'Latest news and offers from businesses in Iraq'}
                    </p>
                  </div>
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
                  <div className="text-4xl">🍎</div>
                  <div>
                    <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest mb-1">Available on</p>
                    <p className="text-base font-black">App Store</p>
                  </div>
                </div>
                <div className="flex-1 bg-white/5 border border-white/10 p-5 rounded-[24px] flex items-center gap-5 group hover:bg-white/10 transition-all cursor-pointer">
                  <div className="text-4xl">🤖</div>
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
