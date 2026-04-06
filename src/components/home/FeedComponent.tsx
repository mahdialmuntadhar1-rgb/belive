import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, Clock, Loader2 } from "lucide-react";
import type { Business, Post } from "@/lib/supabase";
import { usePosts } from "@/hooks/usePosts";
import { useAuthStore } from "@/stores/authStore";

interface FeedComponentProps {
  businesses: Business[];
  loading: boolean;
}

export default function FeedComponent({ businesses, loading: businessesLoading }: FeedComponentProps) {
  const { posts, loading: postsLoading, likePost } = usePosts();
  const { user } = useAuthStore();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const handleLike = async (postId: string) => {
    if (!user) return;
    
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });

    try {
      await likePost(postId);
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  if (businessesLoading || postsLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 p-4 animate-pulse">
              <div className="h-12 bg-slate-100 rounded-full w-32 mb-4" />
              <div className="h-24 bg-slate-100 rounded mb-4" />
              <div className="h-8 bg-slate-100 rounded w-48" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 pb-20">
      {posts.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center shadow-inner">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">📢</div>
          <p className="text-text-main font-bold text-lg mb-2 poppins-bold">No updates yet</p>
          <p className="text-sm text-text-muted max-w-xs mx-auto">
            Follow your favorite businesses to see their latest updates and announcements here.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {posts.map((post) => {
            // Use post's own authorName/authorAvatar (from businessName/businessAvatar columns)
            // Business lookup is only used for the phone/contact bar at the bottom
            const business = businesses.find(b => b.id === post.businessId);

            return (
              <div
                key={post.id}
                className="bg-white rounded-[24px] border border-slate-200 shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden group"
              >
                {/* Post Header */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-white to-primary/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/5 shadow-inner overflow-hidden">
                      {post.authorAvatar ? (
                        <img
                          src={post.authorAvatar}
                          alt={post.authorName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-xl">{post.authorName?.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-text-main text-base poppins-semibold group-hover:text-primary transition-colors">
                        {post.authorName}
                      </h3>
                      <p className="text-[10px] text-text-muted flex items-center gap-1.5 mt-0.5 font-bold uppercase tracking-widest">
                        <Clock size={12} className="text-primary" /> {formatTimestamp(post.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-4 py-1.5 rounded-xl uppercase tracking-widest shadow-sm bg-primary text-white">
                    📢 Update
                  </span>
                </div>

                {/* Post Content */}
                <div className="px-6 pt-6">
                  <p className="text-text-main text-sm leading-relaxed mb-4 font-medium">
                    {post.content}
                  </p>
                </div>

                {/* Image Section */}
                {post.image && (
                  <div className="px-6 pt-4">
                    <div className="w-full h-80 bg-slate-100 rounded-2xl overflow-hidden relative shadow-inner group/img">
                      <img
                        src={post.image}
                        alt=""
                        className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-1000"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                )}

                {/* Engagement Section */}
                <div className="px-6 py-5 bg-slate-50/30 border-t border-slate-100">
                  {/* Stats */}
                  <div className="flex justify-between text-[10px] text-text-muted font-bold uppercase tracking-widest mb-5 pb-5 border-b border-slate-100">
                    <span className="flex items-center gap-2 hover:text-secondary cursor-pointer transition-colors">❤️ {post.likes} <span className="hidden sm:inline">Likes</span></span>
                    <span className="flex items-center gap-2 hover:text-primary cursor-pointer transition-colors">💬 0 <span className="hidden sm:inline">Comments</span></span>
                    <span className="flex items-center gap-2 hover:text-primary cursor-pointer transition-colors">📤 0 <span className="hidden sm:inline">Shares</span></span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all duration-300 ${
                        likedPosts.has(post.id)
                          ? "bg-primary text-white shadow-lg shadow-primary/20"
                          : "bg-white text-text-muted border border-slate-200 hover:bg-primary/5 hover:text-primary hover:border-primary/20"
                      }`}
                    >
                      <Heart
                        size={16}
                        className={likedPosts.has(post.id) ? "fill-current" : ""}
                      />
                      Like
                    </button>

                    <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 hover:bg-primary/5 hover:text-primary hover:border-primary/20 text-text-muted rounded-xl font-bold text-xs transition-all duration-300">
                      <MessageCircle size={16} />
                      Comment
                    </button>

                    <button className="w-12 flex items-center justify-center bg-white border border-slate-200 hover:bg-primary hover:text-white text-text-muted rounded-xl transition-all duration-300">
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Quick Contact Bar */}
                <div className="px-6 py-4 bg-bg-dark flex gap-3">
                  {business.phone && (
                    <a
                      href={`tel:${business.phone}`}
                      className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white text-[10px] font-bold rounded-xl transition-all duration-300 text-center shadow-lg uppercase tracking-widest"
                    >
                      Call Now
                    </a>
                  )}
                  <button className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded-xl transition-all duration-300 uppercase tracking-widest border border-white/10">
                    WhatsApp
                  </button>
                  <button className="flex-1 py-2.5 bg-secondary hover:bg-secondary-dark text-white text-[10px] font-bold rounded-xl transition-all duration-300 uppercase tracking-widest shadow-lg">
                    Profile
                  </button>
                </div>
              </div>
            );
          })}

          {/* Load More Button */}
          <div className="text-center pt-10">
            <button className="px-16 py-4 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 text-sm font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95">
              Load More Updates
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
