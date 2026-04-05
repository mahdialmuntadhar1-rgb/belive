import React from 'react';
import { motion } from 'motion/react';
import { Star, MapPin, ArrowRight, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import { CATEGORIES } from '@/constants';

interface TrendingSectionProps {
  businesses: Business[];
  loading?: boolean;
  onBusinessClick?: (business: Business) => void;
}

export default function TrendingSection({ businesses, loading, onBusinessClick }: TrendingSectionProps) {
  const featured = businesses.filter(b => b.isFeatured).slice(0, 6);
  const { language } = useHomeStore();

  const translations = {
    featured: {
      en: 'Featured Businesses',
      ar: 'شركات مميزة',
      ku: 'کارە دیارەکان'
    },
    featuredDesc: {
      en: 'Handpicked premium places for you',
      ar: 'أماكن متميزة مختارة بعناية لك',
      ku: 'شوێنی نایاب کە بۆ تۆ هەڵبژێردراون'
    },
    seeAll: {
      en: 'See All',
      ar: 'عرض الكل',
      ku: 'بینینی هەموو'
    },
    verified: {
      en: 'Verified',
      ar: 'موثق',
      ku: 'پشتڕاستکراوە'
    }
  };

  const getBusinessName = (biz: Business) => {
    if (language === 'ar' && biz.nameAr) return biz.nameAr;
    if (language === 'ku' && biz.nameKu) return biz.nameKu;
    return biz.name;
  };

  const getCategoryName = (catId: string) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    if (!cat) return catId.replace('_', ' ');
    return cat.name[language as keyof typeof cat.name];
  };

  if (loading && businesses.length === 0) return (
    <div className="w-full mb-12">
      <div className="flex items-center justify-between px-4 mb-6">
        <div className="h-6 bg-gray-100 animate-pulse rounded w-48" />
        <div className="h-4 bg-gray-100 animate-pulse rounded w-24" />
      </div>
      <div className="flex gap-4 overflow-x-auto px-4 no-scrollbar pb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[260px] h-[340px] bg-white rounded-[24px] border border-[#E5E7EB] overflow-hidden shadow-sm">
            <div className="h-[60%] bg-gray-100 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-gray-100 animate-pulse rounded w-3/4" />
              <div className="h-4 bg-gray-100 animate-pulse rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!loading && featured.length === 0) return null;

  return (
    <div className="w-full mb-16">
      <div className="flex items-center justify-between px-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text-main poppins-bold tracking-tight">{translations.featured[language]}</h2>
          <p className="text-sm text-text-muted">{translations.featuredDesc[language]}</p>
        </div>
        <button 
          onClick={() => document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="group flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-xs font-black rounded-full hover:bg-primary hover:text-white transition-all duration-500 uppercase tracking-widest"
        >
          {translations.seeAll[language]} <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${language === 'en' ? '' : 'rotate-180'}`} />
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto px-4 no-scrollbar pb-8 snap-x snap-mandatory">
        {featured.map((biz) => (
          <motion.div
            key={biz.id}
            whileHover={{ y: -8 }}
            onClick={() => onBusinessClick?.(biz)}
            className="flex-shrink-0 w-[300px] aspect-square bg-bg-dark rounded-[40px] overflow-hidden shadow-2xl shadow-black/5 flex flex-col group cursor-pointer transition-all duration-500 snap-start border-4 border-transparent hover:border-primary"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src={biz.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop'} 
                alt={biz.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-500 group-hover:from-black/95" />
            </div>

            {/* Content */}
            <div className="relative h-full p-8 flex flex-col justify-end items-start text-left">
              {/* Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                <span className="px-3 py-1.5 bg-primary text-white text-[10px] font-black rounded-xl shadow-xl uppercase tracking-widest border border-white/20">
                  {getCategoryName(biz.category)}
                </span>
                {biz.isVerified && (
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-white px-3 py-1.5 rounded-xl shadow-xl border border-white/20 w-fit">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-widest">{translations.verified[language]}</span>
                  </div>
                )}
              </div>

              <div className="absolute top-6 right-6">
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xl border border-white/20">
                  <Star className="w-3.5 h-3.5 text-secondary fill-secondary" />
                  <span className="text-[11px] font-black text-white">{biz.rating?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>

              <h3 className="text-2xl font-black text-white mb-2 poppins-bold leading-tight tracking-tight group-hover:text-primary transition-colors">
                {getBusinessName(biz)}
              </h3>
              
              <div className="flex items-center gap-2 text-white/70 text-sm font-medium mb-6">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="line-clamp-1">{biz.city}, {biz.governorate}</span>
              </div>

              <div className="flex items-center justify-between w-full pt-4 border-t border-white/10">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-primary group-hover:border-primary transition-all duration-500 ml-auto">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {/* Peek Effect Spacer */}
        <div className="flex-shrink-0 w-4" />
      </div>
    </div>
  );
}
