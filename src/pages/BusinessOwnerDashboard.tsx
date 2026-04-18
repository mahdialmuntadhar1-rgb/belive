import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Edit3, Save, Upload, Loader2, Image as ImageIcon, Plus, X, FileText, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabaseClient';

export default function BusinessOwnerDashboard() {
  const { user } = useAuthStore();

  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    phone: '',
    whatsapp: '',
    category: '',
    governorate: '',
    city: '',
    image: '',
    description: '',
  });

  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', image_url: '' });
  const [uploadingPostImage, setUploadingPostImage] = useState(false);
  const [creatingPost, setCreatingPost] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'posts'>('profile');

  useEffect(() => { loadBusiness(); }, [user]);
  useEffect(() => { if (business) loadPosts(); }, [business]);

  const loadBusiness = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setBusiness(data);
        setFormData({
          name: data.name || '',
          nameAr: data.name_ar || data.nameAr || '',
          phone: data.phone || '',
          whatsapp: data.whatsapp || '',
          category: data.category || '',
          governorate: data.governorate || '',
          city: data.city || '',
          image: data.image_url || data.image || '',
          description: data.description || '',
        });
      }
    } catch (error) {
      // Error loading business - handled silently
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    if (!business) return;
    setPostsLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      // Error loading posts - handled silently
    } finally {
      setPostsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `businesses/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('business-images').upload(fileName, file, { upsert: false });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('business-images').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, image: publicUrl }));
    } catch (error: any) {
      alert('Failed to upload image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handlePostImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPostImage(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `posts/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('feed-images').upload(fileName, file, { upsert: false });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('feed-images').getPublicUrl(fileName);
      setNewPost(prev => ({ ...prev, image_url: publicUrl }));
    } catch (error: any) {
      alert('Failed to upload image: ' + error.message);
    } finally {
      setUploadingPostImage(false);
    }
  };

  const handleSave = async () => {
    if (!business) return;
    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          name: formData.name,
          name_ar: formData.nameAr,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          category: formData.category,
          governorate: formData.governorate,
          city: formData.city,
          image_url: formData.image,
          description: formData.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', business.id)
        .eq('owner_id', user!.id);
      if (error) throw error;
      alert('Business updated successfully!');
      setEditing(false);
      loadBusiness();
    } catch (error: any) {
      alert('Failed to update business: ' + error.message);
    }
  };

  const createPostPayload = (businessId: string, businessData: any, content: string, imageUrl: string | null) => ({
    business_id: businessId,
    businessId: businessId,
    businessName: businessData.name,
    businessAvatar: businessData.image_url || businessData.imageUrl || '',
    content: content,
    caption: content,
    image_url: imageUrl,
    imageUrl: imageUrl,
    likes: 0,
    views: 0,
    status: 'visible',
    created_at: new Date().toISOString(),
  });

  const handleCreatePost = async () => {
    if (!newPost.content.trim()) { alert('Please write some content for your post'); return; }
    setCreatingPost(true);
    try {
      const payload = createPostPayload(business.id, business, newPost.content, newPost.image_url || null);
      const { error } = await supabase.from('posts').insert([payload]);
      if (error) throw error;
      alert('Post published successfully!');
      setShowCreatePost(false);
      setNewPost({ content: '', image_url: '' });
      loadPosts();
    } catch (error: any) {
      alert('Failed to create post: ' + error.message);
    } finally {
      setCreatingPost(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-bg-warm flex items-center justify-center p-4">
        <div className="bg-white rounded-[48px] p-12 shadow-2xl text-center">
          <p className="text-xl font-black mb-6">Please log in first</p>
          <Link to="/" className="px-8 py-4 bg-primary text-white rounded-2xl font-black">Go to Login</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-warm flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-bg-warm flex items-center justify-center p-4">
        <div className="bg-white rounded-[48px] p-12 shadow-2xl text-center max-w-md">
          <h2 className="text-2xl font-black mb-4">No Business Found</h2>
          <p className="text-slate-500 mb-6">You don't have a registered business yet.</p>
          <Link to="/claim" className="px-8 py-4 bg-primary text-white rounded-2xl font-black">Claim Your Business</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-warm">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 md:px-10 py-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm flex items-center gap-2 group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Back</span>
          </Link>
          <h1 className="text-xl font-black uppercase tracking-widest poppins-bold">My Business</h1>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'profile' && (
            <>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="px-5 py-3 bg-primary text-white font-black rounded-xl hover:bg-primary-dark transition-all uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
              ) : (
                <>
                  <button onClick={() => setEditing(false)} className="px-5 py-3 bg-slate-100 text-slate-500 font-black rounded-xl transition-all uppercase tracking-widest text-[10px]">Cancel</button>
                  <button onClick={handleSave} className="px-5 py-3 bg-primary text-white font-black rounded-xl hover:bg-primary-dark transition-all uppercase tracking-widest text-[10px] flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save
                  </button>
                </>
              )}
            </>
          )}
          {activeTab === 'posts' && (
            <button onClick={() => setShowCreatePost(true)} className="px-5 py-3 bg-primary text-white font-black rounded-xl hover:bg-primary-dark transition-all uppercase tracking-widest text-[10px] flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Post
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100 px-6 md:px-10">
        <div className="flex gap-1 max-w-4xl mx-auto">
          <button onClick={() => setActiveTab('profile')} className={`px-6 py-4 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
            <Edit3 className="w-4 h-4" /> Profile
          </button>
          <button onClick={() => setActiveTab('posts')} className={`px-6 py-4 text-[11px] font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === 'posts' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
            <FileText className="w-4 h-4" /> Posts ({posts.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="p-6 md:p-10 max-w-4xl mx-auto">
        {activeTab === 'profile' && (
          <div className="bg-white rounded-[48px] border border-slate-100 shadow-premium overflow-hidden">
            <div className="aspect-video relative bg-slate-100">
              {formData.image ? (
                <img src={formData.image} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-16 h-16" /></div>
              )}
              {editing && (
                <div className="absolute bottom-4 right-4">
                  <label className="px-6 py-3 bg-white/90 backdrop-blur-md rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 cursor-pointer hover:bg-white transition-all shadow-lg">
                    <Upload className="w-4 h-4" />
                    {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : 'Change Image'}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                </div>
              )}
            </div>
            <div className="p-10 space-y-8">
              {editing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Name (EN)</label>
                      <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary text-sm font-medium" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Name (AR)</label>
                      <input type="text" value={formData.nameAr} onChange={e => setFormData({...formData, nameAr: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary text-sm font-medium" dir="rtl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</label>
                      <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary text-sm font-medium" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp</label>
                      <input type="text" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary text-sm font-medium" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary text-sm font-medium min-h-[120px]" />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-black poppins-bold mb-2">{formData.name}</h2>
                    {formData.nameAr && <p className="text-xl text-slate-500" dir="rtl">{formData.nameAr}</p>}
                  </div>
                  <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-600">
                    {formData.phone && <p>📞 {formData.phone}</p>}
                    {formData.whatsapp && <p>💬 {formData.whatsapp}</p>}
                    {formData.city && <p>📍 {formData.city}, {formData.governorate}</p>}
                  </div>
                  {formData.description && <p className="text-slate-600 leading-relaxed">{formData.description}</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="space-y-6">
            {postsLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-[48px] border border-slate-100 shadow-premium p-16 text-center">
                <FileText className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                <h3 className="text-2xl font-black mb-3">No Posts Yet</h3>
                <p className="text-slate-500 mb-8">Create your first post to appear in the community feed.</p>
                <button onClick={() => setShowCreatePost(true)} className="px-8 py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark transition-all uppercase tracking-widest text-[10px] inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Create First Post
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map(post => (
                  <div key={post.id} className="bg-white rounded-[32px] border border-slate-100 shadow-premium overflow-hidden">
                    {post.image_url && (
                      <div className="aspect-video overflow-hidden bg-slate-100">
                        <img src={post.image_url} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <div className="p-6">
                      <p className="text-sm text-slate-700 font-medium leading-relaxed mb-4 line-clamp-3">{post.content || post.caption}</p>
                      <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {post.views || 0} views</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreatePost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreatePost(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg bg-white rounded-[48px] shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-black poppins-bold uppercase tracking-tight">Create New Post</h3>
                <button onClick={() => setShowCreatePost(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Post Image (Optional)</label>
                  <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center">
                    {newPost.image_url ? (
                      <>
                        <img src={newPost.image_url} className="w-full h-full object-cover" alt="" />
                        <button onClick={() => setNewPost(prev => ({ ...prev, image_url: '' }))} className="absolute top-3 right-3 p-2 bg-white/90 rounded-xl shadow-lg hover:bg-white transition-colors"><X className="w-4 h-4 text-red-400" /></button>
                      </>
                    ) : uploadingPostImage ? (
                      <div className="flex flex-col items-center gap-3"><Loader2 className="w-10 h-10 animate-spin text-primary" /><p className="text-sm font-bold text-slate-400">Uploading...</p></div>
                    ) : (
                      <label className="flex flex-col items-center gap-3 cursor-pointer p-6 text-center">
                        <Upload className="w-10 h-10 text-slate-300" />
                        <span className="text-sm font-bold text-slate-400">Click to upload image</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handlePostImageUpload} />
                      </label>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Caption / Content *</label>
                  <textarea value={newPost.content} onChange={e => setNewPost(prev => ({ ...prev, content: e.target.value }))} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary text-sm font-medium min-h-[100px] resize-none" placeholder="Write something about your business..." />
                </div>
              </div>
              <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <button onClick={() => setShowCreatePost(false)} className="px-6 py-3 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors">Cancel</button>
                <button onClick={handleCreatePost} disabled={creatingPost || !newPost.content.trim()} className="px-10 py-3 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all uppercase tracking-widest text-[10px] disabled:opacity-50">
                  {creatingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Post'}
                </button>
              </div>