import React from 'react';
import { motion } from 'motion/react';
import { Star, MapPin, Phone, ArrowRight, ShieldCheck, TrendingUp, Heart } from 'lucide-react';
import { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import { mapBusinessToCard } from '@/lib/mappers';

interface BusinessCardProps {
  biz: Business;
  variant?: 'default' | 'compact' | 'featured';
  onClick?: (biz: Business) => void;
}

export default function BusinessCard({ biz, variant = 'default', onClick }: BusinessCardProps) {
  const { language } = useHomeStore();
  const card = mapBusinessToCard(biz, language);

  if (variant === 'featured') {
    return (
      <motion.div
        whileHover={{ y: -5 }}
        onClick={() => onClick?.(biz)}
        className="flex-shrink-0 w-72 sm:w-80 group cursor-pointer"
      >
        <div className="relative aspect-[16/10] rounded-[24px] overflow-hidden mb-4 shadow-premium border border-white/10">
          <img 
            src={card.image} 
            alt={card.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/90 via-bg-dark/20 to-transparent" />
          
          <div className="absolute top-4 left-4">
            <div className="px-3 py-1 glass rounded-full border border-white/20">
              <span className="text-[8px] font-black text-white uppercase tracking-widest">
                {card.categoryName}
              </span>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-left">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-black text-sm sm:text-base truncate uppercase tracking-tight poppins-bold">
                {card.name}
              </h3>
              {card.isVerified && <ShieldCheck className="w-4 h-4 text-accent" />}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-white/60">
                <MapPin className="w-3 h-3 text-primary" />
                <span className="text-[9px] font-bold uppercase tracking-widest">
                  {card.location}
                </span>
              </div>
              <div className="flex items-center gap-1 glass-dark px-2 py-0.5 rounded-lg border border-white/10">
                <Star className="w-2.5 h-2.5 text-secondary fill-secondary" />
                <span className="text-[9px] font-black text-white">{card.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        onClick={() => onClick?.(biz)}
        className="flex-shrink-0 w-48 group cursor-pointer"
      >
        <div className="relative aspect-square rounded-[20px] overflow-hidden mb-2 shadow-sm border border-slate-100">
          <img 
            src={card.image} 
            alt={card.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-bg-dark/40 group-hover:bg-bg-dark/10 transition-colors" />
          <div className="absolute bottom-2 left-2 right-2 text-left">
            <p className="text-white text-[9px] font-black truncate uppercase tracking-tight drop-shadow-md">
              {card.name}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10 }}
      className="group relative flex flex-col bg-white rounded-[40px] overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] border border-slate-100 transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] h-full"
    >
      {/* Image Section */}
      <div 
        className="aspect-[16/11] w-full overflow-hidden relative cursor-pointer"
        onClick={() => onClick?.(biz)}
      >
        <img 
          src={card.image} 
          alt={card.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 via-bg-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Category & Trending Badges */}
        <div className="absolute top-5 left-5 flex flex-col gap-2">
          <div className="px-4 py-2 glass rounded-[18px] shadow-2xl flex items-center gap-2.5 border border-white/30 backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(255,159,28,0.8)]" />
            <span className="text-[9px] font-black text-bg-dark uppercase tracking-[0.25em]">
              {card.categoryName}
            </span>
          </div>
          
          {(card.rating >= 4.8 || card.reviewCount > 50) && (
            <div className="px-4 py-2 bg-secondary rounded-[18px] shadow-2xl flex items-center gap-2.5 border border-white/20 backdrop-blur-md animate-bounce-slow">
              <TrendingUp className="w-3.5 h-3.5 text-bg-dark" />
              <span className="text-[9px] font-black text-bg-dark uppercase tracking-[0.25em]">
                Trending
              </span>
            </div>
          )}
        </div>

        {/* Rating & Interaction */}
        <div className="absolute bottom-5 right-5 flex items-center gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); /* Handle Like */ }}
            className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-all shadow-premium border border-white/20 group/heart"
          >
            <Heart className="w-5 h-5 transition-transform group-hover/heart:scale-110" />
          </button>
          <div className="px-4 py-2 bg-bg-dark/80 backdrop-blur-md rounded-[18px] shadow-2xl flex items-center gap-2.5 border border-white/10">
            <Star className="w-3.5 h-3.5 text-secondary fill-secondary" />
            <span className="text-[11px] font-black text-white">{card.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Quick Action Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
          <button 
            onClick={(e) => { e.stopPropagation(); onClick?.(biz); }}
            className="px-8 py-4 bg-white text-bg-dark text-[10px] font-black rounded-2xl uppercase tracking-[0.3em] shadow-2xl hover:bg-primary hover:text-bg-dark transition-all active:scale-95"
          >
            {language === 'ar' ? 'عرض التفاصيل' : language === 'ku' ? 'بینینی وردەکاری' : 'View Details'}
          </button>
        </div>
      </div>
      
      {/* Info Section */}
      <div className="p-8 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <h3 
              className="text-xl font-black text-bg-dark poppins-bold uppercase tracking-tighter group-hover:text-primary transition-colors duration-500 cursor-pointer line-clamp-1 leading-tight"
              onClick={() => onClick?.(biz)}
            >
              {card.name}
            </h3>
            <div className="flex items-center gap-2.5 mt-2 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] truncate">
                {card.location}
              </span>
            </div>
          </div>
          {card.isVerified && (
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner shrink-0 group-hover:bg-primary group-hover:text-bg-dark transition-all duration-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
          )}
        </div>

        {card.description && (
          <p className="text-slate-500 text-xs line-clamp-2 mb-6 font-medium leading-relaxed">
            {card.description}
          </p>
        )}
        
        <div className="mt-auto flex items-center gap-3">
          <button 
            onClick={() => onClick?.(biz)}
            className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-bg-dark text-white text-[10px] font-black rounded-2xl uppercase tracking-[0.3em] hover:bg-primary hover:text-bg-dark transition-all duration-500 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.3)] hover:shadow-primary/30 active:scale-95 group/btn"
          >
            <span>{language === 'ar' ? 'تواصل الآن' : language === 'ku' ? 'پەیوەندی بکە' : 'Contact Now'}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </button>
          <a 
            href={`tel:${card.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="w-12 h-12 flex items-center justify-center bg-slate-50 text-bg-dark rounded-2xl hover:bg-secondary hover:text-bg-dark transition-all duration-500 border border-slate-100 group/phone shadow-sm hover:shadow-secondary/20"
          >
            <Phone className="w-4 h-4 transition-transform group-hover/phone:rotate-12 group-hover/phone:scale-110" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
