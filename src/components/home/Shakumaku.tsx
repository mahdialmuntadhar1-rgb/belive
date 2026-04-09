import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "motion/react";
import { Heart, MapPin, Sparkles, Eye, Award, Store } from "lucide-react";
import { useHomeStore } from "@/stores/homeStore";
import { supabase } from "@/lib/supabaseClient";
import { getPostImage, logImageSelection } from "@/config/categoryImages";

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

interface EnrichedPost extends ShakuMakuPost {
  businessName?: string;
  businessNameAr?: string;
  category?: string;
  city?: string;
  governorate?: string;
}

interface ShakumakuProps {
  posts: ShakuMakuPost[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
}

// Default fallback if no category matches
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80";

function formatCaption(caption: string | null): string {
  if (!caption) return "اكتشف هذا المكان المميز!";
  // Clean up repetitive phrases for display - avoid regex with Arabic
  let cleaned = caption;
  // Remove "discover" variations
  cleaned = cleaned.replace("اكتشفوا ", "").replace("اكتشف ", "");
  // Remove leading sparkle emoji
  if (cleaned.startsWith("✨ ")) cleaned = cleaned.slice(2);
  return cleaned.trim() || "اكتشف هذا المكان المميز!";
}

// Individual Post Card Component
function PostCard({ 
  post, 
  isFeatured = false,
  isLiked,
  onLike 
}: { 
  post: EnrichedPost; 
  isFeatured?: boolean;
  isLiked: boolean;
  onLike: () => void;
}) {
  const { language } = useHomeStore();
  const isRTL = language === "ar" || language === "ku";
  // Get image using the new 60-image category-based system (3 images per category)
  const image = getPostImage(
    { 
      id: post.id, 
      image_url: post.image_url, 
      caption: post.caption, 
      caption_ar: post.caption_ar 
    },
    post.category
  );
  
  // Dev diagnostic: log first post image selection
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      logImageSelection(post.id, post.image_url, image, post.category || 'inferred');
    }
  }, [post.id, post.image_url, image, post.category]);
  
  const caption = formatCaption(post.caption_ar || post.caption);
  
  // Determine business display name
  const businessName = post.businessNameAr || post.businessName || "???? ?????";
  const location = post.city || post.governorate || "??????";
  
  if (isFeatured) {
    // FEATURED VARIANT: Larger, with accent styling
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-2 border-primary/30"
      >
        {/* Image Section - Taller for featured */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={image}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }}
          />
          {/* Featured Badge */}
          <div className="absolute top-3 left-3 bg-primary text-bg-dark px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
            <Award className="w-3 h-3" />
            {isRTL ? "????" : "Featured"}
          </div>
          {/* Subtle gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
        
        {/* Content Section - Below Image */}
        <div className="p-4 space-y-3" dir={isRTL ? "rtl" : "ltr"}>
          {/* Business Name */}
          <h3 className={`font-bold text-bg-dark line-clamp-1 ${isRTL ? "text-right" : "text-left"}`}>
            {businessName}
          </h3>
          
          {/* Location */}
          <div className={`flex items-center gap-1.5 text-slate-500 text-xs ${isRTL ? "flex-row-reverse" : ""}`}>
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span>{location}</span>
          </div>
          
          {/* Caption */}
          <p className={`text-slate-600 text-sm leading-relaxed line-clamp-2 ${isRTL ? "text-right" : "text-left"}`}>
            {caption}
          </p>
          
          {/* Footer Stats */}
          <div className={`flex items-center justify-between pt-3 border-t border-slate-100 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className="flex items-center gap-3 text-slate-400 text-xs">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {post.views_count || 0}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" />
                {post.likes_count + (isLiked ? 1 : 0)}
              </span>
            </div>
            <button
              onClick={onLike}
              className={`p-2 rounded-full transition-all ${
                isLiked 
                  ? "bg-red-50 text-red-500" 
                  : "bg-slate-50 text-slate-400 hover:bg-slate-100"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </motion.article>
    );
  }
  
  // STANDARD VARIANT: Clean, compact
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
    >
      {/* Image Section */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={image}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }}
        />
        {/* Subtle gradient */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      
      {/* Content Section */}
      <div className="p-3 space-y-2" dir={isRTL ? "rtl" : "ltr"}>
        {/* Business Name + Location */}
        <div className={`flex items-start justify-between gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          <h3 className={`font-bold text-sm text-bg-dark line-clamp-1 flex-1 ${isRTL ? "text-right" : "text-left"}`}>
            {businessName}
          </h3>
        </div>
        
        <div className={`flex items-center gap-1 text-slate-400 text-xs ${isRTL ? "flex-row-reverse" : ""}`}>
          <MapPin className="w-3 h-3" />
          <span className="line-clamp-1">{location}</span>
        </div>
        
        {/* Caption */}
        <p className={`text-slate-600 text-xs leading-relaxed line-clamp-2 ${isRTL ? "text-right" : "text-left"}`}>
          {caption}
        </p>
        
        {/* Footer */}
        <div className={`flex items-center justify-between pt-2 border-t border-slate-50 ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className="flex items-center gap-2 text-slate-400 text-[10px]">
            <span className="flex items-center gap-0.5">
              <Eye className="w-3 h-3" />
              {post.views_count || 0}
            </span>
            <span className="flex items-center gap-0.5">
              <Heart className="w-3 h-3" />
              {post.likes_count + (isLiked ? 1 : 0)}
            </span>
          </div>
          <button
            onClick={onLike}
            className={`p-1.5 rounded-full transition-all ${
              isLiked 
                ? "text-red-500" 
                : "text-slate-300 hover:text-slate-400"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default function Shakumaku({ posts, loading, error, hasMore, onLoadMore }: ShakumakuProps) {
  const { language } = useHomeStore();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [enrichedPosts, setEnrichedPosts] = useState<EnrichedPost[]>([]);
  
  const isRTL = language === "ar" || language === "ku";

  // Enrich posts with business data (lightweight batch fetch)
  useEffect(() => {
    if (!posts.length) return;
    
    const enrichPosts = async () => {
      // Get unique business IDs
      const businessIds = [...new Set(posts.map(p => p.business_id))];
      
      if (businessIds.length === 0) {
        setEnrichedPosts(posts);
        return;
      }
      
      try {
        // Batch fetch business data
        const { data: businesses } = await supabase
          .from("businesses")
          .select("id, name, nameAr, category, city, governorate")
          .in("id", businessIds.slice(0, 50)); // Limit to prevent huge queries
        
        const businessMap = new Map(businesses?.map(b => [b.id, b]) || []);
        
        const enriched = posts.map(post => {
          const biz = businessMap.get(post.business_id);
          return {
            ...post,
            businessName: biz?.name,
            businessNameAr: biz?.nameAr,
            category: biz?.category,
            city: biz?.city,
            governorate: biz?.governorate,
          };
        });
        
        setEnrichedPosts(enriched);
      } catch (err) {
        // Fallback to posts without enrichment
        setEnrichedPosts(posts);
      }
    };
    
    enrichPosts();
  }, [posts]);

  // Infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && onLoadMore(),
      { threshold: 0.5 }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  const handleLike = useCallback((postId: string) => {
    setLikedPosts(prev => new Set(prev).add(postId));
  }, []);

  // Loading state
  if (loading && enrichedPosts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-black text-bg-dark uppercase">
            {isRTL ? "???? ????" : "Shaku Maku"}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="h-44 bg-slate-100 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 bg-slate-100 rounded w-2/3 animate-pulse" />
                <div className="h-8 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && enrichedPosts.length === 0) {
    return (
      <div className="text-center py-20">
        <Sparkles className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-500 font-bold">{error}</p>
      </div>
    );
  }

  // Empty state
  if (enrichedPosts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-slate-400 font-medium">
          {isRTL ? "?? ???? ??????? ???" : "No posts yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex items-center gap-3 mb-6 ${isRTL ? "flex-row-reverse" : ""}`}>
        <Sparkles className="w-7 h-7 text-primary" />
        <div className={isRTL ? "text-right" : ""}>
          <h2 className="text-2xl font-black text-bg-dark uppercase tracking-tight">
            {isRTL ? "???? ????" : "Shaku Maku"}
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            {isRTL 
              ? "????? ??????? ?????? ?????" 
              : "Discover standout Iraqi businesses"}
          </p>
        </div>
      </div>
      
      {/* Grid - Featured posts get larger placement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {enrichedPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isFeatured={post.is_featured}
            isLiked={likedPosts.has(post.id)}
            onLike={() => handleLike(post.id)}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {loading && (
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">
                {isRTL ? "???? ???????..." : "Loading more..."}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
