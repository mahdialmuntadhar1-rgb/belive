import React from 'react';
import { motion } from 'motion/react';
import { Heart, MessageCircle, Share2, MapPin, MoreHorizontal, Bookmark, ArrowRight, Loader2, TrendingUp } from 'lucide-react';
import { useHomeStore } from '@/stores/homeStore';
import { usePosts } from '@/hooks/usePosts';
import { useBusinesses } from '@/hooks/useBusinesses';
import { Business, Post } from '@/lib/supabase';

interface SocialFeedProps {
  onBusinessClick?: (business: Business) => void;
}

const FALLBACK_POST_TEMPLATES = [
  "Hey, this is {name}, located in {city}. We are excited to serve you! ☕️ #IraqBusiness #ShakuMaku",
  "Visit {name} in {governorate} for the best {category} experience! 🏨✨ #LocalBusiness #Iraq",
  "Discover the magic of {name} at {address}. See you soon! 🍢🔥 #BaghdadEats #ShakuMaku",
  "Experience luxury at {name}. Located in {city}, we offer world-class amenities and service. 🏨🌟 #PremiumIraq",
  "Welcome to {name}! We're proud to be part of the {city} community. Come visit us! 🛍️✨ #Community #Iraq"
];

const CATEGORY_IMAGES: Record<string, string[]> = {
  cafe: [
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80"
  ],
  hotels: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80"
  ],
  gym: [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80"
  ],
  dining: [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"
  ],
  medical: [
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80"
  ],
  general: [
    "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
  ]
};

