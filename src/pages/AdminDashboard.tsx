import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import { 
  LayoutDashboard, 
  Store, 
  ShieldCheck, 
  MessageSquare, 
  Settings, 
  Search, 
  Filter, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Loader2,
  ArrowLeft,
  Image as ImageIcon,
  TrendingUp,
  MapPin,
  Phone,
  Globe,
  ChevronRight,
  ExternalLink,
  Eye,
  EyeOff,
  Star,
  Clock,
  Plus,
  Upload,
  FileText,
  Send,
  Trash2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Save
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useAdmin, ClaimRequest } from '@/hooks/useAdmin';
import { Business, Post } from '@/lib/supabase';
import { useBuildMode } from '@/hooks/useBuildMode';
import { heroService, HeroSlide as SupabaseHeroSlide } from '@/lib/heroService';
import { CATEGORIES, GOVERNORATES } from '@/constants';

export default function AdminDashboard() {
  const { profile, user } = useAuthStore();
  const navigate = useNavigate();
  const admin = useAdmin();
  
  const [activeTab, setActiveTab] = useState<'summary' | 'businesses' | 'featured' | 'settings'>('summary');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const isAdmin = profile?.role === 'admin';

  // Mock Summary Data
  const mockSummary = {
    totalBusinesses: 1248,
    totalPosts: 342,
    pendingClaims: 12,
    verifiedBusinesses: 856,
    featuredBusinesses: 45,
    trendingItems: 18,
    activeUsers: 2104,
    monthlyGrowth: '+12%'
  };

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-bg-warm flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[48px] p-12 shadow-2xl text-center border border-slate-100"
        >
          <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-3xl font-black text-text-main mb-4 poppins-bold uppercase tracking-tight">Access Denied</h2>
          <p className="text-text-muted mb-10 font-medium leading-relaxed">
            This area is restricted to platform administrators only. If you believe this is an error, please contact support.
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark transition-all uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Safety
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-warm flex text-text-main">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-slate-100 transition-all duration-500 flex flex-col shadow-2xl shadow-slate-200/50 relative z-20 ${isSidebarOpen ? 'w-80' : 'w-20'}`}>
        <div className="p-8 flex items-center justify-between">
          {isSidebarOpen && (
            <Link to="/" className="group">
              <h1 className="text-2xl font-black text-primary tracking-tighter poppins-bold uppercase">ADMIN PANEL</h1>
              <div className="h-1 w-8 bg-accent rounded-full mt-1 group-hover:w-full transition-all duration-500" />
            </Link>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <ChevronRight className={`w-5 h-5 transition-transform duration-500 ${isSidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-8">
          <NavItem 
            icon={<LayoutDashboard />} 
            label="Dashboard" 
            active={activeTab === 'summary'} 
            onClick={() => setActiveTab('summary')}
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<Store />} 
            label="Businesses" 
            active={activeTab === 'businesses'} 
            onClick={() => setActiveTab('businesses')}
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<Star />} 
            label="Featured" 
            active={activeTab === 'featured'} 
            onClick={() => setActiveTab('featured')}
            collapsed={!isSidebarOpen}
          />
          <NavItem 
            icon={<Settings />} 
            label="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')}
            collapsed={!isSidebarOpen}
          />
        </nav>

        <div className="p-6">
          <div className={`p-4 bg-slate-50 rounded-[24px] border border-slate-100 transition-all ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Logged in as</p>
            <p className="text-xs font-black truncate">{profile?.full_name || 'Administrator'}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-hidden flex flex-col">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-10 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <h2 className="text-xl font-black uppercase tracking-widest poppins-bold text-text-main">
            {activeTab === 'summary' && 'Platform Overview'}
            {activeTab === 'businesses' && 'Business Management'}
            {activeTab === 'featured' && 'Featured & Trending'}
            {activeTab === 'settings' && 'System Settings'}
          </h2>
          
          <div className="flex items-center gap-4">
            <button 
              className="p-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-primary"
            >
              <TrendingUp className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg">
              {profile?.full_name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-10">
            <AnimatePresence mode="wait">
              {activeTab === 'summary' && (
                <motion.div 
                  key="summary"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                >
                  <StatCard 
                    label="Total Businesses" 
                    value={mockSummary.totalBusinesses} 
                    icon={<Store className="text-blue-500" />}
                    color="blue"
                  />
                  <StatCard 
                    label="Total Posts" 
                    value={mockSummary.totalPosts} 
                    icon={<MessageSquare className="text-purple-500" />}
                    color="purple"
                  />
                  <StatCard 
                    label="Pending Claims" 
                    value={mockSummary.pendingClaims} 
                    icon={<ShieldCheck className="text-orange-500" />}
                    color="orange"
                    highlight={mockSummary.pendingClaims > 0}
                  />
                  <StatCard 
                    label="Verified" 
                    value={mockSummary.verifiedBusinesses} 
                    icon={<CheckCircle2 className="text-green-500" />}
                    color="green"
                  />
                  <StatCard 
                    label="Featured" 
                    value={mockSummary.featuredBusinesses} 
                    icon={<Star className="text-cyan-500" />}
                    color="cyan"
                  />
                  <StatCard 
                    label="Trending" 
                    value={mockSummary.trendingItems} 
                    icon={<TrendingUp className="text-rose-500" />}
                    color="rose"
                  />
                  <StatCard 
                    label="Active Users" 
                    value={mockSummary.activeUsers} 
                    icon={<Globe className="text-indigo-500" />}
                    color="indigo"
                  />
                  <StatCard 
                    label="Growth" 
                    value={mockSummary.monthlyGrowth} 
                    icon={<TrendingUp className="text-emerald-500" />}
                    color="emerald"
                  />
                </motion.div>
              )}

              {activeTab === 'businesses' && <BusinessManager admin={admin} />}
              {activeTab === 'featured' && <FeaturedManager />}
              {activeTab === 'settings' && <SettingsManager />}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, collapsed, badge }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-4 rounded-[20px] font-black text-[11px] uppercase tracking-widest transition-all duration-300 relative group ${active ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' : 'text-slate-400 hover:bg-slate-50 hover:text-primary'}`}
    >
      <div className={`shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {React.cloneElement(icon, { className: "w-5 h-5" })}
      </div>
      {!collapsed && <span className="truncate">{label}</span>}
      {badge !== undefined && (
        <span className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${active ? 'bg-accent text-white' : 'bg-accent/10 text-accent'}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function StatCard({ label, value, icon, color, highlight }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    green: 'bg-green-50 text-green-600'
  };

  return (
    <div className={`bg-white p-8 rounded-[40px] border border-slate-100 shadow-premium transition-all hover:shadow-2xl hover:-translate-y-1 group ${highlight ? 'ring-2 ring-orange-200' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center shadow-inner transition-transform group-hover:rotate-12 ${colors[color]}`}>
          {React.cloneElement(icon, { className: "w-7 h-7" })}
        </div>
        {highlight && <div className="w-3 h-3 rounded-full bg-orange-500 animate-ping" />}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{label}</p>
      <p className="text-4xl font-black poppins-bold">{value}</p>
    </div>
  );
}

// --- Sub-components (BusinessManager, ClaimManager, ContentManager) ---

function BusinessManager({ admin }: { admin: any }) {
  const [searchFilters, setSearchFilters] = useState({ name: '', phone: '', category: '', governorate: '' });
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<any | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    // Mock search results for frontend-only feel
    setTimeout(() => {
      setBusinesses([
        {
          id: '1',
          name: 'Al-Mansour Restaurant',
          nameAr: 'مطعم المنصور',
          category: 'restaurants',
          governorate: 'baghdad',
          city: 'Mansour',
          phone: '07701234567',
          isVerified: true,
          isFeatured: true,
          image: 'https://picsum.photos/seed/restaurant/400/300'
        },
        {
          id: '2',
          name: 'Babylon Hotel',
          nameAr: 'فندق بابل',
          category: 'hotels',
          governorate: 'baghdad',
          city: 'Jadriya',
          phone: '07801234567',
          isVerified: true,
          isFeatured: false,
          image: 'https://picsum.photos/seed/hotel/400/300'
        }
      ] as any);
      setLoading(false);
    }, 500);
  };

  const handleUpdate = async (id: string, updates: any) => {
    alert('Changes saved (Mock)');
    setEditingBusiness(null);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-premium">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Name</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="text" 
                value={searchFilters.name}
                onChange={e => setSearchFilters({...searchFilters, name: e.target.value})}
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary transition-all text-sm font-medium"
                placeholder="Search name..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
            <input 
              type="text" 
              value={searchFilters.phone}
              onChange={e => setSearchFilters({...searchFilters, phone: e.target.value})}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary transition-all text-sm font-medium"
              placeholder="07XXXXXXXX"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
            <select 
              value={searchFilters.category}
              onChange={e => setSearchFilters({...searchFilters, category: e.target.value})}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary transition-all text-sm font-medium"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name.en}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Governorate</label>
            <select 
              value={searchFilters.governorate}
              onChange={e => setSearchFilters({...searchFilters, governorate: e.target.value})}
              className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary transition-all text-sm font-medium"
            >
              <option value="">All Governorates</option>
              {GOVERNORATES.map(g => <option key={g.id} value={g.id}>{g.name.en}</option>)}
            </select>
          </div>
          <div className="space-y-2 flex flex-col justify-end">
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Filter className="w-4 h-4" /> Apply Filters</>}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-[48px] border border-slate-100 shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Business</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {businesses.map(biz => (
                <tr key={biz.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img src={biz.image} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="font-black text-sm">{biz.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{biz.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-bold text-slate-600">{biz.city}, {biz.governorate}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{biz.phone}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      {biz.isVerified && <div className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-green-100">Verified</div>}
                      {biz.isFeatured && <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100">Featured</div>}
                      {!biz.isVerified && !biz.isFeatured && <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Standard</span>}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => setEditingBusiness(biz)}
                      className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {businesses.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium italic">
                    Search for businesses to manage them.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Business Modal */}
      <AnimatePresence>
        {editingBusiness && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingBusiness(null)}
              className="absolute inset-0 bg-primary-dark/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-10 border-b border-slate-100 flex items-center justify-between shrink-0">
                <h3 className="text-2xl font-black poppins-bold uppercase tracking-tight">Edit Business Profile</h3>
                <button onClick={() => setEditingBusiness(null)} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                  <XCircle className="w-6 h-6 text-slate-300" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormInput label="Business Name (EN)" value={editingBusiness.name} onChange={v => setEditingBusiness({...editingBusiness, name: v})} />
                  <FormInput label="Arabic Name (AR)" value={editingBusiness.nameAr || ''} onChange={v => setEditingBusiness({...editingBusiness, nameAr: v})} />
                  <FormInput label="Phone" value={editingBusiness.phone || ''} onChange={v => setEditingBusiness({...editingBusiness, phone: v})} />
                  <FormInput label="WhatsApp" value={editingBusiness.whatsapp || ''} onChange={v => setEditingBusiness({...editingBusiness, whatsapp: v})} />
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Governorate</label>
                    <select 
                      value={editingBusiness.governorate}
                      onChange={e => setEditingBusiness({...editingBusiness, governorate: e.target.value})}
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary text-sm font-medium"
                    >
                      {GOVERNORATES.map(g => <option key={g.id} value={g.id}>{g.name.en}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                    <select 
                      value={editingBusiness.category}
                      onChange={e => setEditingBusiness({...editingBusiness, category: e.target.value})}
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary text-sm font-medium"
                    >
                      {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name.en}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Image</label>
                      <div className="flex items-center gap-6">
                        <div className="w-32 h-32 rounded-3xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center relative group">
                          <img src={editingBusiness.image} className="w-full h-full object-cover" alt="" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <FormInput label="Image URL" value={editingBusiness.image} onChange={v => setEditingBusiness({...editingBusiness, image: v})} />
                          <p className="text-[9px] text-slate-400 font-medium italic">Paste a URL or click the image to upload (Simulation)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-10 p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                  <div className="flex items-center gap-4">
                    <input 
                      type="checkbox" 
                      id="isFeatured"
                      checked={editingBusiness.isFeatured}
                      onChange={e => setEditingBusiness({...editingBusiness, isFeatured: e.target.checked})}
                      className="w-6 h-6 rounded-lg text-primary focus:ring-primary"
                    />
                    <label htmlFor="isFeatured" className="text-sm font-black uppercase tracking-widest cursor-pointer">Featured Business</label>
                  </div>
                  <div className="flex items-center gap-4">
                    <input 
                      type="checkbox" 
                      id="isVerified"
                      checked={editingBusiness.isVerified}
                      onChange={e => setEditingBusiness({...editingBusiness, isVerified: e.target.checked})}
                      className="w-6 h-6 rounded-lg text-primary focus:ring-primary"
                    />
                    <label htmlFor="isVerified" className="text-sm font-black uppercase tracking-widest cursor-pointer">Verified Status</label>
                  </div>
                </div>
              </div>
              <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
                <button 
                  onClick={() => setEditingBusiness(null)}
                  className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleUpdate(editingBusiness.id, editingBusiness)}
                  className="px-12 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all uppercase tracking-widest text-[10px]"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MediaManager() {
  const [media, setMedia] = useState([
    { id: '1', type: 'hero', title: 'Main Hero Image (Where to go?)', url: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=1200&auto=format&fit=crop' },
    { id: '2', type: 'postcard', title: 'Restaurant Postcard', url: 'https://picsum.photos/seed/food/800/600' },
    { id: '3', type: 'category', title: 'Shopping Category', url: 'https://picsum.photos/seed/shop/400/400' },
  ]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {media.map(item => (
          <div key={item.id} className="bg-white rounded-[40px] border border-slate-100 shadow-premium overflow-hidden group">
            <div className="aspect-video relative overflow-hidden bg-slate-100">
              <img src={item.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button className="p-3 bg-white rounded-xl text-primary shadow-xl hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </button>
                <button className="p-3 bg-white rounded-xl text-red-500 shadow-xl hover:scale-110 transition-transform">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.type}</p>
                <p className="text-sm font-black">{item.title}</p>
              </div>
              <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-300 hover:text-primary transition-colors">
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        <button className="aspect-video rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-slate-300 hover:border-primary hover:text-primary transition-all bg-white/50">
          <Plus className="w-10 h-10" />
          <span className="text-xs font-black uppercase tracking-widest">Add New Asset</span>
        </button>
      </div>
      <div className="flex justify-end">
        <button className="px-12 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all uppercase tracking-widest text-[10px]">
          Save Media Layout
        </button>
      </div>
    </div>
  );
}

function FeaturedManager() {
  const [items, setItems] = useState([
    { id: '1', name: 'Al-Mansour Restaurant', type: 'Business', isFeatured: true, isTrending: true },
    { id: '2', name: 'Babylon Hotel', type: 'Business', isFeatured: true, isTrending: false },
    { id: '3', name: 'New Post: Best Kebab', type: 'Post', isFeatured: false, isTrending: true },
  ]);

  return (
    <div className="bg-white rounded-[48px] border border-slate-100 shadow-premium overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100">
            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Name</th>
            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Featured</th>
            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trending</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {items.map(item => (
            <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
              <td className="px-8 py-6 font-black text-sm">{item.name}</td>
              <td className="px-8 py-6">
                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest">{item.type}</span>
              </td>
              <td className="px-8 py-6">
                <button 
                  onClick={() => setItems(items.map(i => i.id === item.id ? {...i, isFeatured: !i.isFeatured} : i))}
                  className={`w-12 h-6 rounded-full transition-all relative ${item.isFeatured ? 'bg-primary' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${item.isFeatured ? 'right-1' : 'left-1'}`} />
                </button>
              </td>
              <td className="px-8 py-6">
                <button 
                  onClick={() => setItems(items.map(i => i.id === item.id ? {...i, isTrending: !i.isTrending} : i))}
                  className={`w-12 h-6 rounded-full transition-all relative ${item.isTrending ? 'bg-rose-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${item.isTrending ? 'right-1' : 'left-1'}`} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-10 border-t border-slate-50 bg-slate-50/30 flex justify-end">
        <button className="px-12 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all uppercase tracking-widest text-[10px]">
          Update Rankings
        </button>
      </div>
    </div>
  );
}

function TextContentManager() {
  const [content, setContent] = useState({
    heroTitle: 'وين تروح؟',
    heroSubtitle: 'محتار وين تروح؟ كل الخيارات صارت بيدك',
    featuredLabel: 'مختارات لك',
    trendingLabel: 'الأكثر تداولاً الآن',
    footerText: '© 2024 شكو ماكو. جميع الحقوق محفوظة.'
  });

  return (
    <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-premium space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h3 className="text-xl font-black poppins-bold uppercase tracking-tight flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6 text-primary" /> Homepage Hero
          </h3>
          <FormInput label="Main Title" value={content.heroTitle} onChange={v => setContent({...content, heroTitle: v})} />
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtitle</label>
            <textarea 
              value={content.heroSubtitle}
              onChange={e => setContent({...content, heroSubtitle: e.target.value})}
              className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary text-sm font-medium min-h-[100px]"
            />
          </div>
        </div>
        <div className="space-y-6">
          <h3 className="text-xl font-black poppins-bold uppercase tracking-tight flex items-center gap-3">
            <Star className="w-6 h-6 text-accent" /> Section Labels
          </h3>
          <FormInput label="Featured Section Label" value={content.featuredLabel} onChange={v => setContent({...content, featuredLabel: v})} />
          <FormInput label="Trending Section Label" value={content.trendingLabel} onChange={v => setContent({...content, trendingLabel: v})} />
          <FormInput label="Footer Copyright" value={content.footerText} onChange={v => setContent({...content, footerText: v})} />
        </div>
      </div>
      <div className="pt-10 border-t border-slate-50 flex justify-end">
        <button className="px-12 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all uppercase tracking-widest text-[10px]">
          Publish Changes
        </button>
      </div>
    </div>
  );
}

function SettingsManager() {
  return (
    <div className="max-w-3xl space-y-8">
      <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-premium space-y-8">
        <h3 className="text-xl font-black poppins-bold uppercase tracking-tight">System Configuration</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
            <div>
              <p className="text-sm font-black uppercase tracking-widest">Maintenance Mode</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Take the site offline for updates</p>
            </div>
            <button className="w-12 h-6 bg-slate-200 rounded-full relative">
              <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" />
            </button>
          </div>
          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
            <div>
              <p className="text-sm font-black uppercase tracking-widest">New User Registration</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Allow new users to create accounts</p>
            </div>
            <button className="w-12 h-6 bg-primary rounded-full relative">
              <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full" />
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-premium space-y-8">
        <h3 className="text-xl font-black poppins-bold uppercase tracking-tight">Admin Accounts</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border-b border-slate-50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-xs">S</div>
              <div>
                <p className="text-sm font-black">Safari Bo Safari</p>
                <p className="text-[10px] text-slate-400">safaribosafar@gmail.com</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[9px] font-black uppercase tracking-widest">Owner</span>
          </div>
        </div>
        <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-black uppercase tracking-widest text-[10px] hover:border-primary hover:text-primary transition-all">
          Add Administrator
        </button>
      </div>
    </div>
  );
}

function ClaimManager({ admin, onAction }: { admin: any; onAction: () => void }) {
  const [requests, setRequests] = useState<ClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    setLoading(true);
    const data = await admin.fetchClaimRequests();
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAction = async (request: ClaimRequest, action: 'approve' | 'reject') => {
    try {
      await admin.handleClaimAction(request.id, request.business_id, request.user_id, action, true);
      loadRequests();
      onAction();
    } catch (err) {
      alert(`Failed to ${action} claim`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[48px] border border-slate-100 shadow-premium overflow-hidden">
        <div className="p-10 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-black poppins-bold uppercase tracking-tight">Pending Claims</h3>
          <button onClick={loadRequests} className="p-2 text-slate-400 hover:text-primary transition-colors">
            <TrendingUp className="w-5 h-5" />
          </button>
        </div>
        <div className="divide-y divide-slate-50">
          {requests.map(req => (
            <div key={req.id} className="p-10 flex flex-col md:flex-row items-center gap-10 hover:bg-slate-50/30 transition-colors">
              <div className="w-20 h-20 bg-orange-50 rounded-[28px] flex items-center justify-center text-orange-500 shrink-0 shadow-inner">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-xl font-black mb-1">{req.business?.name || 'Unknown Business'}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-slate-400 font-bold text-xs uppercase tracking-widest mt-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{req.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>{req.profiles?.full_name || 'User'} ({req.profiles?.email})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(req.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleAction(req, 'reject')}
                  className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-400 font-black rounded-2xl hover:border-red-100 hover:text-red-500 transition-all uppercase tracking-widest text-[10px]"
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleAction(req, 'approve')}
                  className="px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all uppercase tracking-widest text-[10px] flex items-center gap-3"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve
                </button>
              </div>
            </div>
          ))}
          {requests.length === 0 && !loading && (
            <div className="p-24 text-center text-slate-400 font-medium italic">
              No pending claim requests at the moment.
            </div>
          )}
          {loading && (
            <div className="p-24 flex items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-slate-200" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ContentManager({ admin }: { admin: any }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ businessId: '', category: '', governorate: '' });
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ businessId: '', title: '', content: '', caption: '', image_url: '', likes: 0, views: 0 });

  const loadPosts = async () => {
    setLoading(true);
    const data = await admin.fetchPosts(filters);
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleUpdate = async (id: string, updates: any) => {
    try {
      await admin.updatePost(id, updates);
      loadPosts();
      setEditingPost(null);
    } catch (err) {
      alert('Failed to update post');
    }
  };

  const handleCreate = async () => {
    try {
      await admin.createPost(newPost);
      loadPosts();
      setShowCreatePost(false);
      setNewPost({ businessId: '', title: '', content: '', caption: '', image_url: '', likes: 0, views: 0 });
    } catch (err) {
      alert('Failed to create post');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-premium">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
              <select 
                value={filters.category}
                onChange={e => setFilters({...filters, category: e.target.value})}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#2CA6A4] text-sm font-medium"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name.en}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Governorate</label>
              <select 
                value={filters.governorate}
                onChange={e => setFilters({...filters, governorate: e.target.value})}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#2CA6A4] text-sm font-medium"
              >
                <option value="">All Governorates</option>
                {GOVERNORATES.map(g => <option key={g.id} value={g.id}>{g.name.en}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={loadPosts}
              className="px-8 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark transition-all uppercase tracking-widest text-[10px] flex items-center gap-3"
            >
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button 
              onClick={() => setShowCreatePost(true)}
              className="px-8 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark transition-all uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-xl shadow-primary/20"
            >
              <Plus className="w-4 h-4" /> Create Post
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map(post => (
          <div key={post.id} className={`bg-white rounded-[40px] border border-slate-100 shadow-premium overflow-hidden group transition-all hover:shadow-2xl ${post.status === 'hidden' ? 'opacity-60 grayscale' : ''}`}>
            <div className="aspect-video relative overflow-hidden bg-slate-100">
              {post.image ? (
                <img src={post.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-200">
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg">
                  {post.businessCategory}
                </div>
                {post.status === 'hidden' && (
                  <div className="px-3 py-1.5 bg-red-500 text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg">
                    Hidden
                  </div>
                )}
              </div>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <Store className="w-4 h-4" />
                </div>
                <p className="text-xs font-black uppercase tracking-tight truncate">{post.businessName}</p>
              </div>
              {post.title && <p className="text-sm font-black mb-2">{post.title}</p>}
              <p className="text-sm text-slate-600 font-medium line-clamp-3 mb-6 leading-relaxed italic">"{post.caption || post.content}"</p>
              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleUpdate(post.id, { status: post.status === 'hidden' ? 'visible' : 'hidden' })}
                    className={`p-2.5 rounded-xl transition-all ${post.status === 'hidden' ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                    title={post.status === 'hidden' ? 'Show Post' : 'Hide Post'}
                  >
                    {post.status === 'hidden' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => setEditingPost(post)}
                    className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-primary transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-[#E87A41]">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-xs font-black">{post.likes}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreatePost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreatePost(false)}
              className="absolute inset-0 bg-[#1A2B4B]/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-2xl font-black poppins-bold uppercase tracking-tight">Create New Post</h3>
                <button onClick={() => setShowCreatePost(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                  <XCircle className="w-6 h-6 text-slate-300" />
                </button>
              </div>
              <div className="p-10 space-y-8 overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign to Business (Optional ID)</label>
                  <input 
                    type="text" 
                    value={newPost.businessId}
                    onChange={e => setNewPost({...newPost, businessId: e.target.value})}
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#2CA6A4] text-sm font-medium"
                    placeholder="Leave empty for general feed"
                  />
                </div>
                <FormInput label="Post Title" value={newPost.title} onChange={(v: string) => setNewPost({...newPost, title: v})} />
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Caption / Content</label>
                  <textarea 
                    value={newPost.content}
                    onChange={e => setNewPost({...newPost, content: e.target.value, caption: e.target.value})}
                    className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-2 focus:ring-primary min-h-[120px] text-sm font-medium leading-relaxed"
                    placeholder="Write in Arabic or English..."
                  />
                </div>
                <FormInput label="Image URL" value={newPost.image_url} onChange={(v: string) => setNewPost({...newPost, image_url: v})} />
                
                <div className="grid grid-cols-2 gap-6">
                  <FormInput label="Fake Likes" type="number" value={newPost.likes} onChange={(v: string) => setNewPost({...newPost, likes: parseInt(v) || 0})} />
                  <FormInput label="Fake Views" type="number" value={newPost.views} onChange={(v: string) => setNewPost({...newPost, views: parseInt(v) || 0})} />
                </div>
              </div>
              <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
                <button 
                  onClick={() => setShowCreatePost(false)}
                  className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreate}
                  className="px-12 py-4 bg-[#2CA6A4] text-white font-black rounded-2xl shadow-xl shadow-[#2CA6A4]/20 hover:bg-[#1e7a78] transition-all uppercase tracking-widest text-[10px]"
                >
                  Publish Post
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BulkUploadManager({ admin }: { admin: any }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ valid: 0, invalid: 0, duplicates: 0 });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        const processed = data.map(item => {
          const phone = item.phone || item.phone_1;
          const isValidPhone = /^(\+964|0)?7[0-9]{9}$/.test(phone || '');
          return { ...item, isValidPhone };
        });
        
        setPreview(processed);
        setStats({
          valid: processed.filter(p => p.isValidPhone).length,
          invalid: processed.filter(p => !p.isValidPhone).length,
          duplicates: 0 // Simple placeholder
        });
      }
    });
  };

  const handleUpload = async () => {
    if (preview.length === 0) return;
    setLoading(true);
    try {
      const validBusinesses = preview
        .filter(p => p.isValidPhone)
        .map(p => ({
          name: p.name,
          phone_1: p.phone || p.phone_1,
          category: p.category,
          governorate: p.governorate,
          city: p.city || p.governorate,
          address: p.address || ''
        }));
      
      await admin.bulkUploadBusinesses(validBusinesses);
      alert(`Successfully uploaded ${validBusinesses.length} businesses`);
      setPreview([]);
      setFile(null);
    } catch (err) {
      alert('Failed to upload businesses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-premium text-center">
        <div className="max-w-xl mx-auto">
          <div className="w-20 h-20 bg-blue-50 rounded-[28px] flex items-center justify-center text-blue-500 mx-auto mb-6 shadow-inner">
            <Upload className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black poppins-bold uppercase tracking-tight mb-4">Bulk Import Businesses</h3>
          <p className="text-slate-500 mb-10 font-medium">Upload a CSV file with name, phone, category, and governorate. We'll validate the Iraqi phone format automatically.</p>
          
          <label className="block">
            <span className="sr-only">Choose CSV file</span>
            <input 
              type="file" 
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-4 file:px-8 file:rounded-2xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-primary file:text-white hover:file:bg-primary-dark transition-all cursor-pointer"
            />
          </label>
        </div>
      </div>

      {preview.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[48px] border border-slate-100 shadow-premium overflow-hidden"
        >
          <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valid</p>
                <p className="text-xl font-black text-green-600">{stats.valid}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Invalid</p>
                <p className="text-xl font-black text-red-500">{stats.invalid}</p>
              </div>
            </div>
            <button 
              onClick={handleUpload}
              disabled={loading || stats.valid === 0}
              className="px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all uppercase tracking-widest text-[10px] flex items-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Import {stats.valid} Records</>}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {preview.slice(0, 50).map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-6 font-black text-sm">{p.name}</td>
                    <td className="px-8 py-6 text-xs font-bold text-slate-600">{p.phone || p.phone_1}</td>
                    <td className="px-8 py-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.category}</td>
                    <td className="px-8 py-6">
                      {p.isValidPhone ? (
                        <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-green-100">Valid</span>
                      ) : (
                        <span className="px-3 py-1 bg-red-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">Invalid Format</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 50 && (
              <div className="p-6 text-center text-slate-400 text-xs font-medium bg-slate-50/30">
                Showing first 50 of {preview.length} records...
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function MessagingManager({ admin }: { admin: any }) {
  const [template, setTemplate] = useState("Hello {{name}}, your business is listed. Claim it here: {{link}}");
  const [batchSize, setBatchSize] = useState(50);
  const [delay, setDelay] = useState(3);
  const [isDryRun, setIsDryRun] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState({ sent: 0, failed: 0, total: 0 });

  const handleStartOutreach = () => {
    setIsSending(true);
    setProgress({ sent: 0, failed: 0, total: batchSize });
    
    // Simulate batch sending
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setProgress(prev => ({ ...prev, sent: current }));
      
      if (current >= batchSize) {
        clearInterval(interval);
        setIsSending(false);
        alert(`Outreach complete! ${isDryRun ? '(Dry Run Mode)' : ''}`);
      }
    }, delay * 100); // Faster for demo
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-premium space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 shadow-inner">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black poppins-bold uppercase tracking-tight">Message Template</h3>
          </div>
          
          <div className="space-y-4">
            <textarea 
              value={template}
              onChange={e => setTemplate(e.target.value)}
              className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[32px] focus:ring-2 focus:ring-primary min-h-[180px] text-sm font-medium leading-relaxed"
              placeholder="Enter your message template..."
            />
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest">{"{{name}}"}</span>
              <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest">{"{{link}}"}</span>
              <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest">{"{{category}}"}</span>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Preview</p>
            <div className="p-6 bg-[#FAF9F6] rounded-2xl border border-slate-100 text-sm italic text-slate-600 leading-relaxed">
              "{template.replace('{{name}}', 'Al-Mansour Restaurant').replace('{{link}}', 'belive.iq/claim/123')}"
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-premium space-y-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
            <Settings className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black poppins-bold uppercase tracking-tight">Outreach Settings</h3>
        </div>

          <div className="grid grid-cols-2 gap-6">
            <FormInput label="Batch Size" type="number" value={batchSize} onChange={(v: string) => setBatchSize(parseInt(v) || 0)} />
            <FormInput label="Delay (Seconds)" type="number" value={delay} onChange={(v: string) => setDelay(parseInt(v) || 0)} />
          </div>

          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="text-sm font-black uppercase tracking-widest">Dry Run Mode</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">No real messages will be sent</p>
            </div>
            <button 
              onClick={() => setIsDryRun(!isDryRun)}
              className={`w-14 h-8 rounded-full transition-all relative ${isDryRun ? 'bg-primary' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${isDryRun ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

            <button 
              onClick={handleStartOutreach}
              disabled={isSending}
              className="w-full py-6 bg-primary text-white font-black rounded-3xl hover:bg-primary-dark transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-4 shadow-2xl shadow-slate-200 disabled:opacity-50"
            >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Start Outreach Campaign</>}
          </button>

          {isSending && (
            <div className="space-y-4 pt-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span>Sending Progress</span>
                <span>{Math.round((progress.sent / progress.total) * 100)}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${(progress.sent / progress.total) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">Sent {progress.sent} of {progress.total} messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, type = "text" }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#2CA6A4] text-sm font-medium"
      />
    </div>
  );
}
