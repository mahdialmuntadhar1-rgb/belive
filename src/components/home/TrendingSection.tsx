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

  const getBusinessImage = (biz: Business) => {
    if (biz.image) return biz.image;
    
    const category = biz.category.toLowerCase();
    if (category.includes('dining') || category.includes('restaurant') || category.includes('food')) {
      return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=400&auto=format&fit=crop';
    }
    if (category.includes('furniture') || category.includes('home')) {
      return 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=400&auto=format&fit=crop';
    }
    if (category.includes('doctor') || category.includes('medical') || category.includes('clinic')) {
      return 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop';
    }
    if (category.includes('cafe') || category.includes('coffee')) {
      return 'https://images.unsplash.com/photo-1501339819398-ed495197ff21?q=80&w=400&auto=format&fit=crop';
    }
    if (category.includes('gym') || category.includes('fitness')) {
      return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop';
    }
    
    return `https://picsum.photos/seed/${biz.id}/400/400`;
  };

  if (loading && businesses.length === 0) return (
    <div className="w-full mb-12">
      <div className="flex items-center justify-between px-4 mb-6">
        <div className="h-6 bg-gray-100 animate-pulse rounded w-48" />
        <div className="h-4 bg-gray-100 animate-pulse rounded w-24" />
      </div>
      <div className="flex gap-4 overflow-x-auto px-4 no-scrollbar pb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-40 h-40 bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden shadow-sm">
            <div className="h-full bg-gray-100 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );

  if (!loading && featured.length === 0) return null;

  return (
    <div className="w-full mb-16">
      <div className="flex items-center justify-between px-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <h2 className="text-xl font-black text-text-main poppins-bold tracking-tight uppercase">{translations.featured[language]}</h2>
          </div>
          <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em]">{translations.featuredDesc[language]}</p>
        </div>
        <button 
          onClick={() => document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="group flex items-center gap-2 px-6 py-2.5 glass text-text-main text-[10px] font-black rounded-full hover:bg-primary hover:text-white transition-all duration-500 uppercase tracking-widest border border-slate-200"
        >
          {translations.seeAll[language]} <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${language === 'en' ? '' : 'rotate-180'}`} />
        </button>
      </div>

      <div className="flex gap-5 overflow-x-auto px-6 no-scrollbar pb-8 snap-x snap-mandatory">
        {featured.map((biz) => (
          <motion.div
            key={biz.id}
            whileHover={{ scale: 1.05 }}
            onClick={() => onBusinessClick?.(biz)}
            className="flex-shrink-0 w-48 aspect-square bg-bg-dark rounded-[40px] overflow-hidden shadow-social flex flex-col group cursor-pointer transition-all duration-500 snap-start border-2 border-transparent hover:border-primary relative"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src={getBusinessImage(biz)} 
                alt={biz.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-500 group-hover:from-black/95" />
            </div>

            {/* Content */}
            <div className="relative h-full p-5 flex flex-col justify-end items-start text-left">
              {/* Rating Badge */}
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-1 glass-dark px-2.5 py-1.5 rounded-xl border border-white/20">
                  <Star className="w-3 h-3 text-secondary fill-secondary" />
                  <span className="text-[11px] font-black text-white">{biz.rating?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                  {biz.category}
                </span>
              </div>

              <h3 className="text-sm font-black text-white mb-1.5 poppins-bold leading-tight tracking-tight group-hover:text-primary transition-colors line-clamp-2 uppercase">
                {getBusinessName(biz)}
              </h3>
              
              <div className="flex items-center gap-1.5 text-white/70 text-[10px] font-bold uppercase tracking-tighter">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span className="line-clamp-1">{biz.city}</span>
              </div>
            </div>
          </motion.div>
        ))}
        {/* Peek Effect Spacer */}
        <div className="flex-shrink-0 w-6" />
      </div>
    </div>
  );
}
