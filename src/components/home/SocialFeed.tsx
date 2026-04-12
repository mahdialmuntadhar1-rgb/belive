import React from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion } from 'motion/react';
import { Smartphone, Heart, MessageCircle, Share2, MapPin, MoreHorizontal, Bookmark, ArrowRight, Loader2, Eye, Star, CheckCircle2, ShieldCheck, TrendingUp } from 'lucide-react';
import { useHomeStore } from '@/stores/homeStore';
import { usePosts } from '@/hooks/usePosts';
import { useBusinesses } from '@/hooks/useBusinesses';
import { Business, Post } from '@/lib/supabase';

import { useAuth } from '@/hooks/useAuth';

const formatMetric = (num: number) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

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
  "أحلى شي في {name} هو التعامل الراقي والاهتمام بالتفاصيل. شكراً شكو ماكو على هذا الاكتشاف! 🙌"
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
  "Welcome to {name}! Located in {city}, we offer the best {category} experience. ✨ #Iraq #ShakuMaku",
  "Experience world-class {category} at {name} in {governorate}. A premier destination for excellence. 🌟",
  "Discover amazing flavors at {name} in {address}. An unforgettable journey of taste and style. 🍢🔥",
  "Immerse yourself in the sophisticated atmosphere of {name}. Located in {city}, we offer unparalleled facilities. 🏨💎",
  "Proudly serving the {city} community. {name} is your first destination for {category}. 🛍️✨"
];

