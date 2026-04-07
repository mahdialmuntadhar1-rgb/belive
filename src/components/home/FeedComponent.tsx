import { useMemo, useState } from 'react';
import { Heart, MessageCircle, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import type { Business } from '@/lib/supabase';
import { usePosts } from '@/hooks/usePosts';
import { useAuthStore } from '@/stores/authStore';
import { useHomeStore } from '@/stores/homeStore';
import { CATEGORIES } from '@/constants';

interface FeedComponentProps {
  businesses: Business[];
  loading: boolean;
}

export default function FeedComponent({ businesses, loading: businessesLoading }: FeedComponentProps) {
  const { posts, loading: postsLoading, likePost } = usePosts();
  const { user } = useAuthStore();
  const { language } = useHomeStore();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const businessById = useMemo(
    () => new Map(businesses.map((business) => [business.id, business])),
    [businesses]
  );

  const displayPosts = useMemo(
    () => posts.filter((post) => Boolean(post.businessId && businessById.get(post.businessId))),
    [posts, businessById]
  );

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
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl border border-slate-200 p-6 animate-pulse">
              <div className="h-12 bg-slate-100 rounded-full w-32 mb-4" />
              <div className="h-24 bg-slate-100 rounded-xl mb-4" />
              <div className="h-8 bg-slate-100 rounded-xl w-48" />
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
    if (hours < 1) return language === 'ar' ? 'الآن' : language === 'ku' ? 'ئێستا' : 'Just now';
    if (hours < 24) return language === 'ar' ? `قبل ${hours} ساعة` : language === 'ku' ? `${hours} کاتژمێر پێش` : `${hours} hours ago`;
    return date.toLocaleDateString();
  };

  if (displayPosts.length === 0 && !postsLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-sm text-text-muted font-bold uppercase tracking-widest">
          {language === 'ar' ? 'لا توجد منشورات تجارية حالياً' : language === 'ku' ? 'ئێستا هیچ پۆستی بازرگانی نییە' : 'No business posts yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-20">
      <div className="space-y-6">
        {displayPosts.map((post, idx) => {
          const business = businessById.get(post.businessId);
          if (!business) return null;

          const category = CATEGORIES.find((c) => c.id === business.category)?.name[language] || business.category;
          const phone = business.phone;
          const businessName =
            language === 'ar'
              ? business.nameAr || business.name
              : language === 'ku'
              ? business.nameKu || business.name
              : business.name;

          return (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.45, delay: idx * 0.04 }}
              className="bg-white rounded-[28px] border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.2)] overflow-hidden"
            >
              {post.image && (
                <div className="w-full h-52 sm:h-64">
                  <img src={post.image} alt={businessName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}

              <div className="p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-black text-bg-dark tracking-tight">{businessName}</h3>
                    <div className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600">{category}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-primary" />
                        {formatTimestamp(post.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-slate-700 leading-relaxed text-[15px] sm:text-base">{post.content}</p>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => handleLike(post.id)}
                    className={`sm:w-40 flex items-center justify-center gap-3 py-3 rounded-xl font-black text-[11px] uppercase tracking-[0.18em] transition-all ${
                      likedPosts.has(post.id)
                        ? 'bg-primary text-bg-dark'
                        : 'bg-slate-50 text-slate-500 border border-slate-200 hover:border-primary/30 hover:text-primary'
                    }`}
                  >
                    <Heart size={16} className={likedPosts.has(post.id) ? 'fill-current' : ''} />
                    {post.likes || 0}
                  </button>

                  {phone && (
                    <a
                      href={`tel:${phone}`}
                      className="flex-1 flex items-center justify-center py-3 bg-bg-dark text-white rounded-xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-primary hover:text-bg-dark transition-colors"
                    >
                      {language === 'ar' ? 'اتصال' : language === 'ku' ? 'پەیوەندی' : 'Contact'}
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
