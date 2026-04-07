import { useMemo, useState } from 'react';
import { Heart, MessageCircle, Clock, MapPin, Building2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { Business } from '@/lib/supabase';
import { usePosts } from '@/hooks/usePosts';
import { useAuthStore } from '@/stores/authStore';
import { useHomeStore } from '@/stores/homeStore';
import { CATEGORIES } from '@/constants';

type FeedItem =
  | {
      kind: 'real';
      id: string;
      businessName: string;
      category: string;
      location: string;
      content: string;
      image?: string;
      phone?: string;
      createdAt: Date;
      likes: number;
      postId: string;
    }
  | {
      kind: 'fallback';
      id: string;
      businessName: string;
      category: string;
      location: string;
      content: string;
      image?: string;
      phone?: string;
      createdAt: Date;
      likes: 0;
    };

interface FeedComponentProps {
  businesses: Business[];
  loading: boolean;
}

const FALLBACK_LIMIT = 10;

export default function FeedComponent({ businesses, loading: businessesLoading }: FeedComponentProps) {
  const { posts, loading: postsLoading, likePost, invalidLinkedCount, canLike } = usePosts();
  const { user } = useAuthStore();
  const { language } = useHomeStore();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const businessById = useMemo(
    () => new Map(businesses.map((business) => [business.id, business])),
    [businesses]
  );

  const translations = {
    now: { en: 'Just now', ar: 'الآن', ku: 'ئێستا' },
    hoursAgo: {
      en: (hours: number) => `${hours} hours ago`,
      ar: (hours: number) => `قبل ${hours} ساعة`,
      ku: (hours: number) => `${hours} کاتژمێر پێش`
    },
    uncategorized: { en: 'Uncategorized', ar: 'غير مصنف', ku: 'پۆل نەکراوە' },
    fallbackNoPosts: {
      en: 'No business posts yet',
      ar: 'لا توجد منشورات تجارية حالياً',
      ku: 'ئێستا هیچ پۆستی بازرگانی نییە'
    },
    missingLinks: {
      en: 'Posts exist, but linked business records are missing',
      ar: 'المنشورات موجودة لكن سجلات النشاط التجاري المرتبطة مفقودة',
      ku: 'پۆست هەیە بەڵام زانیاریی کاروباری پەیوەندیدار ونە'
    },
    contact: { en: 'Contact', ar: 'اتصال', ku: 'پەیوەندی' }
  };

  const getLocalizedBusinessName = (business: Business) => {
    if (language === 'ar' && business.nameAr) return business.nameAr;
    if (language === 'ku' && business.nameKu) return business.nameKu;
    return business.name;
  };

  const getCategoryName = (categoryId?: string) => {
    return CATEGORIES.find((category) => category.id === categoryId)?.name[language]
      || categoryId
      || translations.uncategorized[language];
  };

  const isRealImage = (value?: string) => Boolean(value && /^https?:\/\//.test(value) && !/picsum|placeholder/i.test(value));
  const isCallablePhone = (phone?: string) => Boolean(phone && phone.replace(/[^\d+]/g, '').length >= 8);

  const realFeedItems = useMemo<FeedItem[]>(() => {
    return posts
      .filter((post) => post.hasValidBusiness && post.businessId && post.content.trim().length > 0)
      .map((post) => {
        const business = businessById.get(post.businessId);
        const phone = post.businessPhone || business?.phone;
        const businessName =
          language === 'ar'
            ? post.businessNameAr || business?.nameAr || post.businessName || business?.name
            : language === 'ku'
            ? post.businessNameKu || business?.nameKu || post.businessName || business?.name
            : post.businessName || business?.name;

        return {
          kind: 'real',
          id: post.id,
          postId: post.id,
          businessName: businessName || (language === 'ar' ? 'عمل تجاري' : language === 'ku' ? 'کار' : 'Business'),
          category: getCategoryName(post.businessCategory || business?.category),
          location: [post.businessCity || business?.city, post.businessGovernorate || business?.governorate].filter(Boolean).join(' • '),
          content: post.content,
          image: isRealImage(post.image) ? post.image : undefined,
          phone: isCallablePhone(phone) ? phone : undefined,
          createdAt: post.createdAt,
          likes: post.likes || 0
        };
      });
  }, [posts, businessById, language]);

  const fallbackFeedItems = useMemo<FeedItem[]>(() => {
    const sorted = [...businesses]
      .sort((a, b) => {
        const aScore = (a.isFeatured ? 1000 : 0) + (a.isVerified ? 400 : 0) + (isRealImage(a.image) ? 120 : 0) + (isCallablePhone(a.phone) ? 80 : 0) + (a.rating || 0);
        const bScore = (b.isFeatured ? 1000 : 0) + (b.isVerified ? 400 : 0) + (isRealImage(b.image) ? 120 : 0) + (isCallablePhone(b.phone) ? 80 : 0) + (b.rating || 0);
        return bScore - aScore;
      })
      .slice(0, FALLBACK_LIMIT);

    return sorted.map((business, index) => {
      const businessName = getLocalizedBusinessName(business);
      const categoryName = getCategoryName(business.category);
      const location = [business.city, business.governorate].filter(Boolean).join(' • ');
      const intro =
        language === 'ar'
          ? `${businessName} ضمن فئة ${categoryName}${location ? ` في ${location}` : ''}. اكتشفوا الخدمات المتاحة الآن.`
          : language === 'ku'
          ? `${businessName} لە پۆلی ${categoryName}${location ? ` لە ${location}` : ''}. خزمەتگوزارییەکانی ئێستایان ببینن.`
          : `${businessName} is active in ${categoryName}${location ? ` in ${location}` : ''}. Discover their available services now.`;

      return {
        kind: 'fallback',
        id: `fallback-${business.id}`,
        businessName,
        category: categoryName,
        location,
        content: intro,
        image: isRealImage(business.image) ? business.image : undefined,
        phone: isCallablePhone(business.phone) ? business.phone : undefined,
        createdAt: new Date(Date.now() - index * 1000 * 60 * 60),
        likes: 0
      };
    });
  }, [businesses, language]);

  const visibleFeedItems = realFeedItems.length > 0 ? realFeedItems : fallbackFeedItems;

  const handleLike = async (postId: string) => {
    if (!user) return;

    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) newSet.delete(postId);
      else newSet.add(postId);
      return newSet;
    });

    try {
      await likePost(postId);
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return translations.now[language];
    if (hours < 24) return translations.hoursAgo[language](hours);
    return date.toLocaleDateString();
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

  if (visibleFeedItems.length === 0 && invalidLinkedCount > 0 && !postsLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-amber-500" />
        </div>
        <p className="text-sm text-text-muted font-bold uppercase tracking-widest">{translations.missingLinks[language]}</p>
      </div>
    );
  }

  if (visibleFeedItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-sm text-text-muted font-bold uppercase tracking-widest">{translations.fallbackNoPosts[language]}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-20">
      <div className="space-y-6">
        {visibleFeedItems.map((item, idx) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.45, delay: idx * 0.04 }}
            className="bg-white rounded-[28px] border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.2)] overflow-hidden"
          >
            {item.image && (
              <div className="w-full h-52 sm:h-64">
                <img src={item.image} alt={item.businessName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}

            <div className="p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-black text-bg-dark tracking-tight">{item.businessName}</h3>
                  <div className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600">{item.category}</span>
                    {item.location && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <MapPin size={12} className="text-primary" />
                        {item.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-primary" />
                      {formatTimestamp(item.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-slate-700 leading-relaxed text-[15px] sm:text-base">{item.content}</p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                {item.kind === 'real' && canLike && (
                  <button
                    type="button"
                    onClick={() => handleLike(item.postId)}
                    className={`sm:w-40 flex items-center justify-center gap-3 py-3 rounded-xl font-black text-[11px] uppercase tracking-[0.18em] transition-all ${
                      likedPosts.has(item.postId)
                        ? 'bg-primary text-bg-dark'
                        : 'bg-slate-50 text-slate-500 border border-slate-200 hover:border-primary/30 hover:text-primary'
                    }`}
                  >
                    <Heart size={16} className={likedPosts.has(item.postId) ? 'fill-current' : ''} />
                    {item.likes}
                  </button>
                )}

                {item.phone && (
                  <a
                    href={`tel:${item.phone}`}
                    className="flex-1 flex items-center justify-center py-3 bg-bg-dark text-white rounded-xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-primary hover:text-bg-dark transition-colors"
                  >
                    {translations.contact[language]}
                  </a>
                )}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
