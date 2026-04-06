import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Store, 
  PlusCircle, 
  Settings, 
  Image as ImageIcon, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Phone,
  Globe,
  MapPin,
  ChevronRight,
  ArrowLeft,
  Star,
  Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useBusinessManagement } from '@/hooks/useBusinessManagement';
import { usePosts } from '@/hooks/usePosts';
import { Business } from '@/lib/supabase';

export default function BusinessDashboard() {
  const { profile } = useAuthStore();
  const { getOwnedBusinesses, updateBusinessProfile, loading: businessLoading } = useBusinessManagement();
  const [ownedBusinesses, setOwnedBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'settings'>('overview');
  
  // Post Form State
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState('');
  const { posts, createPost, loading: postsLoading } = usePosts(
    selectedBusiness?.id,
    selectedBusiness?.name,
    selectedBusiness?.image
  );
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  // Profile Edit State
  const [editForm, setEditForm] = useState<Partial<Business>>({});
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    const fetchOwned = async () => {
      const data = await getOwnedBusinesses();
      setOwnedBusinesses(data);
      if (data.length > 0) {
        setSelectedBusiness(data[0]);
        setEditForm(data[0]);
      }
    };
    fetchOwned();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusiness || !postContent.trim()) return;

    setIsSubmittingPost(true);
    try {
      await createPost(postContent, postImage);
      setPostContent('');
      setPostImage('');
      setPostSuccess(true);
      setTimeout(() => setPostSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusiness) return;

    setIsUpdatingProfile(true);
    try {
      await updateBusinessProfile(selectedBusiness.id, editForm);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
      // Refresh business data
      const data = await getOwnedBusinesses();
      setOwnedBusinesses(data);
      const updated = data.find(b => b.id === selectedBusiness.id);
      if (updated) setSelectedBusiness(updated);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  if (profile?.role !== 'business_owner') {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[32px] p-8 shadow-xl text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#2B2F33] mb-2">Access Denied</h2>
          <p className="text-[#6B7280]">Only business owners can access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-[#E5E7EB] hidden lg:flex flex-col">
        <div className="p-8">
          <h1 className="text-2xl font-black text-[#2CA6A4] tracking-tighter poppins-bold">SHAKO MAKO</h1>
          <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mt-1">Business Dashboard</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <Link 
            to="/"
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm text-[#6B7280] hover:bg-[#F5F7F9] transition-all mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${activeTab === 'overview' ? 'bg-[#2CA6A4] text-white shadow-lg shadow-[#2CA6A4]/20' : 'text-[#6B7280] hover:bg-[#F5F7F9]'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('posts')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${activeTab === 'posts' ? 'bg-[#2CA6A4] text-white shadow-lg shadow-[#2CA6A4]/20' : 'text-[#6B7280] hover:bg-[#F5F7F9]'}`}
          >
            <PlusCircle className="w-5 h-5" />
            Create Posts
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${activeTab === 'settings' ? 'bg-[#2CA6A4] text-white shadow-lg shadow-[#2CA6A4]/20' : 'text-[#6B7280] hover:bg-[#F5F7F9]'}`}
          >
            <Settings className="w-5 h-5" />
            Profile Settings
          </button>
        </nav>

        <div className="p-6 mt-auto">
          <div className="p-4 bg-[#F5F7F9] rounded-2xl">
            <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2">Logged in as</p>
            <p className="text-sm font-bold text-[#2B2F33] truncate">{profile.full_name}</p>
            <p className="text-[10px] text-[#2CA6A4] font-bold uppercase tracking-widest mt-0.5">Business Owner</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-[#E5E7EB] px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Store className="w-6 h-6 text-[#2CA6A4]" />
            <select 
              className="bg-transparent font-bold text-[#2B2F33] focus:outline-none cursor-pointer"
              value={selectedBusiness?.id || ''}
              onChange={(e) => {
                const b = ownedBusinesses.find(ob => ob.id === e.target.value);
                if (b) {
                  setSelectedBusiness(b);
                  setEditForm(b);
                }
              }}
            >
              {ownedBusinesses.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-xl bg-[#F5F7F9] text-[#6B7280] hover:bg-[#E5E7EB] transition-all">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-[32px] border border-[#E5E7EB] shadow-sm">
                    <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-1">Total Posts</p>
                    <p className="text-3xl font-bold text-[#2B2F33]">{posts.length}</p>
                  </div>
                  <div className="bg-white p-6 rounded-[32px] border border-[#E5E7EB] shadow-sm">
                    <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-1">Total Likes</p>
                    <p className="text-3xl font-bold text-[#2B2F33]">
                      {posts.reduce((acc, p) => acc + p.likes, 0)}
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-[32px] border border-[#E5E7EB] shadow-sm">
                    <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-1">Rating</p>
                    <p className="text-3xl font-bold text-[#2B2F33] flex items-center gap-2">
                      {selectedBusiness?.rating?.toFixed(1) || 'N/A'}
                      <Star className="w-6 h-6 text-[#E87A41] fill-[#E87A41]" />
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-[32px] border border-[#E5E7EB] shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
                    <h3 className="font-bold text-[#2B2F33]">Recent Posts</h3>
                    <button 
                      onClick={() => setActiveTab('posts')}
                      className="text-xs font-bold text-[#2CA6A4] hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="divide-y divide-[#E5E7EB]">
                    {posts.slice(0, 5).map(post => (
                      <div key={post.id} className="p-6 flex items-center gap-4">
                        {post.image && (
                          <img src={post.image} className="w-16 h-16 rounded-xl object-cover" alt="" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm text-[#2B2F33] font-medium line-clamp-1">{post.content}</p>
                          <p className="text-[10px] text-[#6B7280] mt-1">{post.createdAt.toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[#E87A41]">
                          <Heart className="w-4 h-4 fill-current" />
                          <span className="text-xs font-bold">{post.likes}</span>
                        </div>
                      </div>
                    ))}
                    {posts.length === 0 && (
                      <div className="p-12 text-center text-[#6B7280]">
                        <p>No posts yet. Start sharing updates with your customers!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-[32px] border border-[#E5E7EB] shadow-xl">
                  <h3 className="text-xl font-bold text-[#2B2F33] mb-6 poppins-bold">Create New Post</h3>
                  <form onSubmit={handleCreatePost} className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2">Post Content</label>
                      <textarea 
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        className="w-full p-4 bg-[#F5F7F9] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#2CA6A4] focus:border-transparent transition-all min-h-[120px]"
                        placeholder="What's new with your business?"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-2">Image URL (Optional)</label>
                      <div className="relative">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                        <input 
                          type="url"
                          value={postImage}
                          onChange={(e) => setPostImage(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-[#F5F7F9] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#2CA6A4] focus:border-transparent transition-all"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    </div>
                    
                    {postSuccess && (
                      <div className="p-4 bg-[#2CA6A4]/5 border border-[#2CA6A4]/20 rounded-2xl flex items-center gap-3 text-[#2CA6A4] font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5" />
                        Post created successfully!
                      </div>
                    )}

                    <button 
                      type="submit"
                      disabled={isSubmittingPost}
                      className="w-full py-4 bg-[#2CA6A4] text-white font-black rounded-2xl shadow-xl shadow-[#2CA6A4]/20 hover:bg-[#1e7a78] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs disabled:opacity-50"
                    >
                      {isSubmittingPost ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Publish Post</>}
                    </button>
                  </form>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-[#2B2F33]">Your Posts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {posts.map(post => (
                      <div key={post.id} className="bg-white rounded-[24px] border border-[#E5E7EB] overflow-hidden shadow-sm hover:shadow-md transition-all">
                        {post.image && (
                          <img src={post.image} className="w-full h-48 object-cover" alt="" />
                        )}
                        <div className="p-6">
                          <p className="text-sm text-[#2B2F33] leading-relaxed mb-4">{post.content}</p>
                          <div className="flex items-center justify-between pt-4 border-t border-[#F5F7F9]">
                            <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-widest">{post.createdAt.toLocaleDateString()}</span>
                            <div className="flex items-center gap-1 text-[#E87A41]">
                              <Heart className="w-4 h-4 fill-current" />
                              <span className="text-xs font-bold">{post.likes}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white p-8 rounded-[32px] border border-[#E5E7EB] shadow-xl">
                <h3 className="text-xl font-bold text-[#2B2F33] mb-8 poppins-bold">Business Profile Settings</h3>
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Business Name (EN)</label>
                      <input 
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full p-4 bg-[#F5F7F9] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#2CA6A4]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Business Name (AR)</label>
                      <input 
                        type="text"
                        value={editForm.nameAr || ''}
                        onChange={(e) => setEditForm({...editForm, nameAr: e.target.value})}
                        className="w-full p-4 bg-[#F5F7F9] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#2CA6A4]"
                        dir="rtl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                        <input 
                          type="tel"
                          value={editForm.phone || ''}
                          onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 bg-[#F5F7F9] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#2CA6A4]"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Website</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                        <input 
                          type="url"
                          value={editForm.website || ''}
                          onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 bg-[#F5F7F9] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#2CA6A4]"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                        <input 
                          type="text"
                          value={editForm.address || ''}
                          onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                          className="w-full pl-12 pr-4 py-4 bg-[#F5F7F9] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#2CA6A4]"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Description (EN)</label>
                      <textarea 
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        className="w-full p-4 bg-[#F5F7F9] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#2CA6A4] min-h-[100px]"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-[10px] font-black text-[#6B7280] uppercase tracking-widest">Description (AR)</label>
                      <textarea 
                        value={editForm.descriptionAr || ''}
                        onChange={(e) => setEditForm({...editForm, descriptionAr: e.target.value})}
                        className="w-full p-4 bg-[#F5F7F9] border border-[#E5E7EB] rounded-2xl focus:ring-2 focus:ring-[#2CA6A4] min-h-[100px]"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  {updateSuccess && (
                    <div className="p-4 bg-[#2CA6A4]/5 border border-[#2CA6A4]/20 rounded-2xl flex items-center gap-3 text-[#2CA6A4] font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      Profile updated successfully!
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="w-full py-4 bg-[#2CA6A4] text-white font-black rounded-2xl shadow-xl shadow-[#2CA6A4]/20 hover:bg-[#1e7a78] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs disabled:opacity-50"
                  >
                    {isUpdatingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
