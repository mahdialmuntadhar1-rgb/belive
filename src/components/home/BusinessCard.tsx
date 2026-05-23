import React from 'react';
import { motion } from 'motion/react';
import { Star, MapPin, Phone, MessageCircle, ShieldCheck, TrendingUp, Heart, Share2 } from 'lucide-react';
import { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import { mapBusinessToCard } from '@/lib/mappers';
import { useAuth } from '@/hooks/useAuth';
import { useAdminDB } from '@/hooks/useAdminDB';
import { useBuildModeContext } from '@/contexts/BuildModeContext';
import EditableWrapper from '../BuildModeEditor/EditableWrapper';
import { EditableImage } from '../BuildModeEditor/EditableImage';
import { EditorField } from '../BuildModeEditor/InlineEditor';

interface BusinessCardProps {
  key?: string | number;
  biz: Business;
  variant?: 'default' | 'compact' | 'featured';
  onClick?: (biz: Business) => void;
  onRefresh?: () => void;
}

export default function BusinessCard({ biz, variant = 'default', onClick, onRefresh }: BusinessCardProps) {
  const { language } = useHomeStore();
  const { updateBusiness, deleteBusiness } = useAdminDB();
  const { isAdmin } = useBuildModeContext();
  const card = mapBusinessToCard(biz, language);

  const businessFields: EditorField[] = [
    { name: 'name', label: 'Name (EN/Global)', type: 'text' },
    { name: 'name_ar', label: 'الاسم (عربي)', type: 'text' },
    { name: 'description', label: 'Description (EN)', type: 'textarea' },
    { name: 'description_ar', label: 'الوصف (عربي)', type: 'textarea' },
    { name: 'category', label: 'Category ID', type: 'text' },
    { name: 'city', label: 'City', type: 'text' },
    { name: 'phone', label: 'Phone', type: 'text' },
    { name: 'image_url', label: 'Image URL', type: 'url' },
    { name: 'is_verified', label: 'Verified', type: 'checkbox' },
    { name: 'rating', label: 'Rating', type: 'number' }
  ];

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
      <EditableWrapper
        title="تعديل المتجر"
        fields={businessFields}
        initialData={biz}
        onSave={async (data) => {
          const { success } = await updateBusiness(biz.id, data);
          if (success) onRefresh?.();
        }}
        onDelete={async () => {
          const { success } = await deleteBusiness(biz.id);
          if (success) onRefresh?.();
        }}
        className="flex-shrink-0"
      >
        <motion.div
          whileHover={{ y: -5 }}
          onClick={() => onClick?.(biz)}
          className="w-72 sm:w-80 group cursor-pointer"
        >
        <div className="relative aspect-[16/10] rounded-[20px] overflow-hidden mb-4 shadow-premium border border-white/10">
          <EditableImage
            src={card.image}
            alt={card.name}
            folder="business"
            isAdmin={isAdmin}
            onSave={(newUrl) => updateBusiness(biz.id, { image_url: newUrl }).then(() => onRefresh?.())}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          
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
      </EditableWrapper>
    );
  }

  return (
    <EditableWrapper
      title="تعديل المتجر"
      fields={businessFields}
      initialData={biz}
      onSave={async (data) => {
        const { success } = await updateBusiness(biz.id, data);
        if (success) onRefresh?.();
      }}
      onDelete={async () => {
        const { success } = await deleteBusiness(biz.id);
        if (success) onRefresh?.();
      }}
      className="h-full"
    >
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -12, scale: 1.02 }}
        className="group relative flex flex-col bg-white rounded-[32px] overflow-hidden shadow-2xl border border-slate-100 transition-all duration-500 h-full"
      >
      {/* Postcard Image Section */}
      <div 
        className="aspect-[16/10] w-full overflow-hidden relative cursor-pointer"
        onClick={() => onClick?.(biz)}
      >
        <EditableImage
          src={card.image}
          alt={card.name}
          folder="business"
          isAdmin={isAdmin}
          onSave={(newUrl) => updateBusiness(biz.id, { image_url: newUrl }).then(() => onRefresh?.())}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* Overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />
 
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className={`px-4 py-2 ${catStyles.bg} backdrop-blur-xl rounded-2xl shadow-lg border ${catStyles.border} flex items-center gap-2.5`}>
            <div className={`w-2 h-2 rounded-full ${catStyles.dot} animate-pulse shadow-[0_0_8px_rgba(15,123,108,0.5)]`} />
            <span className={`text-[9px] font-black ${catStyles.text} uppercase tracking-[0.2em]`}>
              {card.categoryName}
            </span>
          </div>
        </div>
 
        {/* City Badge */}
        <div className="absolute top-4 right-4">
          <div className="px-4 py-2 bg-black/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 flex items-center gap-2.5">
            <MapPin className="w-3.5 h-3.5 text-[#C8A96A]" />
            <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">
              {biz.city || 'Iraq'}
            </span>
          </div>
        </div>
 
        {/* Rating Badge */}
        <div className="absolute bottom-4 left-4">
          <div className="px-4 py-2 bg-[#C8A96A] backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 flex items-center gap-2.5">
            <Star className="w-3.5 h-3.5 text-white fill-white" />
            <span className="text-[11px] font-black text-white">{card.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
      
      {/* Info Section */}
      <div className="p-6 sm:p-8 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            <h3 
              className="text-lg sm:text-xl font-black text-[#111827] poppins-bold uppercase tracking-tight group-hover:text-[#0F7B6C] transition-colors duration-300 cursor-pointer line-clamp-1"
              onClick={() => onClick?.(biz)}
            >
              {card.name}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-slate-400">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest truncate">
                {card.location}
              </span>
            </div>
          </div>
          {card.isVerified && (
            <div className="w-10 h-10 bg-[#0F7B6C]/5 rounded-2xl flex items-center justify-center shrink-0 border border-[#0F7B6C]/10 shadow-inner">
              <ShieldCheck className="w-5 h-5 text-[#0F7B6C]" />
            </div>
          )}
        </div>
 
        {card.description && (
          <p className="text-slate-500 text-[12px] sm:text-[13px] line-clamp-2 mb-8 font-medium leading-relaxed">
            {card.description}
          </p>
        )}
        
        {/* Action Buttons */}
        <div className="mt-auto flex gap-3">
          <button 
            onClick={handleCall}
            className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-[#0F7B6C] text-white text-[10px] sm:text-[11px] font-black rounded-2xl uppercase tracking-[0.2em] hover:bg-[#0d6b5e] transition-all active:scale-95 shadow-xl shadow-[#0F7B6C]/20"
          >
            <Phone className="w-4 h-4" />
            <span>{language === 'ar' ? 'اتصال' : 'Call'}</span>
          </button>
          <button 
            onClick={handleWhatsApp}
            className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-[#25D366] text-white text-[10px] sm:text-[11px] font-black rounded-2xl uppercase tracking-[0.2em] hover:bg-[#128C7E] transition-all active:scale-95 shadow-xl shadow-green-500/20"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    </motion.div>
  </EditableWrapper>
);
}
