import React from 'react';
import { motion } from 'motion/react';
import { Smartphone, Heart, MessageCircle, Share2, MapPin, MoreHorizontal, Bookmark, ArrowRight, Loader2, Eye, Star, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useHomeStore } from '@/stores/homeStore';
import { usePosts } from '@/hooks/usePosts';
import { useBusinesses } from '@/hooks/useBusinesses';
import { Business, Post } from '@/lib/supabase';

const formatMetric = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

interface SocialFeedProps {
  onBusinessClick?: (business: Business) => void;
}

const ARABIC_POST_TEMPLATES = [
  "أهلاً بكم في {name}، حيث تلتقي الفخامة بالراحة في قلب {city}. نحن هنا لخدمتكم بأفضل المعايير. ✨ #العراق #شكو_ماكو",
  "استمتع بتجربة {category} عالمية في {name} بـ {governorate}. وجهة بارزة لمن يبحث عن التميز. 🌟 #تجربة_فريدة",
  "اكتشف النكهات الرائعة في {name} في {address}. رحلة لا تُنسى من المذاق والأناقة. 🍢🔥 #مطاعم_العراق",
  "انغمس في الأجواء الراقية لـ {name}. يقع في {city}، ونقدم مرافق لا مثيل لها. 🏨💎 #إقامة_فاخرة #بغداد",
  "نخدم مجتمع {city} بكل فخر وتميز. {name} هو وجهتكم الأولى لـ {category}. 🛍️✨ #تميز #كردستان"
];

const HOTEL_POST_TEMPLATES_AR = [
  "فندق {name} في {city} يعد من أرقى الفنادق في المنطقة. استمتع بإقامة ملكية وخدمات خمس نجوم. 🏨✨ #فنادق_العراق #فخامة",
  "هل تبحث عن الراحة والتميز؟ فندق {name} في {governorate} يوفر لك كل ما تحتاجه لإقامة لا تُنسى. 🌟🏨",
  "إطلالة ساحرة وخدمة استثنائية في فندق {name} بقلب {city}. وجهتكم المثالية للعمل أو الاستجمام. 💎✨"
];

const HOTEL_POST_TEMPLATES_EN = [
  "Hotel {name} in {city} is one of the most prestigious hotels in the region. Enjoy a royal stay and five-star services. 🏨✨ #IraqHotels #Luxury",
  "Looking for comfort and distinction? {name} in {governorate} provides everything you need for an unforgettable stay. 🌟🏨",
  "Stunning views and exceptional service at {name} in the heart of {city}. Your perfect destination for business or leisure. 💎✨"
];

const ARABIC_TESTIMONIES = [
  "بصراحة، {name} من أفضل الأماكن اللي زرتها في {city}. الخدمة تجنن والأجواء كلش راقية. ❤️",
  "تجربتي في {name} كانت خيالية. أنصح الكل يزورهم إذا كانوا في {governorate}. ⭐⭐⭐⭐⭐",
  "ما شاء الله على الرقي والنظافة في {name}. فعلاً مكان يرفع الرأس. ✨",
  "أحلى شي في {name} هو التعامل الراقي والاهتمام بالتفاصيل. شكراً شاكوماكو على هذا الاكتشاف! 🙌"
];

