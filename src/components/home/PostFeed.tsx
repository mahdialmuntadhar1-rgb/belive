import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Heart, Share2, MoreHorizontal, User } from 'lucide-react';
import { useHomeStore } from '@/stores/homeStore';

const SAMPLE_POSTS = [
  {
    id: '1',
    user: { name: 'Ahmed Al-Baghdadi', avatar: 'https://i.pravatar.cc/150?u=ahmed' },
    content: 'Just tried the new coffee shop in Mansour. The atmosphere is amazing! ☕️🇮🇶',
    image: 'https://images.unsplash.com/photo-1501339819398-ee49a94b016f?q=80&w=800&auto=format&fit=crop',
    likes: 124,
    comments: 12,
    time: '2h ago'
  },
  {
    id: '2',
    user: { name: 'Sara Erbil', avatar: 'https://i.pravatar.cc/150?u=sara' },
    content: 'Erbil is looking beautiful tonight. Any recommendations for a good dinner spot? 🌆✨',
    likes: 89,
    comments: 45,
    time: '4h ago'
  },
  {
    id: '3',
    user: { name: 'Mustafa Basra', avatar: 'https://i.pravatar.cc/150?u=mustafa' },
    content: 'The weather in Basra is perfect for a walk by the Shatt al-Arab. 🌊☀️',
    image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=800&auto=format&fit=crop',
    likes: 256,
    comments: 18,
    time: '6h ago'
  }
];

export default function PostFeed() {
  const { language } = useHomeStore();
  const isRTL = language === 'ar' || language === 'ku';

  const translations = {
    feed: {
      en: 'Local Feed',
      ar: 'المنشورات المحلية',
      ku: 'پۆستە ناوخۆییەکان'
    },
    community: {
      en: 'What\'s happening in Iraq',
      ar: 'ماذا يحدث في العراق',
      ku: 'چی لە عێراق ڕوودەدات'
    }
  };

  return (
    <div className="w-full px-4 mb-12">
      <div className="flex flex-col mb-6">
        <h2 className="text-2xl font-black text-[#2B2F33] poppins-bold tracking-tight">
          {translations.feed[language]}
        </h2>
        <p className="text-sm text-[#6B7280] font-medium">
          {translations.community[language]}
        </p>
      </div>

      <div className="space-y-6">
        {SAMPLE_POSTS.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[32px] border border-[#E5E7EB] shadow-sm overflow-hidden"
          >
            {/* Post Header */}
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F5F7F9] border border-[#E5E7EB] overflow-hidden">
                  <img src={post.user.avatar} alt={post.user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#2B2F33] poppins-bold">{post.user.name}</h4>
                  <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">{post.time}</p>
                </div>
              </div>
              <button className="p-2 text-[#6B7280] hover:bg-[#F5F7F9] rounded-full transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Post Content */}
            <div className="px-5 pb-4">
              <p className="text-sm text-[#2B2F33] leading-relaxed">
                {post.content}
              </p>
            </div>

            {/* Post Image */}
            {post.image && (
              <div className="aspect-video w-full overflow-hidden">
                <img src={post.image} alt="Post" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}

            {/* Post Actions */}
            <div className="p-4 border-t border-[#F5F7F9] flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button className="flex items-center gap-2 text-[#6B7280] hover:text-[#E87A41] transition-colors group">
                  <Heart className="w-5 h-5 group-hover:fill-[#E87A41]" />
                  <span className="text-xs font-black">{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-[#6B7280] hover:text-[#2CA6A4] transition-colors group">
                  <MessageSquare className="w-5 h-5 group-hover:fill-[#2CA6A4]" />
                  <span className="text-xs font-black">{post.comments}</span>
                </button>
              </div>
              <button className="p-2 text-[#6B7280] hover:bg-[#F5F7F9] rounded-full transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
