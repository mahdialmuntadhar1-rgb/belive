import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, Clock, Loader2, TrendingUp, Eye } from "lucide-react";
import { motion } from "motion/react";
import type { Business, Post, PostComment } from "@/lib/supabase";
import { usePosts } from "@/hooks/usePosts";
import { useAuthStore } from "@/stores/authStore";
import { useHomeStore } from "@/stores/homeStore";
import { CATEGORIES } from "@/constants";

interface FeedComponentProps {
  businesses: Business[];
  loading: boolean;
}

export default function FeedComponent({ businesses, loading: businessesLoading }: FeedComponentProps) {
  const { posts, loading: postsLoading, likePost, addComment } = usePosts();
  const { user, profile } = useAuthStore();
  const { language } = useHomeStore();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [showComments, setShowComments] = useState<Set<string>>(new Set());

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

  const handleComment = async (postId: string, commentText: string) => {
    if (!user || !commentText.trim()) return;
    
    try {
      await addComment(postId, profile?.full_name || user.email?.split('@')[0] || 'Anonymous', commentText.trim());
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const toggleComments = (postId: string) => {
    setShowComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
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

  const displayPosts = posts;

  if (displayPosts.length === 0 && !postsLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-sm text-text-muted font-bold uppercase tracking-widest">
          {language === 'ar' ? 'لا توجد منشورات حالياً' : language === 'ku' ? 'هیچ پۆستێک نییە' : 'No activity yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 pb-32">
      {/* Feed Header */}
      <div className="flex items-center justify-between mb-12 px-4">
        <div>
          <h2 className="text-3xl font-black text-bg-dark poppins-bold tracking-tighter uppercase">
            {language === 'ar' ? 'آخر التحديثات' : language === 'ku' ? 'دوایین نوێکارییەکان' : 'Live Business Feed'}
          </h2>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2">
            {language === 'ar' ? 'اكتشف ما هو جديد في العراق' : language === 'ku' ? 'بزانە چی نوێیە لە عێراق' : 'Real-time updates from Iraqi brands'}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2">Live</span>
        </div>
      </div>

      <div className="space-y-16">
        {displayPosts.map((post, idx) => {
          const business = businesses.find(b => b.id === post.businessId);
          
          // Defensive logging for malformed feed items - disabled in production
          // if (!business && post.businessId) {
          //   console.warn('[FeedComponent] Business not found for post:', post.id);
          // }
          
          // Support all possible phone fields with fallback logic for both old and new schemas
          const getPhone = (biz: Business | undefined) => {
            if (!biz) return null;
            
            // Try new schema fields first (phone_1, phone_2, whatsapp)
            if ('phone_1' in biz && (biz as any).phone_1) return (biz as any).phone_1;
            if ('phone_2' in biz && (biz as any).phone_2) return (biz as any).phone_2;
            if ('whatsapp' in biz && (biz as any).whatsapp) return (biz as any).whatsapp;
            
            // Try socialLinks.whatsapp (from social media integration)
            if (biz.socialLinks?.whatsapp) return biz.socialLinks.whatsapp;
            
            // Fallback to old single phone field
            if (biz.phone) return biz.phone;
            
            return null;
          };
          
          // Support multiple business name field patterns
          const getBusinessName = (biz: Business | undefined) => {
            if (!biz) return "Unknown Business";
            
            // Try new schema fields first
            if ('business_name' in biz && (biz as any).business_name) return (biz as any).business_name;
            if ('english_name' in biz && (biz as any).english_name) return (biz as any).english_name;
            
            // Fallback to old name field
            if (biz.name) return biz.name;
            
            return "Unknown Business";
          };
          
          // Support multiple category field patterns
          const getCategory = (biz: Business | undefined) => {
            if (!biz) return "General";
            
            // Try new schema fields first
            if ('category' in biz && (biz as any).category) return (biz as any).category;
            if ('subcategory' in biz && (biz as any).subcategory) return (biz as any).subcategory;
            
            // Fallback to old category field
            if (biz.category) return biz.category;
            
            return "General";
          };
          
          const phone = getPhone(business);
          const authorName = post.authorName || getBusinessName(business);
          const businessCity = business?.city || "Unknown Location";
          const businessCategory = getCategory(business);
          const category = CATEGORIES.find(c => c.id === businessCategory)?.name[language] || businessCategory || "Featured";
          
          // Additional logging for debugging data structure issues - disabled in production
          // if (business) {
          //   const businessFields = Object.keys(business);
          //   const hasPhoneFields = businessFields.some(field => 
          //     ['phone', 'phone_1', 'phone_2', 'whatsapp'].includes(field)
          //   );
          //   if (!hasPhoneFields) {
          //     console.warn('[FeedComponent] Business missing phone fields:', business.id);
          //   }
          // }
          
          // Skip rendering if business data is completely missing to prevent crashes
          if (!business && !post.authorName) {
            // Silently skip posts with missing data in production
            return null;
          }

          // Get comments for this post
          const postComments = post.postComments || [];
          const commentsToShow = postComments.slice(0, 3); // Show first 3 comments
          const hasMoreComments = postComments.length > 3;
          const isShowingComments = showComments.has(post.id);

          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className="bg-white rounded-[48px] border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] transition-all duration-1000 overflow-hidden group flex flex-col md:flex-row relative"
            >
              {/* Piece 1: Image */}
              {post.image && (
                <div className="w-full md:w-2/5 h-[300px] md:h-auto relative overflow-hidden group/img">
                  <img
                    src={post.image}
                    alt=""
                    className="w-full h-full object-cover group-hover/img:scale-125 transition-transform duration-[2000ms] ease-out"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 via-bg-dark/20 to-transparent opacity-60 group-hover/img:opacity-80 transition-opacity duration-700" />
                  
                  {/* Floating Badge on Image */}
                  <div className="absolute top-8 left-8">
                    <div className="glass-dark px-5 py-2.5 rounded-[20px] border border-white/20 shadow-2xl backdrop-blur-md">
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                        {category}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Piece 2: Information */}
              <div className={`flex-1 flex flex-col p-10 sm:p-12 ${!post.image ? 'w-full' : ''}`}>
                {/* Post Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[24px] p-[2px] bg-gradient-to-tr from-primary via-accent to-secondary shadow-2xl group-hover:rotate-6 transition-transform duration-700">
                      <div className="w-full h-full rounded-[22px] bg-white flex items-center justify-center text-bg-dark font-bold border border-white shadow-inner overflow-hidden">
                        {post.authorAvatar ? (
                          <img
                            src={post.authorAvatar}
                            alt={authorName}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="text-2xl font-black">{authorName.charAt(0)}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-black text-bg-dark text-xl poppins-bold group-hover:text-primary transition-colors duration-500 tracking-tighter uppercase leading-none">
                        {authorName}
                      </h3>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                          <Clock size={12} className="text-primary" />
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                            {formatTimestamp(post.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="flex-1 mb-10">
                  <p className="text-slate-600 text-lg leading-relaxed font-medium line-clamp-4 group-hover:text-bg-dark transition-colors duration-500">
                    {post.content}
                  </p>
                </div>

                {/* Comments Preview */}
                {commentsToShow.length > 0 && !isShowingComments && (
                  <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="space-y-2">
                      {commentsToShow.map((comment, commentIdx) => (
                        <div key={comment.id || commentIdx} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                            {(comment.authorName || 'A').charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-slate-700">{comment.authorName}</p>
                            <p className="text-sm text-slate-600">{comment.commentText}</p>
                          </div>
                        </div>
                      ))}
                      {hasMoreComments && (
                        <button
                          onClick={() => toggleComments(post.id)}
                          className="text-xs text-primary font-black uppercase tracking-widest hover:underline"
                        >
                          View all {postComments.length} comments
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Engagement & Contact */}
                <div className="space-y-5">
                  {/* Engagement Stats */}
                  <div className="flex items-center justify-between text-xs text-slate-400 font-black uppercase tracking-widest">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Heart size={12} className="text-primary" />
                        {post.likes || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={12} className="text-primary" />
                        {post.comments || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 size={12} className="text-primary" />
                        {post.shares || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex-1 flex items-center justify-center gap-4 py-5 rounded-[22px] font-black text-[11px] transition-all duration-500 uppercase tracking-[0.2em] shadow-xl ${
                        likedPosts.has(post.id)
                          ? "bg-primary text-bg-dark shadow-primary/30 scale-105"
                          : "bg-slate-50 text-slate-400 border border-slate-100 hover:border-primary/30 hover:bg-white hover:text-primary"
                      }`}
                    >
                      <Heart
                        size={18}
                        className={likedPosts.has(post.id) ? "fill-current" : ""}
                      />
                      {(post.likes || 0) + (likedPosts.has(post.id) ? 1 : 0)}
                    </button>

                    <button 
                      onClick={() => toggleComments(post.id)}
                      className="flex-1 flex items-center justify-center gap-4 py-5 bg-white border-2 border-slate-100 text-slate-400 rounded-[22px] font-black text-[11px] transition-all duration-500 uppercase tracking-[0.2em] hover:bg-bg-dark hover:text-white hover:border-bg-dark shadow-xl shadow-slate-100"
                    >
                      <MessageCircle size={18} />
                      {language === 'ar' ? 'Comments' : language === 'ku' ? 'Comments' : 'Comments'}
                    </button>
                  </div>

                  {phone && (
                    <a
                      href={`tel:${phone}`}
                      className="flex items-center justify-center gap-4 w-full py-5 bg-bg-dark text-white text-[11px] font-black rounded-[22px] transition-all duration-700 text-center uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:bg-primary hover:text-bg-dark hover:shadow-primary/30 group/btn"
                    >
                      <Share2 size={16} className="group-hover/btn:rotate-12 transition-transform" />
                      {language === 'ar' ? 'Connect Now' : language === 'ku' ? 'Connect Now' : 'Connect with Brand'}
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

          {/* Load More Button */}
          <div className="text-center pt-16">
            <button className="px-20 py-6 bg-white border-2 border-slate-100 text-bg-dark rounded-[32px] shadow-2xl hover:shadow-primary/20 text-[12px] font-black uppercase tracking-[0.3em] transition-all duration-700 hover:scale-105 active:scale-95 hover:border-primary hover:bg-primary/5 group/more">
              <span className="flex items-center gap-4">
                {language === 'ar' ? 'Load More' : language === 'ku' ? 'Load More' : 'Explore More Updates'}
                <TrendingUp className="w-5 h-5 group-hover/more:translate-y-[-2px] transition-transform" />
              </span>
            </button>
          </div>
        </div>
    </div>
  );
}
