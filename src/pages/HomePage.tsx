import { useState } from "react";
import { Search, User, PlusCircle, MapPin, LayoutGrid, Sparkles, Compass, LogOut, Settings } from "lucide-react";
import HeroSection from "@/components/home/HeroSection";
import LocationFilter from "@/components/home/LocationFilter";
import StoryRow from "@/components/home/StoryRow";
import CategoryGrid from "@/components/home/CategoryGrid";
import TrendingSection from "@/components/home/TrendingSection";
import BusinessGrid from "@/components/home/BusinessGrid";
import AuthModal from "@/components/auth/AuthModal";
import BusinessDetailModal from "@/components/home/BusinessDetailModal";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useAuthStore } from "@/stores/authStore";
import type { Business } from "@/lib/supabase";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { user, profile, signOut, loading: authLoading } = useAuthStore();
  const { 
    businesses, 
    loading: businessesLoading, 
    error, 
    hasMore, 
    loadMore 
  } = useBusinesses(searchQuery);

  const featuredBusinesses = businesses.filter(b => b.isFeatured);

  return (
    <div className="min-h-screen bg-[#F5F7F9] selection:bg-[#2CA6A4]/30">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <BusinessDetailModal business={selectedBusiness} onClose={() => setSelectedBusiness(null)} />

      {/* Sticky Header */}
      <header className="sticky top-0 z-[60] bg-white/80 backdrop-blur-xl border-b border-[#E5E7EB] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 group cursor-pointer flex-shrink-0" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-11 h-11 bg-gradient-to-br from-[#2CA6A4] to-[#1e7a78] rounded-[14px] flex items-center justify-center shadow-lg shadow-[#2CA6A4]/20 group-hover:scale-105 transition-all duration-500">
              <span className="text-white font-black text-2xl poppins-bold">S</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-black text-[#2B2F33] poppins-bold tracking-tight leading-none">Shakou Marku</h1>
              <p className="text-[9px] text-[#2CA6A4] font-black uppercase tracking-[0.3em] mt-1">Iraqi Directory</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] group-focus-within:text-[#2CA6A4] transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search businesses, services, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#F5F7F9] border-2 border-transparent focus:border-[#2CA6A4] focus:bg-white rounded-2xl focus:outline-none transition-all duration-300 text-sm font-medium shadow-inner"
            />
          </div>

          {/* Languages */}
          <div className="hidden xl:flex items-center gap-4 px-4 border-x border-[#E5E7EB]">
            <button className="text-[10px] font-black text-[#2CA6A4] hover:opacity-80 transition-opacity">ENGLISH</button>
            <button className="text-[10px] font-black text-[#2B2F33] hover:text-[#2CA6A4] transition-colors">العربية</button>
            <button className="text-[10px] font-black text-[#2B2F33] hover:text-[#2CA6A4] transition-colors">کوردی</button>
            <button className="text-[10px] font-black text-[#2B2F33] hover:text-[#2CA6A4] transition-colors">سۆرانی</button>
            <button className="text-[10px] font-black text-[#2B2F33] hover:text-[#2CA6A4] transition-colors">ناوه‌ندی</button>
            <button className="text-[10px] font-black text-[#2B2F33] hover:text-[#2CA6A4] transition-colors">فارسی</button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {authLoading ? (
              <div className="w-11 h-11 rounded-xl bg-[#F5F7F9] animate-pulse" />
            ) : (
              <>
                {profile?.role === 'business_owner' && (
                  <button 
                    className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-[#E87A41] text-white text-xs font-black rounded-xl shadow-lg shadow-[#E87A41]/20 hover:bg-[#d16a35] hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Manage Business
                  </button>
                )}
                
                {!user ? (
                  <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="w-11 h-11 rounded-xl bg-white border-2 border-[#E5E7EB] flex items-center justify-center transition-all hover:border-[#2CA6A4] hover:text-[#2CA6A4] shadow-sm"
                  >
                    <User className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="relative">
                    <button 
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border-2 border-[#E5E7EB] hover:border-[#2CA6A4] transition-all shadow-sm"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#2CA6A4] flex items-center justify-center text-white text-[10px] font-black">
                        {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div className="hidden sm:block text-left">
                        <p className="text-[10px] font-black text-[#2B2F33] leading-none truncate max-w-[80px]">
                          {profile?.full_name || 'User'}
                        </p>
                        <p className="text-[8px] font-bold text-[#6B7280] uppercase tracking-tighter mt-0.5">
                          {profile?.role === 'business_owner' ? 'Owner' : 'Member'}
                        </p>
                      </div>
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] py-2 z-[70]">
                        <div className="px-4 py-2 border-b border-[#E5E7EB] mb-2">
                          <p className="text-[10px] font-black text-[#2B2F33] truncate">{user.email}</p>
                        </div>
                        <button className="w-full px-4 py-2 text-left text-xs font-bold text-[#6B7280] hover:bg-[#F5F7F9] hover:text-[#2CA6A4] flex items-center gap-2 transition-colors">
                          <Settings className="w-4 h-4" /> Settings
                        </button>
                        <button 
                          onClick={() => {
                            signOut();
                            setShowUserMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      <main className="pb-24">
        {/* 2. HERO / FEATURED SECTION */}
        <HeroSection 
          businesses={featuredBusinesses} 
          onBusinessClick={setSelectedBusiness}
        />

        {/* 3. GOVERNORATE & CITY FILTERS */}
        <div className="mt-12">
          <LocationFilter />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          {/* 4. CATEGORY GRID SECTION */}
          <section className="bg-[#0f172a] rounded-[48px] p-4 sm:p-8 shadow-2xl shadow-black/20 border border-white/5">
            <CategoryGrid />
          </section>

          {/* 5. TRENDING SECTION */}
          <section className="bg-[#F5F7F9] rounded-[48px] p-8 sm:p-12 border border-[#E5E7EB]">
            <TrendingSection 
              businesses={businesses} 
              loading={businessesLoading} 
              onBusinessClick={setSelectedBusiness}
            />
          </section>

          {/* 6. MAIN EXPLORE SECTION */}
          <section className="bg-white rounded-[48px] p-8 sm:p-12 shadow-xl shadow-black/5 border border-[#E5E7EB]">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <div className="flex items-center gap-2 text-[#2CA6A4] mb-2">
                  <Compass className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Directory</span>
                </div>
                <h2 className="text-3xl font-black text-[#2B2F33] poppins-bold tracking-tight">Explore Businesses</h2>
                <p className="text-base text-[#6B7280] mt-1">Discover the best local services across Iraq</p>
              </div>
              
              <div className="flex items-center gap-2 bg-[#F5F7F9] p-1.5 rounded-xl border border-[#E5E7EB]">
                <button className="px-4 py-2 bg-[#2CA6A4] text-white text-[10px] font-black rounded-lg uppercase tracking-widest shadow-md">Grid</button>
                <button className="px-4 py-2 text-[#6B7280] text-[10px] font-black rounded-lg uppercase tracking-widest hover:bg-white">Map</button>
              </div>
            </div>
            
            {error && (
              <div className="p-8 bg-red-50 border-2 border-red-100 rounded-[32px] text-center mb-12">
                <p className="text-red-600 font-bold mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl text-sm"
                >
                  Retry Loading
                </button>
              </div>
            )}

            <BusinessGrid 
              businesses={businesses} 
              loading={businessesLoading} 
              hasMore={hasMore}
              onLoadMore={loadMore}
              onBusinessClick={setSelectedBusiness}
            />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1A1D1F] text-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-[#2CA6A4] rounded-2xl flex items-center justify-center shadow-xl shadow-[#2CA6A4]/20">
                  <span className="text-white font-black text-2xl poppins-bold">S</span>
                </div>
                <h3 className="text-3xl font-black poppins-bold tracking-tighter">Shakou Marku</h3>
              </div>
              <p className="text-gray-400 leading-relaxed mb-10 text-base max-w-sm">
                Iraq's most trusted business discovery platform. Connecting millions of users with local businesses across all 19 governorates.
              </p>
              <div className="flex gap-4">
                {['facebook', 'instagram', 'twitter', 'linkedin'].map(social => (
                  <a key={social} href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#2CA6A4] hover:border-[#2CA6A4] transition-all duration-500 group">
                    <span className="text-[10px] font-black uppercase tracking-tighter group-hover:scale-110 transition-transform">{social.slice(0, 2)}</span>
                  </a>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <h4 className="text-xs font-black text-[#2CA6A4] uppercase tracking-[0.3em] mb-8">Directory</h4>
              <ul className="space-y-4 text-sm font-bold text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Browse Categories</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Popular Cities</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Featured Listings</a></li>
                <li><a href="#" className="hover:text-white transition-colors">New Businesses</a></li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-xs font-black text-[#2CA6A4] uppercase tracking-[0.3em] mb-8">For Business</h4>
              <ul className="space-y-4 text-sm font-bold text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Claim Listing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Advertise</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Business Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              </ul>
            </div>

            <div className="lg:col-span-4">
              <h4 className="text-xs font-black text-[#2CA6A4] uppercase tracking-[0.3em] mb-8">Mobile App</h4>
              <p className="text-sm text-gray-500 mb-8 font-medium">Download the Shakou Marku app for the best experience on the go.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#" className="flex-1 bg-white/5 border border-white/10 p-4 rounded-[20px] flex items-center gap-4 hover:bg-white/10 transition-all group">
                  <div className="text-3xl group-hover:scale-110 transition-transform">🍎</div>
                  <div>
                    <p className="text-[8px] uppercase font-black text-gray-500 tracking-widest">Available on</p>
                    <p className="text-sm font-black">App Store</p>
                  </div>
                </a>
                <a href="#" className="flex-1 bg-white/5 border border-white/10 p-4 rounded-[20px] flex items-center gap-4 hover:bg-white/10 transition-all group">
                  <div className="text-3xl group-hover:scale-110 transition-transform">🤖</div>
                  <div>
                    <p className="text-[8px] uppercase font-black text-gray-500 tracking-widest">Get it on</p>
                    <p className="text-sm font-black">Google Play</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/5 mt-24 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">
            <p>&copy; {new Date().getFullYear()} SHAKOU MARKU. ALL RIGHTS RESERVED.</p>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/20 font-black text-[10px]">SM</div>
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
