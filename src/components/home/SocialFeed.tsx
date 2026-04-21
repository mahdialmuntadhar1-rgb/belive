import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal, 
  ImagePlus, 
  Trash2, 
  Edit3, 
  Send,
  Camera,
  Loader2
} from 'lucide-react';
import { useLocalBuildStore } from '@/stores/localBuildStore';
import { useHomeStore } from '@/stores/homeStore';
import { usePosts } from '@/hooks/usePosts';

export default function SocialFeed() {
  const { language } = useHomeStore();
  const { isBuildMode } = useLocalBuildStore();
  const { posts, createPost, updatePost, deletePost, uploadPostImage, loading, refresh } = usePosts();
  
  const [newCaption, setNewCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCreatePost = async () => {
    if (!newCaption) return;
    try {
      setSubmitting(true);
      let imageUrl = 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=1200&auto=format&fit=crop';
      
      if (selectedFile) {
        imageUrl = await uploadPostImage(selectedFile);
      }
      
      await createPost(newCaption, imageUrl, {
        businessName: 'Shaku Maku User',
        isVerified: false
      });
      
      setNewCaption('');
      setSelectedFile(null);
      setPreviewUrl(null);
      await refresh();
    } catch (error) {
      alert('Failed to create post. Check storage policies.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = (id: string | null = null) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (id) {
          try {
            setEditingId(id);
            const url = await uploadPostImage(file);
            await updatePost(id, { image: url });
            await refresh();
          } catch (error) {
            alert('Failed to update image.');
          } finally {
            setEditingId(null);
          }
        } else {
          setSelectedFile(file);
          setPreviewUrl(URL.createObjectURL(file));
        }
      }
    };
    input.click();
  };

  const handleEditCaption = async (id: string, currentCaption: string) => {
    const newCap = prompt('Edit Caption:', currentCaption);
    if (newCap && newCap !== currentCaption) {
      try {
        setEditingId(id);
        await updatePost(id, { content: newCap });
        await refresh();
      } catch (error) {
        alert('Failed to update caption.');
      } finally {
        setEditingId(null);
      }
    }
  };

  const handleDeletePost = async (id: string) => {
    if (confirm('Delete this post?')) {
      try {
        setEditingId(id);
        await deletePost(id);
        await refresh();
      } catch (error) {
        alert('Failed to delete post.');
      } finally {
        setEditingId(null);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-12">
      {/* Post Creator Box */}
      <div className="bg-white rounded-[40px] p-6 shadow-2xl border border-slate-100 mb-12">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Camera className="w-6 h-6" />
          </div>
          <div className="flex-1 space-y-4">
            <textarea
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              placeholder={language === 'ar' ? 'ماذا يدور في ذهنك؟' : 'What is on your mind?'}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 resize-none h-24 transition-all"
            />
            
            {previewUrl && (
              <div className="relative rounded-2xl overflow-hidden aspect-video">
                <img src={previewUrl} className="w-full h-full object-cover" alt="Draft" />
                <button 
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button 
                onClick={() => handleImageUpload()}
                className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-bold"
              >
                <ImagePlus className="w-5 h-5" />
                {language === 'ar' ? 'إضافة صورة' : 'Add Image'}
              </button>
              
              <button
                onClick={handleCreatePost}
                disabled={!newCaption || submitting}
                className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {language === 'ar' ? 'نشر' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-12">
        {loading && posts.length === 0 && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        )}
        
        <AnimatePresence>
          {posts.map((post) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden group/post relative"
            >
              {/* Build Mode Overlays */}
              {isBuildMode && (
                <div className="absolute top-4 right-4 z-30 flex gap-2 opacity-0 group-hover/post:opacity-100 transition-opacity">
                  <button 
                    disabled={editingId === post.id}
                    onClick={() => handleImageUpload(post.id)}
                    className="p-2.5 bg-white/90 backdrop-blur shadow-lg rounded-xl text-slate-600 hover:text-primary hover:scale-110 transition-all disabled:opacity-50"
                    title="Replace Image"
                  >
                    <ImagePlus className="w-5 h-5" />
                  </button>
                  <button 
                    disabled={editingId === post.id}
                    onClick={() => handleEditCaption(post.id, post.content)}
                    className="p-2.5 bg-white/90 backdrop-blur shadow-lg rounded-xl text-slate-600 hover:text-primary hover:scale-110 transition-all disabled:opacity-50"
                    title="Edit Caption"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button 
                    disabled={editingId === post.id}
                    onClick={() => handleDeletePost(post.id)}
                    className="p-2.5 bg-white/90 backdrop-blur shadow-lg rounded-xl text-slate-600 hover:text-red-500 hover:scale-110 transition-all disabled:opacity-50"
                    title="Delete Post"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Post Header */}
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-bg-dark font-black text-lg">
                    {post.authorName?.[0] || 'S'}
                  </div>
                  <div>
                    <h3 className="font-black text-[#111827] poppins-bold uppercase tracking-tight leading-none mb-1">
                      {post.authorName}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button className="p-2 text-slate-300 hover:text-[#111827] transition-colors">
                  <MoreHorizontal className="w-6 h-6" />
                </button>
              </div>

              {/* Post Image */}
              <div className="aspect-square bg-slate-50 relative overflow-hidden">
                {editingId === post.id && (
                  <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                  </div>
                )}
                <img
                  src={post.image}
                  alt="Post"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover/post:scale-105"
                />
              </div>

              {/* Post Content */}
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-6">
                    <Heart className="w-7 h-7 text-[#111827] hover:text-red-500 hover:fill-red-500 transition-all cursor-pointer" />
                    <MessageCircle className="w-7 h-7 text-[#111827] hover:text-primary transition-all cursor-pointer" />
                    <Share2 className="w-7 h-7 text-[#111827] hover:text-primary transition-all cursor-pointer" />
                  </div>
                  <Bookmark className="w-7 h-7 text-slate-300 hover:text-accent transition-all cursor-pointer" />
                </div>

                <p className="text-lg text-[#111827] leading-relaxed font-medium">
                  {post.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
