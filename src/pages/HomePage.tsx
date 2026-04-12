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

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isAddBusinessModalOpen, setIsAddBusinessModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'social'>('guide');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const { language } = useHomeStore();
  
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
    <div className="min-h-screen bg-bg-light selection:bg-accent/30" dir={isRTL ? 'rtl' : 'ltr'}>
      <HomeHeader 
        onAddBusiness={() => setIsAddBusinessModalOpen(true)}
        onAuth={(mode) => {
          setAuthMode(mode);
          setIsAuthModalOpen(true);
        }}
      />

      <HeroSection 
        businesses={businesses} 
        onBusinessClick={setSelectedBusiness}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <MainTabSwitcher 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="pb-24">
        {activeTab === 'guide' ? (
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
        ) : (
          <SocialFeed onBusinessClick={setSelectedBusiness} />
        )}
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
      <footer className="bg-primary text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-bg-dark font-black text-2xl poppins-bold">S</span>
                </div>
                <h3 className="text-3xl font-black poppins-bold tracking-tighter uppercase">
                  {language === 'ar' ? 'شكو ماكو' : 'Shaku Maku'}
                </h3>
              </div>
              <p className="text-slate-400 leading-relaxed mb-10 text-base max-w-sm">
                {language === 'ar' 
                  ? 'دليل الأعمال الأكثر ثقة في العراق. نربط الملايين من المستخدمين بالشركات المحلية في جميع المحافظات.'
                  : 'Iraq\'s most trusted business discovery platform. Connecting millions of users with local businesses across all 19 governorates.'}
              </p>
            </div>
            
            <div className="lg:col-span-4 lg:col-start-9">
              <h4 className="text-xs font-black text-accent uppercase tracking-[0.3em] mb-8">
                {language === 'ar' ? 'تطبيق الهاتف' : 'Mobile App'}
              </h4>
              <p className="text-sm text-slate-500 mb-8 font-medium">
                {language === 'ar' ? 'قم بتحميل تطبيق شكو ماكو للحصول على أفضل تجربة.' : 'Download the Shaku Maku app for the best experience on the go.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 bg-white/5 border border-white/10 p-4 rounded-[20px] flex items-center gap-4 group hover:bg-white/10 transition-all cursor-pointer">
                  <div className="text-3xl">🍎</div>
                  <div>
                    <p className="text-[8px] uppercase font-black text-slate-500 tracking-widest">Available on</p>
                    <p className="text-sm font-black">App Store</p>
                  </div>
                </div>
                <div className="flex-1 bg-white/5 border border-white/10 p-4 rounded-[20px] flex items-center gap-4 group hover:bg-white/10 transition-all cursor-pointer">
                  <div className="text-3xl">🤖</div>
                  <div>
                    <p className="text-[8px] uppercase font-black text-slate-500 tracking-widest">Get it on</p>
                    <p className="text-sm font-black">Google Play</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/5 mt-24 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">
            <p>&copy; {new Date().getFullYear()} Shaku Maku. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-12">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
