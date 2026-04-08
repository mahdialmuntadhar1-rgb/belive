import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, MapPin, Phone, Globe, Share2, Heart, Clock, CheckCircle2, Facebook, Instagram, Twitter, MessageCircle, ShieldAlert, Loader2, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { Business } from '@/lib/supabase';
import { CATEGORIES } from '@/constants';
import { useHomeStore } from '@/stores/homeStore';
import { useAuthStore } from '@/stores/authStore';
import { useBusinessManagement } from '@/hooks/useBusinessManagement';
import { useReviews } from '@/hooks/useReviews';
import { usePosts } from '@/hooks/usePosts';

interface BusinessDetailModalProps {
  business: Business | null;
  onClose: () => void;
}

export default function BusinessDetailModal({ business, onClose }: BusinessDetailModalProps) {
  const { language } = useHomeStore();
  const { user, profile } = useAuthStore();
  const { claimBusiness, loading: claimLoading } = useBusinessManagement();
  const { reviews, loading: reviewsLoading, hasMore: reviewsHasMore, loadMore: reviewsLoadMore } = useReviews(business?.id);
  const { posts: businessPosts, loading: postsLoading } = usePosts(business?.id);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  if (!business) return null;

  const translations = {
    verified: {
      en: 'Verified Business',
      ar: 'عمل تجاري موثق',
      ku: 'کارێکی پشتڕاستکراوە'
    },
    about: {
      en: 'About this Business',
      ar: 'عن هذا العمل',
      ku: 'دەربارەی ئەم کارە'
    },
    openingHours: {
      en: 'Opening Hours',
      ar: 'ساعات العمل',
      ku: 'کاتژمێرەکانی کارکردن'
    },
    contact: {
      en: 'Contact Number',
      ar: 'رقم الاتصال',
      ku: 'ژمارەی پەیوەندی'
    },
    connect: {
      en: 'Connect with us',
      ar: 'تواصل معنا',
      ku: 'پەیوەندیمان پێوە بکە'
    },
    quickActions: {
      en: 'Quick Actions',
      ar: 'إجراءات سريعة',
      ku: 'کردارە خێراکان'
    },
    call: {
      en: 'Call Business',
      ar: 'اتصال بالعمل',
      ku: 'پەیوەندی بکە'
    },
    website: {
      en: 'Visit Website',
      ar: 'زيارة الموقع',
      ku: 'سەردانی ماڵپەڕ'
    },
    share: {
      en: 'Share',
      ar: 'مشاركة',
      ku: 'هاوبەشکردن'
    },
    save: {
      en: 'Save',
      ar: 'حفظ',
      ku: 'پاشەکەوتکردن'
    },
    location: {
      en: 'Location',
      ar: 'الموقع',
      ku: 'شوێن'
    },
    reviews: {
      en: 'Customer Reviews',
      ar: 'آراء العملاء',
      ku: 'پێداچوونەوەی کڕیاران'
    },
    recentPosts: {
      en: 'Recent Posts',
      ar: 'آخر المنشورات',
      ku: 'دوایین پۆستەکان'
    },
    reviewsDesc: {
      en: 'What people are saying about this place',
      ar: 'ماذا يقول الناس عن هذا المكان',
      ku: 'خەڵک چی دەڵێن دەربارەی ئەم شوێنە'
    },
    writeReview: {
      en: 'Write Review',
      ar: 'كتابة مراجعة',
      ku: 'نووسینی پێداچوونەوە'
    },
    shareText: {
      en: `Check out ${business.name} on Saku Maku Iraqi Directory!`,
      ar: `اكتشف ${business.name} على دليل شكو ماكو العراقي!`,
      ku: `سەیری ${business.name} بکە لە دایرێکتۆری شکو ماکۆی عێراقی!`
    },
    claim: {
      en: 'Claim this Business',
      ar: 'المطالبة بهذا العمل',
      ku: 'داوای ئەم کارە بکە'
    },
    claimDesc: {
      en: 'Are you the owner? Claim this page to manage your profile and post updates.',
      ar: 'هل أنت المالك؟ طالب بهذه الصفحة لإدارة ملفك الشخصي ونشر التحديثات.',
      ku: 'ئایا تۆ خاوەنەکەی؟ داوای ئەم لاپەڕەیە بکە بۆ بەڕێوەبردنی پرۆفایلەکەت و بڵاوکردنەوەی نوێکارییەکان.'
    },
    claimSuccess: {
      en: 'Business claimed successfully!',
      ar: 'تمت المطالبة بالعمل بنجاح!',
      ku: 'بە سەرکەوتوویی داوای کارەکە کرا!'
    }
  };

  const getBusinessName = () => {
    if (language === 'ar' && business.nameAr) return business.nameAr;
    if (language === 'ku' && business.nameKu) return business.nameKu;
    return business.name;
  };

  const getBusinessDescription = () => {
    if (language === 'ar' && business.descriptionAr) return business.descriptionAr;
    return business.description || (language === 'ar' ? `مرحباً بك في ${getBusinessName()}...` : `Welcome to ${getBusinessName()}...`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: getBusinessName(),
          text: translations.shareText[language],
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  const handleClaim = async () => {
    if (!user) return;
    try {
      await claimBusiness(business.id);
      setClaimSuccess(true);
    } catch (err) {
      setClaimError(err instanceof Error ? err.message : 'Failed to claim business');
    }
  };

  const canClaim = !business.ownerId && profile?.role === 'business_owner';

  return (
    <AnimatePresence>
      {business && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg-dark/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            dir={language === 'en' ? 'ltr' : 'rtl'}
            className="relative w-full max-w-3xl h-full sm:h-auto sm:max-h-[95vh] bg-white sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Close Button (Mobile) */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/30 backdrop-blur-xl text-white hover:bg-black/50 transition-all sm:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Image Section */}
            <div className="relative h-80 sm:h-[500px] flex-shrink-0 group overflow-hidden">
              <motion.img 
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                src={business.image || CATEGORIES.find(c => c.id === business.category)?.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop'} 
                alt={business.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/40 to-transparent" />
              
              {/* Desktop Close */}
              <button
                onClick={onClose}
                className="absolute top-8 right-8 hidden sm:flex p-4 rounded-full glass text-white border border-white/20 hover:bg-white/20 transition-all shadow-2xl z-20 group/close"
              >
                <X className="w-6 h-6 group-hover/close:rotate-90 transition-transform duration-500" />
              </button>

              <div className="absolute bottom-12 left-12 right-12 text-white">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-wrap items-center gap-3 mb-6"
                >
                  <div className="px-5 py-2.5 bg-primary text-bg-dark text-[10px] font-black rounded-2xl uppercase tracking-[0.2em] shadow-2xl border border-white/20 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-bg-dark animate-pulse" />
                    {CATEGORIES.find(c => c.id === business.category)?.name[language] || business.category}
                  </div>
                  {business.isVerified && (
                    <div className="flex items-center gap-2 glass px-5 py-2.5 rounded-2xl border border-white/30 shadow-xl">
                      <ShieldCheck className="w-4 h-4 text-accent" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{translations.verified[language]}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 glass-dark px-5 py-2.5 rounded-2xl border border-white/10 shadow-xl">
                    <Star className="w-4 h-4 text-secondary fill-secondary" />
                    <span className="text-[12px] font-black">{business.rating?.toFixed(1) || '5.0'}</span>
                    <span className="text-[10px] text-white/60 font-bold ml-1">({business.reviewCount || 0})</span>
                  </div>
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl sm:text-8xl font-bold poppins-bold leading-[0.9] tracking-tighter drop-shadow-2xl mb-6 uppercase"
                >
                  {getBusinessName()}
                </motion.h2>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-4 text-white/90 font-bold"
                >
                  <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center border border-white/20 shadow-xl">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xl tracking-tight font-medium">
                    {business.neighborhood ? `${business.neighborhood}, ` : ''}{business.address || business.city}, {business.governorate}
                  </span>
                </motion.div>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 overflow-y-auto p-12 sm:p-16 bg-bg-light">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
                {/* Left Column: Info */}
                <div className="lg:col-span-2 space-y-16">
                  {/* Claim Banner */}
                  {canClaim && !claimSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-10 bg-secondary/5 border-2 border-secondary/10 rounded-[48px] flex flex-col sm:flex-row items-center gap-10 shadow-sm relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                      <div className="w-24 h-24 bg-secondary/10 rounded-[32px] flex items-center justify-center text-secondary shrink-0 shadow-inner relative z-10">
                        <ShieldAlert className="w-12 h-12" />
                      </div>
                      <div className="flex-1 text-center sm:text-left relative z-10">
                        <h4 className="text-2xl font-black text-bg-dark mb-3 poppins-bold uppercase tracking-tight">{translations.claim[language]}</h4>
                        <p className="text-base text-slate-500 leading-relaxed font-medium">{translations.claimDesc[language]}</p>
                      </div>
                      <button 
                        onClick={handleClaim}
                        disabled={claimLoading}
                        className="px-12 py-5 bg-secondary text-white font-black rounded-2xl shadow-2xl shadow-secondary/30 hover:bg-secondary-dark hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-[11px] disabled:opacity-50 flex items-center gap-4 relative z-10"
                      >
                        {claimLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : translations.claim[language]}
                      </button>
                    </motion.div>
                  )}

                  {claimSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-10 bg-accent/5 border-2 border-accent/10 rounded-[48px] flex items-center gap-8 shadow-sm"
                    >
                      <div className="w-16 h-16 bg-accent/10 rounded-[24px] flex items-center justify-center text-accent shadow-inner">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <p className="text-xl font-black text-accent uppercase tracking-tight">{translations.claimSuccess[language]}</p>
                    </motion.div>
                  )}

                  <section>
                    <div className="flex items-center gap-5 mb-10">
                      <div className="w-2 h-10 bg-primary rounded-full shadow-[0_0_15px_rgba(44,166,164,0.5)]" />
                      <h3 className="text-3xl font-black text-bg-dark poppins-bold uppercase tracking-tight">
                        {translations.about[language]}
                      </h3>
                    </div>
                    <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-premium relative group">
                      <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-all duration-500 -rotate-12 group-hover:rotate-0">
                        <MessageCircle className="w-6 h-6" />
                      </div>
                      <p className="text-slate-600 leading-relaxed text-xl font-medium">
                        {getBusinessDescription()}
                      </p>
                    </div>
                  </section>

                  <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="p-8 bg-white rounded-[40px] border border-slate-100 shadow-premium flex items-center gap-6 group hover:border-primary transition-all duration-500">
                      <div className="w-16 h-16 bg-slate-50 group-hover:bg-primary/10 rounded-[24px] flex items-center justify-center transition-colors shadow-inner">
                        <Clock className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{translations.openingHours[language]}</p>
                        <p className="text-lg font-black text-bg-dark poppins-bold">{business.openingHours || '9:00 AM - 10:00 PM'}</p>
                      </div>
                    </div>
                    <div className="p-8 bg-white rounded-[40px] border border-slate-100 shadow-premium flex items-center gap-6 group hover:border-primary transition-all duration-500">
                      <div className="w-16 h-16 bg-slate-50 group-hover:bg-primary/10 rounded-[24px] flex items-center justify-center transition-colors shadow-inner">
                        <Phone className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{translations.contact[language]}</p>
                        <p className="text-lg font-black text-bg-dark poppins-bold">{business.phone}</p>
                      </div>
                    </div>
                  </section>

                  {/* Social Links */}
                  {(business.socialLinks?.facebook || business.socialLinks?.instagram || business.socialLinks?.twitter || business.socialLinks?.whatsapp) && (
                    <section>
                      <div className="flex items-center gap-5 mb-10">
                        <div className="w-2 h-10 bg-secondary rounded-full shadow-[0_0_15px_rgba(232,122,65,0.5)]" />
                        <h3 className="text-3xl font-black text-bg-dark poppins-bold uppercase tracking-tight">
                          {translations.connect[language]}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-8">
                        {business.socialLinks?.facebook && (
                          <a href={business.socialLinks.facebook} target="_blank" rel="noreferrer" className="w-20 h-20 bg-white rounded-[28px] border border-slate-100 flex items-center justify-center text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all duration-500 shadow-premium hover:shadow-2xl hover:-translate-y-2">
                            <Facebook className="w-8 h-8" />
                          </a>
                        )}
                        {business.socialLinks?.instagram && (
                          <a href={business.socialLinks.instagram} target="_blank" rel="noreferrer" className="w-20 h-20 bg-white rounded-[28px] border border-slate-100 flex items-center justify-center text-[#E4405F] hover:bg-[#E4405F] hover:text-white transition-all duration-500 shadow-premium hover:shadow-2xl hover:-translate-y-2">
                            <Instagram className="w-8 h-8" />
                          </a>
                        )}
                        {business.socialLinks?.twitter && (
                          <a href={business.socialLinks.twitter} target="_blank" rel="noreferrer" className="w-20 h-20 bg-white rounded-[28px] border border-slate-100 flex items-center justify-center text-[#1DA1F2] hover:bg-[#1DA1F2] hover:text-white transition-all duration-500 shadow-premium hover:shadow-2xl hover:-translate-y-2">
                            <Twitter className="w-8 h-8" />
                          </a>
                        )}
                        {business.socialLinks?.whatsapp && (
                          <a 
                            href={`https://wa.me/${business.socialLinks.whatsapp.replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="w-20 h-20 bg-white rounded-[28px] border border-slate-100 flex items-center justify-center text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-500 shadow-premium hover:shadow-2xl hover:-translate-y-2 group"
                          >
                            <MessageCircle className="w-8 h-8 transition-transform group-hover:scale-110" />
                          </a>
                        )}
                      </div>
                    </section>
                  )}
                </div>

                {/* Right Column: Actions */}
                <div className="space-y-10">
                  <div className="p-10 bg-white rounded-[48px] border border-slate-100 shadow-premium space-y-8 sticky top-10">
                    <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">{translations.quickActions[language]}</h4>
                    <a 
                      href={`tel:${business.phone}`}
                      className="w-full py-6 bg-primary text-bg-dark font-black rounded-2xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-5 uppercase tracking-[0.2em] text-[12px]"
                    >
                      <Phone className="w-6 h-6" />
                      {translations.call[language]}
                    </a>
                    {business.website && (
                      <a 
                        href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-6 border-2 border-slate-100 text-bg-dark font-black rounded-2xl hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-5 uppercase tracking-[0.2em] text-[12px]"
                      >
                        <Globe className="w-6 h-6" />
                        {translations.website[language]}
                      </a>
                    )}
                    <div className="grid grid-cols-2 gap-5">
                      <button 
                        onClick={handleShare}
                        className="py-6 bg-slate-50 text-bg-dark font-black rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-4 text-[11px] uppercase tracking-widest group"
                      >
                        <Share2 className="w-5 h-5 transition-transform group-hover:rotate-12" />
                        {translations.share[language]}
                      </button>
                      <button className="py-6 bg-slate-50 text-bg-dark font-black rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-4 text-[11px] uppercase tracking-widest group">
                        <Heart className="w-5 h-5 transition-transform group-hover:scale-110 text-red-500" />
                        {translations.save[language]}
                      </button>
                    </div>

                    {!business.ownerId && profile?.role === 'business_owner' && (
                      <button 
                        onClick={handleClaim}
                        disabled={claimLoading}
                        className="w-full py-6 bg-secondary text-white font-black rounded-2xl shadow-2xl shadow-secondary/30 hover:bg-secondary/90 transition-all flex items-center justify-center gap-5 uppercase tracking-[0.2em] text-[12px] disabled:opacity-50"
                      >
                        {claimLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><ShieldCheck className="w-6 h-6" /> {translations.claim[language]}</>}
                      </button>
                    )}
                  </div>

                  <div className="p-10 bg-primary/5 rounded-[40px] border border-primary/10 shadow-inner group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                    <p className="text-[11px] font-black text-primary uppercase tracking-[0.3em] mb-4 relative z-10">{translations.location[language]}</p>
                    <p className="text-lg font-black text-bg-dark leading-relaxed poppins-bold relative z-10">
                      {business.address || business.city}, {business.governorate}, Iraq
                    </p>
                    {business.neighborhood && (
                      <p className="text-xs text-slate-400 mt-3 font-bold uppercase tracking-[0.2em] relative z-10">
                        {business.neighborhood} Neighborhood
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Posts Section */}
              {businessPosts.length > 0 && (
                <div className="mt-16 pt-16 border-t border-[#E5E7EB]">
                  <div className="flex items-center gap-5 mb-10">
                    <div className="w-2 h-10 bg-accent rounded-full shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
                    <h3 className="text-3xl font-black text-bg-dark poppins-bold uppercase tracking-tight">
                      {translations.recentPosts[language]}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {businessPosts.map((post) => (
                      <div key={post.id} className="group cursor-pointer">
                        <div className="aspect-square rounded-[32px] overflow-hidden border border-slate-100 shadow-sm relative mb-4">
                          <img 
                            src={post.image} 
                            alt="" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2 font-medium px-2">
                          {post.content}
                        </p>
                
                        <div className="flex items-center gap-4 mt-3 px-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-400">
                            <Heart className="w-3.5 h-3.5" />
                            <span>{post.likes}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              <div className="mt-16 pt-16 border-t border-[#E5E7EB]">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-2xl font-bold text-bg-dark poppins-bold tracking-tight">{translations.reviews[language]}</h3>
                    <p className="text-sm text-slate-500">{translations.reviewsDesc[language]}</p>
                  </div>
                  <button className="px-6 py-2.5 bg-white border-2 border-accent text-accent text-xs font-black rounded-xl hover:bg-accent hover:text-white transition-all uppercase tracking-widest">
                    {translations.writeReview[language]}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-6 bg-white rounded-[28px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent text-sm font-black overflow-hidden">
                            {review.userAvatar ? (
                              <img src={review.userAvatar} className="w-full h-full object-cover" alt="" />
                            ) : (
                              review.userName?.charAt(0) || 'U'
                            )}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-bg-dark block">{review.userName || 'Anonymous'}</span>
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{review.createdAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className={`w-3 h-3 ${j < review.rating ? 'text-accent fill-accent' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed italic">
                        "{review.comment}"
                      </p>
                    </div>
                  ))}
                  {reviews.length === 0 && !reviewsLoading && (
                    <div className="md:col-span-2 py-12 text-center text-slate-400">
                      <p>No reviews yet. Be the first to share your experience!</p>
                    </div>
                  )}
                </div>

                {reviewsHasMore && (
                  <div className="mt-10 text-center">
                    <button 
                      onClick={reviewsLoadMore}
                      disabled={reviewsLoading}
                      className="px-8 py-3 bg-white border-2 border-accent text-accent font-black rounded-2xl hover:bg-accent hover:text-white transition-all uppercase tracking-widest text-[10px] disabled:opacity-50"
                    >
                      {reviewsLoading ? 'Loading...' : 'Load More Reviews'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
