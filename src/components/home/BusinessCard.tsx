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
      className="group relative flex flex-col bg-white rounded-[32px] overflow-hidden shadow-card border border-slate-100 transition-all duration-500 h-full"
    >
      {/* Postcard Image Section */}
      <div 
        className="aspect-[4/3] w-full overflow-hidden relative cursor-pointer"
        onClick={() => onClick?.(biz)}
      >
        <img 
          src={card.image} 
          alt={card.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-white/50 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[8px] font-black text-bg-dark uppercase tracking-widest">
              {card.categoryName}
            </span>
          </div>
        </div>

        {/* Rating Badge */}
        <div className="absolute bottom-4 left-4">
          <div className="px-3 py-1.5 bg-bg-dark/80 backdrop-blur-md rounded-xl shadow-lg border border-white/10 flex items-center gap-2">
            <Star className="w-3 h-3 text-accent fill-accent" />
            <span className="text-[10px] font-black text-white">{card.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
      
      {/* Info Section */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 
              className="text-lg font-black text-bg-dark poppins-bold uppercase tracking-tight group-hover:text-accent transition-colors duration-300 cursor-pointer line-clamp-1"
              onClick={() => onClick?.(biz)}
            >
              {card.name}
            </h3>
            <div className="flex items-center gap-2 mt-1.5 text-slate-400">
              <MapPin className="w-3 h-3 text-accent" />
              <span className="text-[9px] font-bold uppercase tracking-widest truncate">
                {card.location}
              </span>
            </div>
          </div>
          {card.isVerified && (
            <ShieldCheck className="w-5 h-5 text-accent shrink-0" />
          )}
        </div>

        {card.description && (
          <p className="text-slate-500 text-[11px] line-clamp-2 mb-6 font-medium leading-relaxed">
            {card.description}
          </p>
        )}
        
        {/* Action Buttons */}
        <div className="mt-auto grid grid-cols-2 gap-3">
          <button 
            onClick={handleCall}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-bg-dark text-white text-[9px] font-black rounded-xl uppercase tracking-widest hover:bg-primary transition-all active:scale-95 shadow-sm"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'اتصال' : 'Call'}</span>
          </button>
          <button 
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] text-white text-[9px] font-black rounded-xl uppercase tracking-widest hover:bg-[#128C7E] transition-all active:scale-95 shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