export default function SocialFeed({ onBusinessClick }: SocialFeedProps) {
  const { language } = useHomeStore();
  const { user } = useAuth();
  const { posts: realPosts, loading: postsLoading, error, hasMore, loadMore, likePost, createPost, addComment, fetchComments, refresh: fetchPosts } = usePosts();
  const { businesses, featuredBusinesses, loading: bizLoading } = useBusinesses("");
  const [isSeeding, setIsSeeding] = React.useState(false);
  const [seedProgress, setSeedProgress] = React.useState(0);
  const [feedType, setFeedType] = React.useState<'recent' | 'trending'>('recent');
  const [activeComments, setActiveComments] = React.useState<Record<string, Comment[]>>({});
  const [commentInputs, setCommentInputs] = React.useState<Record<string, string>>({});
  const [showComments, setShowComments] = React.useState<Record<string, boolean>>({});
  
  const isRTL = language === 'ar' || language === 'ku';

  const handleLike = async (postId: string) => {
    await likePost(postId, user?.id);
  };

  const handleComment = async (postId: string) => {
    if (!user) {
      alert(language === 'ar' ? 'يرجى تسجيل الدخول للتعليق' : 'Please login to comment');
      return;
    }
    const content = commentInputs[postId];
    if (!content?.trim()) return;

    try {
      await addComment(postId, user.id, content);
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      // Refresh comments
      const comments = await fetchComments(postId);
      setActiveComments(prev => ({ ...prev, [postId]: comments }));
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const toggleComments = async (postId: string) => {
    const isShowing = !showComments[postId];
    setShowComments(prev => ({ ...prev, [postId]: isShowing }));
    
    if (isShowing && !activeComments[postId]) {
      try {
        const comments = await fetchComments(postId);
        setActiveComments(prev => ({ ...prev, [postId]: comments }));
      } catch (err) {
        console.error('Failed to fetch comments:', err);
      }
    }
  };

  React.useEffect(() => {
    const refresh = async () => {
      await fetchPosts(false, feedType === 'trending');
    };
    refresh();
  }, [feedType, fetchPosts]);

  // AI Seeder Logic
  React.useEffect(() => {
    const seedPosts = async () => {
      if (postsLoading || bizLoading || realPosts.length >= 50 || isSeeding) return;
      
      if (realPosts.length > 5) return;

      setIsSeeding(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
        
        const availableBusinesses = businesses.length > 0 ? businesses : [];
        const targetCount = 50;
        const postsToCreate = [];

        for (let i = 0; i < targetCount; i++) {
          setSeedProgress(Math.round((i / targetCount) * 100));
          
          const biz = availableBusinesses[i % availableBusinesses.length];
          const category = biz?.category || ['Hotel', 'Restaurant', 'Cafe', 'Gym', 'Pharmacy', 'Mall', 'Salon', 'Hospital', 'Electronics', 'Services'][Math.floor(Math.random() * 10)];
          const city = biz?.city || ['Baghdad', 'Erbil', 'Basra', 'Sulaymaniyah', 'Najaf'][Math.floor(Math.random() * 5)];
          const bizName = biz?.name || (language === 'ar' ? `مؤسسة ${category} العراقية` : `Iraqi ${category} Co.`);

          const captionResponse = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Generate a unique, natural, business-like social media caption in Iraqi Arabic dialect for a ${category} named "${bizName}" located in ${city}. The tone should be inviting and authentic. Include a light call to action like "زورونا" or "احجز الآن". Max 120 characters. No hashtags.`,
          });
          const caption = captionResponse.text?.trim() || "أهلاً بكم في مشروعنا الجديد!";

          const promptResponse = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Generate a short, descriptive English image generation prompt for a ${category} in Iraq. Focus on high quality, realistic lighting, and local atmosphere. Example: "luxury hotel lobby in Erbil, warm lighting, modern design, Iraqi style, high quality". Return ONLY the prompt.`,
          });
          const imagePrompt = promptResponse.text?.trim() || `${category} in ${city} Iraq, high quality`;

          const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(imagePrompt)}?width=1080&height=1080&seed=${Math.random()}&nologo=true`;

          postsToCreate.push({
            businessId: biz?.id || `fallback-${i}`,
            businessName: bizName,
            businessAvatar: biz?.image || `https://i.pravatar.cc/150?u=${biz?.id || i}`,
            content: caption,
            caption: caption,
            imageUrl: imageUrl,
            image_url: imageUrl,
            likes: Math.floor(Math.random() * 1000) + 100,
            isVerified: biz?.isVerified || Math.random() > 0.7,
            createdAt: new Date(Date.now() - (targetCount - i) * 3600000).toISOString()
          });

          await createPost(caption, imageUrl, {
            businessName: bizName,
            businessAvatar: biz?.image,
            isVerified: biz?.isVerified
          } as any);
        }
      } catch (err) {
        console.error("Seeding failed:", err);
      } finally {
        setIsSeeding(false);
        setSeedProgress(100);
      }
    };

    seedPosts();
  }, [realPosts, businesses, postsLoading, bizLoading, isSeeding]);

  const displayPosts = realPosts;
  const isLoading = postsLoading || (realPosts.length === 0 && bizLoading);

  if (isSeeding) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <div className="w-24 h-24 bg-accent/10 rounded-[40px] flex items-center justify-center mb-8 shadow-inner relative">
          <Loader2 className="w-12 h-12 text-accent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-black text-accent">{seedProgress}%</span>
          </div>
        </div>
        <h3 className="text-2xl font-black text-bg-dark mb-4 poppins-bold uppercase tracking-tighter">
          {language === 'ar' ? 'جاري توليد المحتوى بالذكاء الاصطناعي' : 'Generating AI Content'}
        </h3>
        <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed font-medium">
          {language === 'ar' 
            ? 'نقوم بتجهيز ٥٠ منشوراً فريداً لأعمال حقيقية في العراق باستخدام أحدث تقنيات الذكاء الاصطناعي.' 
            : 'We are preparing 50 unique posts for real Iraqi businesses using state-of-the-art AI technology.'}
        </p>
      </div>
    );
  }

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
      {/* Featured Businesses Section */}
      {featuredBusinesses.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-black text-primary uppercase tracking-tight flex items-center gap-2">
              <Star className="w-5 h-5 text-accent fill-accent" />
              {language === 'ar' ? 'أعمال مميزة' : 'Featured Businesses'}
            </h3>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
            {featuredBusinesses.map((biz) => (
              <button
                key={biz.id}
                onClick={() => onBusinessClick?.(biz)}
                className="flex-shrink-0 w-48 bg-white rounded-3xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="aspect-video rounded-2xl overflow-hidden mb-3">
                  <img src={biz.image} alt={biz.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h4 className="text-xs font-black text-bg-dark truncate poppins-bold">{biz.name}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{biz.category}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Feed Header & Toggle */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="w-16 h-16 bg-accent/10 rounded-3xl flex items-center justify-center text-accent mb-4 shadow-inner">
          <Smartphone className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-black text-primary poppins-bold uppercase tracking-tighter">
          {language === 'ar' ? 'شكو ماكو' : 'Shaku Maku'}
        </h2>
        
        <div className="flex bg-slate-100 p-1 rounded-2xl mt-6 border border-slate-200">
          <button
            onClick={() => setFeedType('recent')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              feedType === 'recent' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-primary'
            }`}
          >
            {language === 'ar' ? 'الأحدث' : 'Recent'}
          </button>
          <button
            onClick={() => setFeedType('trending')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              feedType === 'trending' ? 'bg-white text-accent shadow-sm' : 'text-slate-400 hover:text-accent'
            }`}
          >
            <span>🔥</span>
            {language === 'ar' ? 'الرائج' : 'Trending'}
          </button>
        </div>
      </div>

      {displayPosts.map((post) => (
        <motion.div 
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-[24px] sm:rounded-[40px] border border-slate-100 shadow-card overflow-hidden"
        >
          {/* Post Header */}
          <div className="p-4 sm:p-6 flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <button 
                onClick={() => onBusinessClick?.({ id: post.businessId, name: post.authorName } as any)}
                className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-100 overflow-hidden border border-slate-50 shadow-inner hover:scale-105 transition-transform"
              >
                {post.authorAvatar ? (
                  <img 
                    src={post.authorAvatar} 
                    alt={post.authorName} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary text-white font-black text-sm sm:text-xl">
                    {post.authorName?.charAt(0) || 'B'}
                  </div>
                )}
              </button>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onBusinessClick?.({ id: post.businessId, name: post.authorName } as any)}
                    className="text-sm sm:text-base font-black text-bg-dark poppins-bold leading-none hover:text-accent transition-colors block"
                  >
                    {post.authorName}
                  </button>
                  {((post as any).isVerified || (post as any).isHotel) && (
                    <CheckCircle2 className="w-3 h-3 sm:w-4 h-4 text-accent fill-accent/10" />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 mt-1 sm:mt-2">
                  <div className="flex items-center gap-1 text-[8px] sm:text-[10px] font-bold text-slate-400">
                    <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span>{language === 'ar' ? 'العراق' : 'Iraq'}</span>
                  </div>
                  <span className="text-[8px] sm:text-[10px] text-slate-300">•</span>
                  <span className="text-[8px] sm:text-[10px] font-bold text-slate-400">
                    {new Date(post.createdAt).toLocaleDateString(language === 'ar' ? 'ar-IQ' : 'en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-bg-dark transition-colors">
              <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
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
              {/* Post Type Badge */}
              <div className="absolute bottom-4 right-4">
                <div className="px-3 py-1.5 bg-bg-dark/80 backdrop-blur-md rounded-xl shadow-lg border border-white/10 flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-accent" />
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">
                    {language === 'ar' ? 'تحديث العمل' : 'Business Update'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Post Actions */}
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-6">
                <button 
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-2 group"
                >
                  <Heart className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                    (post as any).isLiked ? 'text-red-500 fill-current' : 'text-slate-400 group-hover:text-red-500'
                  }`} />
                  <span className="text-[11px] sm:text-[13px] font-black text-slate-600">{formatMetric(post.likes)}</span>
                </button>
                <button 
                  onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-2 group"
                >
                  <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  <span className="text-[11px] sm:text-[13px] font-black text-slate-600">{formatMetric(post.commentsCount || 0)}</span>
                </button>
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                  <span className="text-[11px] sm:text-[13px] font-black text-slate-600">{formatMetric((post as any).views || 0)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="text-slate-400 hover:text-accent transition-colors">
                  <Bookmark className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button className="text-slate-400 hover:text-accent transition-colors">
                  <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            {/* Caption */}
            <div className="mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                <span className="font-black text-bg-dark mr-2">{post.authorName}</span>
                {post.content}
              </p>
            </div>

            {/* Comments Section */}
            {showComments[post.id] && (
              <div className="mb-6 space-y-4 border-t border-slate-50 pt-6">
                <div className="space-y-4 max-h-60 overflow-y-auto no-scrollbar">
                  {activeComments[post.id]?.map((comment) => (
                    <div key={comment.id} className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                        <img 
                          src={comment.profiles?.avatar_url || `https://i.pravatar.cc/150?u=${comment.user_id}`} 
                          alt={comment.profiles?.full_name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none flex-1 border border-slate-100">
                        <p className="text-[10px] font-black text-bg-dark mb-1">{comment.profiles?.full_name || 'User'}</p>
                        <p className="text-[11px] text-slate-600 leading-snug">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {user ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                      placeholder={language === 'ar' ? 'أضف تعليقاً...' : 'Add a comment...'}
                      className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-accent"
                    />
                    <button
                      onClick={() => handleComment(post.id)}
                      className="bg-accent text-bg-dark px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                    >
                      {language === 'ar' ? 'نشر' : 'Post'}
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 text-center italic">
                    {language === 'ar' ? 'سجل الدخول للتعليق' : 'Login to comment'}
                  </p>
                )}
              </div>
            )}

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
                  ? '"چی هەیە چی نیە تەنها ئەپڵیکەیشنە کە وای لێکردم شوێنەکان لە وڵاتەکەمدا بدۆزمەوە کە نەمدەزانی. ديزاين و ئاسانی بەکارهێنان وای لێدەکات ببێتة ئەپڵیکەيشني دڵخوازی من ڕۆژانە."'
                  : '"Shaku Maku is the only app that made me discover places in my country I never knew existed. The design and ease of use make it my favorite daily app."'}
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
