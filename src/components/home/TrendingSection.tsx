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
    <div className="w-full mb-20 bg-slate-50/30 py-16 border-y border-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between px-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-accent rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20 rotate-6 group-hover:rotate-12 transition-transform duration-700">
                <TrendingUp className="w-5 h-5 text-bg-dark" />
              </div>
              <h2 className="text-3xl font-black text-bg-dark poppins-bold tracking-tighter uppercase leading-none">
                {translations.featured[language]}
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.3em] ml-1">
              {translations.featuredDesc[language]}
            </p>
          </div>
          <button 
            onClick={() => document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="group flex items-center gap-4 px-8 py-4 bg-white text-bg-dark text-[10px] font-black rounded-2xl hover:bg-bg-dark hover:text-white transition-all duration-700 uppercase tracking-[0.25em] border-2 border-slate-100 shadow-xl shadow-slate-200/50"
          >
            {translations.seeAll[language]} 
            <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform duration-500 ${language === 'en' ? '' : 'rotate-180 group-hover:-translate-x-1'}`} />
          </button>
        </div>

        <div className="flex gap-8 overflow-x-auto px-6 no-scrollbar pb-12 snap-x snap-mandatory">
          {featured.map((biz, idx) => (
            <motion.div
              key={biz.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1, type: 'spring', stiffness: 100 }}
              whileHover={{ y: -12 }}
              onClick={() => onBusinessClick?.(biz)}
              className="flex-shrink-0 w-64 aspect-[4/5] bg-bg-dark rounded-[48px] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col group cursor-pointer transition-all duration-700 snap-start border-2 border-transparent hover:border-primary relative"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img 
                  src={getBusinessImage(biz)} 
                  alt={biz.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125 group-hover:rotate-2"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/95 via-bg-dark/40 to-transparent transition-opacity duration-700 group-hover:from-bg-dark/100" />
              </div>

              {/* Content */}
              <div className="relative h-full p-8 flex flex-col justify-end items-start text-left">
                {/* Rating Badge */}
                <div className="absolute top-6 right-6">
                  <div className="flex items-center gap-2 bg-bg-dark/80 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/10 shadow-2xl">
                    <Star className="w-3.5 h-3.5 text-secondary fill-secondary" />
                    <span className="text-[12px] font-black text-white">{biz.rating?.toFixed(1) || '5.0'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(255,159,28,0.8)]" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">
                    {CATEGORIES.find(c => c.id === biz.category)?.name[language] || biz.category}
                  </span>
                </div>

                <h3 className="text-xl font-black text-white mb-3 poppins-bold leading-tight tracking-tighter group-hover:text-primary transition-colors duration-500 line-clamp-2 uppercase">
                  {getBusinessName(biz)}
                </h3>
                
                <div className="flex items-center gap-2.5 text-white/60 text-[11px] font-black uppercase tracking-widest">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="line-clamp-1">{biz.city || biz.governorate}</span>
                </div>

                {/* Hover Indicator */}
                <div className="w-0 h-1 bg-primary rounded-full mt-4 group-hover:w-12 transition-all duration-700" />
              </div>
            </motion.div>
          ))}
          {/* Peek Effect Spacer */}
          <div className="flex-shrink-0 w-12" />
        </div>
      </div>
    </div>
  );
}