const ARABIC_COMMENTS = [
  "مكان رائع جداً، أنصح به بشدة! ⭐⭐⭐⭐⭐",
  "الخدمة ممتازة والأجواء خيالية.",
  "أفضل مكان زرته في العراق حتى الآن.",
  "تجربة فريدة من نوعها، شكراً لكم.",
  "كل شيء كان مثالي، من الاستقبال حتى الوداع.",
  "مطعم راقي جداً والأكل طعمه لذيذ.",
  "فندق فخم وخدمة خمس نجوم.",
  "أجمل إطلالة ممكن تشوفها في أربيل.",
  "دائماً أختار هذا المكان لمناسباتي الخاصة.",
  "تطبيق رائع جداً وسهل الاستخدام!"
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

const FALLBACK_POST_TEMPLATES = [
  "Welcome to {name}! Located in {city}, we offer the best {category} experience. ✨ #Iraq #Shakumaku",
  "Experience world-class {category} at {name} in {governorate}. A premier destination for excellence. 🌟",
  "Discover amazing flavors at {name} in {address}. An unforgettable journey of taste and style. 🍢🔥",
  "Immerse yourself in the sophisticated atmosphere of {name}. Located in {city}, we offer unparalleled facilities. 🏨💎",
  "Proudly serving the {city} community. {name} is your first destination for {category}. 🛍️✨"
];

export default function SocialFeed({ onBusinessClick }: SocialFeedProps) {
  const { language } = useHomeStore();
  const { posts: realPosts, loading: postsLoading, error, hasMore, loadMore, likePost } = usePosts();
  const { businesses, loading: bizLoading } = useBusinesses("");
  
  const isRTL = language === 'ar' || language === 'ku';

  const virtualPosts = React.useMemo(() => {
    if (realPosts.length > 0) return realPosts;
    if (bizLoading || businesses.length === 0) return [];

    // Shuffle businesses for randomness
    const shuffled = [...businesses].sort(() => Math.random() - 0.5);

    return shuffled.slice(0, 20).map((biz, index) => {
      let content = "";
      const isHotel = biz.category.toLowerCase().includes('hotel');
      
      if (language === 'ar') {
        if (isHotel) {
          content = HOTEL_POST_TEMPLATES_AR[index % HOTEL_POST_TEMPLATES_AR.length];
        } else if (index % 4 === 0) {
          content = ARABIC_TESTIMONIES[index % ARABIC_TESTIMONIES.length];
        } else {
          content = ARABIC_POST_TEMPLATES[index % ARABIC_POST_TEMPLATES.length];
        }
      } else {
        if (isHotel) {
          content = HOTEL_POST_TEMPLATES_EN[index % HOTEL_POST_TEMPLATES_EN.length];
        } else {
          content = FALLBACK_POST_TEMPLATES[index % FALLBACK_POST_TEMPLATES.length];
        }
      }

      content = content
        .replace(/{name}/g, biz.name)
        .replace(/{city}/g, biz.city || 'العراق')
        .replace(/{governorate}/g, biz.governorate || 'العراق')
        .replace(/{category}/g, biz.category)
        .replace(/{address}/g, biz.address || biz.city);

      const images = CATEGORY_IMAGES[biz.category] || CATEGORY_IMAGES.general;
      const image = images[index % images.length];

      return {
        id: `virtual-${biz.id}`,
        businessId: biz.id,
        content,
        image,
        likes: Math.floor(Math.random() * 2000) + 500,
        views: Math.floor(Math.random() * 10000) + 2000,
        commentsCount: Math.floor(Math.random() * 50) + 10,
        createdAt: new Date(Date.now() - index * 3600000),
        authorName: biz.name,
        authorAvatar: biz.image,
        isVerified: biz.isVerified,
        isHotel: isHotel
      } as any;
    });
  }, [realPosts, businesses, bizLoading, language]);

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

  if (error) {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-red-500 font-bold mb-4">{error}</p>
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
          <Smartphone className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black text-primary poppins-bold uppercase tracking-tighter">
          {language === 'ar' ? 'شكو ماكو' : 'Shakumaku'}
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
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onBusinessClick?.({ id: post.businessId, name: post.authorName } as any)}
                    className="text-base font-black text-bg-dark poppins-bold leading-none hover:text-accent transition-colors block"
                  >
                    {post.authorName}
                  </button>
                  {((post as any).isVerified || (post as any).isHotel) && (
                    <CheckCircle2 className="w-4 h-4 text-accent fill-accent/10" />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <MapPin className="w-3 h-3" />
                    <span>{language === 'ar' ? 'العراق' : 'Iraq'}</span>
                  </div>
                  {(post as any).isHotel && (
                    <>
                      <span className="text-[10px] text-slate-300">•</span>
                      <div className="flex items-center gap-1 text-[10px] font-black text-accent uppercase tracking-widest">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{language === 'ar' ? 'فندق فاخر' : 'Luxury Hotel'}</span>
                      </div>
                    </>
                  )}
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
                  <span className="text-[12px] font-black text-slate-500">{formatMetric(post.likes)}</span>
                </button>
                <button className="flex items-center gap-2 group">
                  <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[12px] font-black text-slate-500">{formatMetric((post as any).commentsCount || 0)}</span>
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Eye className="w-5 h-5" />
                  </div>
                  <span className="text-[12px] font-black text-slate-500">{formatMetric((post as any).views || 0)}</span>
                </div>
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

            {/* Fake Reviews/Comments in Arabic */}
            <div className="mb-6 space-y-3 border-t border-slate-50 pt-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex text-accent">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {language === 'ar' ? 'تقييمات المستخدمين' : 'User Reviews'}
                </span>
              </div>
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                    <img 
                      src={`https://picsum.photos/seed/commenter${i + (post.id as any)}/100/100`} 
                      alt="User" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none flex-1 border border-slate-100">
                    <p className="text-[11px] text-slate-600 leading-snug">
                      {ARABIC_COMMENTS[(Math.floor(Math.random() * ARABIC_COMMENTS.length))]}
                    </p>
                  </div>
                </div>
              ))}
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

      {/* Testimony Section */}
      <div className="space-y-8 mt-20">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-black text-primary poppins-bold uppercase tracking-tighter">
            {language === 'ar' ? 'ماذا يقول مستخدمونا' : language === 'ku' ? 'بەکارهێنەرانمان چی دەڵێن' : 'What Our Users Say'}
          </h3>
          <div className="w-12 h-1 bg-accent mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-primary text-white p-10 rounded-[40px] shadow-premium relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-accent/20 transition-colors" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <span className="text-bg-dark text-2xl font-black poppins-bold">“</span>
              </div>
              <p className="text-base font-medium leading-relaxed mb-8 italic poppins-medium opacity-90">
                {language === 'ar' 
                  ? '"شكو ماكو هو التطبيق الوحيد اللي خلاني أكتشف أماكن في بلدي ما كنت أعرفها. التصميم والسهولة في الاستخدام يخليه التطبيق المفضل عندي يومياً."'
                  : language === 'ku'
                  ? '"شکو ماکۆ تەنها ئەپڵیکەیشنە کە وای لێکردم شوێنەکان لە وڵاتەکەمدا بدۆزمەوە کە نەمدەزانی. ديزاين و ئاسانی بەکارهێنان وای لێدەکات ببێتة ئەپڵیکەيشني دڵخوازی من ڕۆژانە."'
                  : '"Shakumaku is the only app that made me discover places in my country I never knew existed. The design and ease of use make it my favorite daily app."'}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-accent overflow-hidden shadow-md">
                  <img src="https://picsum.photos/seed/user1/100/100" alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-black text-accent uppercase tracking-widest text-[10px]">
                    {language === 'ar' ? 'أحمد الجبوري' : language === 'ku' ? 'ئەحمەد جەبوری' : 'Ahmed Al-Jubouri'}
                  </p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {language === 'ar' ? 'مستخدم مخلص من بغداد' : language === 'ku' ? 'بەکارهێنەرێکی دڵسۆز لە بەغداوە' : 'Loyal User from Baghdad'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white border-2 border-slate-100 p-10 rounded-[40px] shadow-premium relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-accent/10 transition-colors" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <span className="text-primary text-2xl font-black poppins-bold">“</span>
              </div>
              <p className="text-base font-medium leading-relaxed mb-8 italic poppins-medium text-slate-600">
                {language === 'ar' 
                  ? '"أفضل دليل سياحي وتجاري في العراق. ساعدني هواية في ترتيب رحلتي لأربيل ولقيت أحلى الفنادق والمطاعم بكل سهولة."'
                  : language === 'ku'
                  ? '"باشترین ڕێبەری گەشتیاری و بازرگانی لە عێراق. زۆر يارمەتیدەرم بوو لە ڕێکخستنی گەشتەکەم بۆ هەولێر و باشترین هۆتێل و چێشتخانەکانم بە ئاسانی دۆزییەوە."'
                  : '"The best travel and business guide in Iraq. It helped me a lot in organizing my trip to Erbil and I found the best hotels and restaurants with ease."'}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-accent overflow-hidden shadow-md">
                  <img src="https://picsum.photos/seed/user2/100/100" alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-black text-primary uppercase tracking-widest text-[10px]">
                    {language === 'ar' ? 'سارة الكردي' : language === 'ku' ? 'سارە کوردی' : 'Sara Al-Kurdi'}
                  </p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {language === 'ar' ? 'مسافرة من البصرة' : language === 'ku' ? 'گەشتیار لە بەسرەوە' : 'Traveler from Basra'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
