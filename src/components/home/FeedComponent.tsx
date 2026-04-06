import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, Clock, Loader2 } from "lucide-react";
import { motion } from "motion/react";
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

  const mockPosts: Post[] = [
    {
      id: "mock-1",
      businessId: businesses[0]?.id || "b1",
      authorName: "Al-Mansour Mall",
      authorAvatar: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&q=80&w=200",
      content: "Exciting news! Our new spring collection has just arrived. Visit us today for exclusive discounts and a first look at the latest trends in fashion. 🛍️✨",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800",
      likes: 124,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: "mock-2",
      businessId: businesses[1]?.id || "b2",
      authorName: "Saj Al-Reef",
      authorAvatar: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=200",
      content: "Craving something delicious? Our signature Shawarma is ready! Made with fresh ingredients and our secret spice blend. Come and taste the difference. 🌯🔥",
      image: "https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&q=80&w=800",
      likes: 89,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    },
    {
      id: "mock-3",
      businessId: businesses[2]?.id || "b3",
      authorName: "Grand Millenium Hotel",
      authorAvatar: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=200",
      content: "Experience luxury like never before. Book your stay this weekend and enjoy a complimentary spa session. Your perfect getaway awaits. 🏨💎",
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800",
      likes: 256,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    }
  ];

  const displayPosts = posts.length > 0 ? posts : mockPosts;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 pb-20">
      <div className="space-y-12">
        {displayPosts.map((post) => {
          const business = businesses.find(b => b.id === post.businessId);
          const category = business?.category || "Featured";
          const phone = business?.phone;

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-[32px] border border-slate-200 shadow-social hover:shadow-2xl transition-all duration-700 overflow-hidden group flex flex-col md:flex-row"
              >
                {/* Piece 1: Image */}
                {post.image && (
                  <div className="w-full md:w-1/2 h-[250px] md:h-auto relative overflow-hidden group/img">
                    <img
                      src={post.image}
                      alt=""
                      className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-1000"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-500" />
                    
                    {/* Floating Badge on Image */}
                    <div className="absolute bottom-4 left-4 glass-dark px-3 py-1.5 rounded-lg border border-white/20">
                      <span className="text-[8px] font-black text-white uppercase tracking-widest">
                        {category}
                      </span>
                    </div>
                  </div>
                )}

                {/* Piece 2: Information */}
                <div className={`flex-1 flex flex-col ${!post.image ? 'w-full' : ''}`}>
                  {/* Post Header */}
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl p-[1px] bg-gradient-to-tr from-primary via-secondary to-accent">
                        <div className="w-full h-full rounded-xl bg-white flex items-center justify-center text-primary font-bold border border-white shadow-inner overflow-hidden">
                          {post.authorAvatar ? (
                            <img
                              src={post.authorAvatar}
                              alt={post.authorName}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="text-lg font-black">{post.authorName?.charAt(0)}</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-black text-text-main text-sm poppins-bold group-hover:text-primary transition-colors tracking-tight">
                          {post.authorName}
                        </h3>
                        <p className="text-[8px] text-text-muted flex items-center gap-1 mt-0.5 font-black uppercase tracking-widest">
                          <Clock size={10} className="text-primary" /> {formatTimestamp(post.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-6 flex-1">
                    <p className="text-text-main text-sm leading-relaxed font-medium line-clamp-4">
                      {post.content}
                    </p>
                  </div>

                  {/* Engagement & Contact */}
                  <div className="p-4 bg-slate-50/50 mt-auto border-t border-slate-100 space-y-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-[9px] transition-all duration-300 uppercase tracking-widest ${
                          likedPosts.has(post.id)
                            ? "bg-primary text-white shadow-neon"
                            : "bg-white text-text-muted border border-slate-200 hover:border-primary/20"
                        }`}
                      >
                        <Heart
                          size={14}
                          className={likedPosts.has(post.id) ? "fill-current" : ""}
                        />
                        {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                      </button>

                      <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 text-text-muted rounded-xl font-black text-[9px] transition-all duration-300 uppercase tracking-widest">
                        <MessageCircle size={14} />
                        Chat
                      </button>
                    </div>

                    {phone && (
                      <a
                        href={`tel:${phone}`}
                        className="block w-full py-2.5 bg-bg-dark hover:bg-primary text-white hover:text-bg-dark text-[9px] font-black rounded-xl transition-all duration-300 text-center uppercase tracking-widest"
                      >
                        Call Now
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Load More Button */}
          <div className="text-center pt-10">
            <button className="px-16 py-5 bg-bg-dark text-white rounded-[24px] shadow-social hover:shadow-2xl text-xs font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 border border-white/10">
              Load More Updates
            </button>
          </div>
        </div>
    </div>
  );
}
