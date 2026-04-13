import React from 'react';
import { motion } from 'motion/react';
import { Star, MapPin, Phone, MessageCircle, ShieldCheck, TrendingUp, Heart, Share2 } from 'lucide-react';
import { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import { mapBusinessToCard } from '@/lib/mappers';

interface BusinessCardProps {
  key?: string | number;
  biz: Business;
  variant?: 'default' | 'compact' | 'featured';
  onClick?: (biz: Business) => void;
}

export default function BusinessCard({ biz, variant = 'default', onClick }: BusinessCardProps) {
  const { language } = useHomeStore();
  const card = mapBusinessToCard(biz, language);

  const whatsappNumber = biz.socialLinks?.whatsapp || biz.phone;
  const callNumber = biz.phone;

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${callNumber}`;
  };

  const getCategoryStyles = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes('rest') || c.includes('food')) return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', dot: 'bg-orange-500' };
    if (c.includes('cafe') || c.includes('coffee')) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', dot: 'bg-amber-600' };
    if (c.includes('hotel')) return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', dot: 'bg-blue-600' };
    if (c.includes('med') || c.includes('pharm') || c.includes('hosp')) return { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-100', dot: 'bg-cyan-500' };
    return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100', dot: 'bg-primary' };
  };

  const catStyles = getCategoryStyles(card.categoryName);

  if (variant === 'featured') {
    return (
      <motion.div
        whileHover={{ y: -5 }}
        onClick={() => onClick?.(biz)}
        className="flex-shrink-0 w-72 sm:w-80 group cursor-pointer"
      >
        <div className="relative aspect-[16/10] rounded-[20px] overflow-hidden mb-4 shadow-premium border border-white/10">
          <img 
            src={card.image} 
            alt={card.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="absolute top-4 left-4">
            <div className={`px-3 py-1 ${catStyles.bg} backdrop-blur-md rounded-full border ${catStyles.border}`}>
              <span className={`text-[8px] font-black ${catStyles.text} uppercase tracking-widest`}>
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
                <MapPin className="w-3 h-3 text-accent" />
                <span className="text-[9px] font-bold uppercase tracking-widest">
                  {card.location}
                </span>
              </div>
              <div className="flex items-center gap-1 glass-dark px-2 py-0.5 rounded-lg border border-white/10">
                <Star className="w-2.5 h-2.5 text-accent fill-accent" />
                <span className="text-[9px] font-black text-white">{card.rating.toFixed(1)}</span>
              </div>
            </div>
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
      whileHover={{ y: -8 }}
      className="group relative flex flex-col bg-white rounded-[20px] overflow-hidden shadow-card border border-slate-100 transition-all duration-500 h-full"
    >
      {/* Postcard Image Section */}
      <div 
        className="aspect-[16/10] w-full overflow-hidden relative cursor-pointer"
        onClick={() => onClick?.(biz)}
      >
        <img 
          src={card.image} 
          alt={card.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        
        {/* Overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className={`px-3 py-1.5 ${catStyles.bg} backdrop-blur-md rounded-xl shadow-sm border ${catStyles.border} flex items-center gap-2`}>
            <div className={`w-1.5 h-1.5 rounded-full ${catStyles.dot} animate-pulse`} />
            <span className={`text-[8px] font-black ${catStyles.text} uppercase tracking-widest`}>
              {card.categoryName}
            </span>
          </div>
        </div>

        {/* City Badge */}
        <div className="absolute top-4 right-4">
          <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-xl shadow-lg border border-white/10 flex items-center gap-2">
            <MapPin className="w-3 h-3 text-accent" />
            <span className="text-[8px] font-black text-white uppercase tracking-widest">
              {biz.city || 'Iraq'}
            </span>
          </div>
        </div>

        {/* Rating Badge */}
        <div className="absolute bottom-4 left-4">
          <div className="px-3 py-1.5 bg-accent backdrop-blur-md rounded-xl shadow-lg border border-white/10 flex items-center gap-2">
            <Star className="w-3 h-3 text-white fill-white" />
            <span className="text-[10px] font-black text-white">{card.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
      
      {/* Info Section */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <h3 
              className="text-base sm:text-lg font-black text-text-main poppins-bold uppercase tracking-tight group-hover:text-primary transition-colors duration-300 cursor-pointer line-clamp-1"
              onClick={() => onClick?.(biz)}
            >
              {card.name}
            </h3>
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 text-text-muted">
              <MapPin className="w-3 h-3" />
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest truncate">
                {card.location}
              </span>
            </div>
          </div>
          {card.isVerified && (
            <div className="w-8 h-8 bg-primary/5 rounded-xl flex items-center justify-center shrink-0 border border-primary/10">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
          )}
        </div>

        {card.description && (
          <p className="text-text-muted text-[11px] sm:text-[12px] line-clamp-2 mb-6 font-medium leading-relaxed">
            {card.description}
          </p>
        )}
        
        {/* Action Buttons */}
        <div className="mt-auto flex gap-2">
          <button 
            onClick={handleCall}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white text-[9px] sm:text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-primary-dark transition-all active:scale-95 shadow-lg shadow-primary/10"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'اتصال' : 'Call'}</span>
          </button>
          <button 
            onClick={handleWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] text-white text-[9px] sm:text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-[#128C7E] transition-all active:scale-95 shadow-lg shadow-green-500/10"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