export default function SocialFeed({ onBusinessClick }: SocialFeedProps) {
  const { language } = useHomeStore();
  const { posts: realPosts, loading: postsLoading, error, hasMore, loadMore, likePost } = usePosts();
  const { businesses, loading: bizLoading } = useBusinesses("");
  
  const isRTL = language === 'ar' || language === 'ku';

  const virtualPosts = React.useMemo(() => {
    // Use real posts from business_postcards table
    if (realPosts.length > 0) {
      return realPosts.map(post => ({
        ...post,
        content: post.caption || post.content,
        likes: post.likes_count || post.likes || 0,
        image: post.image_url || post.image,
        createdAt: post.created_at ? new Date(post.created_at) : post.createdAt
      }));
    }

    // Fallback to generating posts from businesses only if:
    // - Not loading AND
    // - No error fetching real posts (error means table missing/broken) AND
    // - Have businesses to generate from
    if (postsLoading || error || bizLoading || businesses.length === 0) return [];

    return businesses.slice(0, 20).map((biz, index) => {
      const template = FALLBACK_POST_TEMPLATES[index % FALLBACK_POST_TEMPLATES.length];
      const content = template
        .replace('{name}', biz.name)
        .replace('{city}', biz.city)
        .replace('{governorate}', biz.governorate || 'Iraq')
        .replace('{category}', biz.category)
        .replace('{address}', biz.address);

      const images = CATEGORY_IMAGES[biz.category] || CATEGORY_IMAGES.general;
      const image = images[index % images.length];

      return {
        id: `virtual-${biz.id}`,
        businessId: biz.id,
        content,
        image,
        likes: Math.floor(Math.random() * 500) + 50,
        createdAt: new Date(Date.now() - index * 3600000),
        authorName: biz.name,
        authorAvatar: biz.image
      } as Post;
    });
  }, [realPosts, businesses, bizLoading, postsLoading, error]);

  const displayPosts = virtualPosts;
  const isLoading = postsLoading || (realPosts.length === 0 && bizLoading);

  if (isLoading && displayPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          {language === 'ar' ? 'جاري تحميل المنشورات...' : 'Loading posts...'}
        </p>
      </div>
    );
  }

  if (error && displayPosts.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
          <p className="text-red-700 font-bold mb-2">Feed Error</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          {error.includes('business_postcards') && (
            <p className="text-red-500 text-xs">⚠️ business_postcards table may be missing from database</p>
          )}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest"
        >
          {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
        </button>
      </div>
    );
  }

  if (displayPosts.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-slate-100">
          <MessageCircle className="w-10 h-10 text-slate-200" />
        </div>
        <h3 className="text-xl font-black text-bg-dark mb-2">
          {language === 'ar' ? 'لا توجد منشورات بعد' : 'No posts yet'}
        </h3>
        <p className="text-sm text-slate-400 max-w-xs mx-auto">
          {language === 'ar' ? 'كن أول من يشارك تحديثات أعماله هنا.' : 'Be the first to share business updates here.'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-12">
      {/* Feed Header */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="w-16 h-16 bg-accent/10 rounded-3xl flex items-center justify-center text-accent mb-4 shadow-inner">
          <TrendingUp className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black text-primary poppins-bold uppercase tracking-tighter">
          {language === 'ar' ? 'شكو ماكو' : 'Shaku Maku'}
        </h2>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-2">
          {language === 'ar' ? 'آخر تحديثات الأعمال في العراق' : 'Latest business updates in Iraq'}
        </p>
      </div>

      {displayPosts.map((post) => (
        <motion.div 
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-[40px] border border-slate-100 shadow-card overflow-hidden"
        >
          {/* Post Header */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onBusinessClick?.({ id: post.businessId, name: post.authorName } as any)}
                className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border border-slate-50 shadow-inner hover:scale-105 transition-transform"
              >
                {post.authorAvatar ? (
                  <img 
                    src={post.authorAvatar} 
                    alt={post.authorName} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary text-white font-black text-xl">
                    {post.authorName?.charAt(0) || 'B'}
                  </div>
                )}
              </button>
              <div className="text-left">
                <button 
                  onClick={() => onBusinessClick?.({ id: post.businessId, name: post.authorName } as any)}
                  className="text-base font-black text-bg-dark poppins-bold leading-none hover:text-accent transition-colors block"
                >
                  {post.authorName}
                </button>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <MapPin className="w-3 h-3" />
                    <span>Iraq</span>
                  </div>
                  <span className="text-[10px] text-slate-300">•</span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {new Date(post.createdAt).toLocaleDateString(language === 'ar' ? 'ar-IQ' : 'en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-bg-dark transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Post Image */}
          {post.image && (
            <div className="aspect-square sm:aspect-video bg-slate-50 relative overflow-hidden group">
              <img 
                src={post.image} 
                alt="Post content" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Post Actions */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => likePost(post.id)}
                  className="flex items-center gap-2 group"
                >
                  <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-red-500 transition-all">
                    <Heart className="w-5 h-5" />
                  </div>
                  <span className="text-[12px] font-black text-slate-500">{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 group">
                  <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[12px] font-black text-slate-500">0</span>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-accent/10 hover:text-accent transition-all">
                  <Bookmark className="w-5 h-5" />
                </button>
                <button className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-accent/10 hover:text-accent transition-all">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Caption */}
            <div className="mb-6">
              <p className="text-sm text-slate-600 leading-relaxed">
                <span className="font-black text-bg-dark mr-2">{post.authorName}</span>
                {post.content}
              </p>
            </div>

            {/* CTA Button */}
            <button 
              onClick={() => onBusinessClick?.({ id: post.businessId, name: post.authorName } as any)}
              className="w-full py-4 bg-bg-dark text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-accent hover:text-bg-dark transition-all group"
            >
              <span>{language === 'ar' ? 'عرض النشاط التجاري' : language === 'ku' ? 'بینینی کارەکە' : 'View Business'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      ))}

      {/* End of Feed */}
      {hasMore && realPosts.length > 0 ? (
        <div className="flex justify-center pt-8 pb-12">
          <button 
            onClick={loadMore}
            disabled={postsLoading}
            className="px-12 py-5 bg-white border-2 border-slate-100 text-bg-dark font-black rounded-2xl hover:border-accent hover:text-bg-dark transition-all shadow-premium uppercase tracking-[0.2em] text-[12px] flex items-center gap-4 group disabled:opacity-50"
          >
            {postsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            )}
            {language === 'en' ? 'Load More Posts' : 'تحميل المزيد من المنشورات'}
          </button>
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            {language === 'ar' ? 'لقد شاهدت كل شيء' : language === 'ku' ? 'هەموو پۆستەکانت بینی' : 'You\'re all caught up'}
          </p>
        </div>
      )}
    </div>
  );
}
