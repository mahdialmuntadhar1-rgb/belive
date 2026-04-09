import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Heart, MapPin, Sparkles, Eye } from 'lucide-react';
import { useHomeStore } from '@/stores/homeStore';

interface ShakuMakuPost {
  id: string;
  business_id: string;
  caption: string;
  caption_ar: string | null;
  caption_en: string | null;
  image_url: string;
  likes_count: number;
  views_count: number;
  is_featured: boolean;
  created_at: string;
}

interface ShakumakuProps {
  posts: ShakuMakuPost[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
}

export default function Shakumaku({ posts, loading, error, hasMore, onLoadMore }: ShakumakuProps) {
  const { language } = useHomeStore();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && onLoadMore(),
      { threshold: 0.5 }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  const handleLike = (postId: string) => {
    setLikedPosts(prev => new Set(prev).add(postId));
  };

  const getCaption = (post: ShakuMakuPost) => post.caption_ar || post.caption || '? ????? ??? ??????!';
  const getImage = (post: ShakuMakuPost) => post.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80';

  if (error && posts.length === 0) {
    return (
      <div className="text-center py-20">
        <Sparkles className="w-8 h-8 text-red-400 mx-auto mb-4" />
        <p className="text-red-500 font-bold">{error}</p>
      </div>
    );
  }

  if (loading && posts.length === 0) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="aspect-[3/4] bg-slate-100 rounded-2xl animate-pulse" />)}</div>;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-400">No posts yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-bg-dark uppercase flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-primary" />
        {language === 'ar' ? '???? ????' : 'Shaku Maku'}
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {posts.map((post, index) => {
          const isLiked = likedPosts.has(post.id);
          const caption = getCaption(post);
          const image = getImage(post);

          return (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index % 8) * 0.05 }}
              className={group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all  }
            >
              <div className={elative overflow-hidden }>
                <img
                  src={image}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {post.is_featured && (
                  <div className="absolute top-3 left-3 bg-primary text-bg-dark px-2 py-1 rounded-lg text-[9px] font-black uppercase">
                    ? Featured
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-white/90 text-[11px] leading-relaxed line-clamp-2 mb-3 font-medium" dir="rtl">
                    {caption}
                  </p>
                  <div className="flex items-center justify-between text-white/70 text-[10px] font-bold">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views_count || 0}</span>
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likes_count + (isLiked ? 1 : 0)}</span>
                  </div>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      {hasMore && <div ref={loadMoreRef} className="flex justify-center py-8">{loading && <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />}</div>}
    </div>
  );
}
