import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, MapPin, Phone, Globe, Share2, Heart, Clock, CheckCircle2, Facebook, Instagram, Twitter, MessageCircle } from 'lucide-react';
import { Business } from '@/lib/supabase';

interface BusinessDetailModalProps {
  business: Business | null;
  onClose: () => void;
}

export default function BusinessDetailModal({ business, onClose }: BusinessDetailModalProps) {
  if (!business) return null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: business.name,
          text: `Check out ${business.name} on BELIVE Iraqi Directory!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

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
            className="absolute inset-0 bg-[#2B2F33]/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
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
            <div className="relative h-72 sm:h-96 flex-shrink-0 group">
              <img 
                src={business.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop'} 
                alt={business.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Desktop Close */}
              <button
                onClick={onClose}
                className="absolute top-8 right-8 hidden sm:flex p-3 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 transition-all shadow-2xl"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="absolute bottom-8 left-8 right-8 text-white">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-4 py-1.5 bg-[#2CA6A4] text-[10px] font-black rounded-xl uppercase tracking-[0.2em] shadow-xl border border-white/20">
                    {business.category.replace('_', ' ')}
                  </span>
                  {business.isVerified && (
                    <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/30">
                      <CheckCircle2 className="w-4 h-4 text-[#2CA6A4] fill-white" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Verified Business</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                    <Star className="w-4 h-4 text-[#E87A41] fill-[#E87A41]" />
                    <span className="text-[11px] font-black">{business.rating?.toFixed(1) || 'N/A'}</span>
                    <span className="text-[10px] text-white/60 font-bold ml-1">({business.reviewCount || 0})</span>
                  </div>
                </div>
                <h2 className="text-4xl sm:text-5xl font-bold poppins-bold leading-tight tracking-tight drop-shadow-2xl">{business.name}</h2>
                <div className="flex items-center gap-2 mt-3 text-white/80 font-medium">
                  <MapPin className="w-4 h-4 text-[#2CA6A4]" />
                  <span className="text-sm">{business.address}</span>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 overflow-y-auto p-8 sm:p-10 bg-[#F9FAFB]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Info */}
                <div className="lg:col-span-2 space-y-10">
                  <section>
                    <h3 className="text-xl font-bold text-[#2B2F33] mb-4 poppins-bold flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-[#2CA6A4] rounded-full" />
                      About this Business
                    </h3>
                    <p className="text-[#6B7280] leading-relaxed text-base">
                      {business.description || `Welcome to ${business.name}, a premier destination for ${business.category.replace('_', ' ')} in ${business.city}. We pride ourselves on delivering exceptional quality and authentic Iraqi hospitality to all our visitors.`}
                    </p>
                  </section>

                  <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm flex items-center gap-4 group hover:border-[#2CA6A4] transition-all">
                      <div className="w-12 h-12 bg-[#F5F7F9] group-hover:bg-[#2CA6A4]/10 rounded-2xl flex items-center justify-center transition-colors">
                        <Clock className="w-6 h-6 text-[#2CA6A4]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-0.5">Opening Hours</p>
                        <p className="text-sm font-bold text-[#2B2F33]">{business.openingHours || '9:00 AM - 10:00 PM'}</p>
                      </div>
                    </div>
                    <div className="p-5 bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm flex items-center gap-4 group hover:border-[#2CA6A4] transition-all">
                      <div className="w-12 h-12 bg-[#F5F7F9] group-hover:bg-[#2CA6A4]/10 rounded-2xl flex items-center justify-center transition-colors">
                        <Phone className="w-6 h-6 text-[#2CA6A4]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-0.5">Contact Number</p>
                        <p className="text-sm font-bold text-[#2B2F33]">{business.phone}</p>
                      </div>
                    </div>
                  </section>

                  {/* Social Links */}
                  <section>
                    <h3 className="text-lg font-bold text-[#2B2F33] mb-6 poppins-bold">Connect with us</h3>
                    <div className="flex flex-wrap gap-4">
                      {business.socialLinks?.facebook && (
                        <a href={business.socialLinks.facebook} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white rounded-2xl border border-[#E5E7EB] flex items-center justify-center text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all shadow-sm">
                          <Facebook className="w-5 h-5" />
                        </a>
                      )}
                      {business.socialLinks?.instagram && (
                        <a href={business.socialLinks.instagram} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white rounded-2xl border border-[#E5E7EB] flex items-center justify-center text-[#E4405F] hover:bg-[#E4405F] hover:text-white transition-all shadow-sm">
                          <Instagram className="w-5 h-5" />
                        </a>
                      )}
                      {business.socialLinks?.twitter && (
                        <a href={business.socialLinks.twitter} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white rounded-2xl border border-[#E5E7EB] flex items-center justify-center text-[#1DA1F2] hover:bg-[#1DA1F2] hover:text-white transition-all shadow-sm">
                          <Twitter className="w-5 h-5" />
                        </a>
                      )}
                      {business.socialLinks?.whatsapp && (
                        <a href={`https://wa.me/${business.socialLinks.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="w-12 h-12 bg-white rounded-2xl border border-[#E5E7EB] flex items-center justify-center text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all shadow-sm">
                          <MessageCircle className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </section>
                </div>

                {/* Right Column: Actions */}
                <div className="space-y-6">
                  <div className="p-8 bg-white rounded-[32px] border border-[#E5E7EB] shadow-xl space-y-4">
                    <h4 className="text-sm font-black text-[#2B2F33] uppercase tracking-widest mb-4">Quick Actions</h4>
                    <a 
                      href={`tel:${business.phone}`}
                      className="w-full py-4 bg-[#2CA6A4] text-white font-black rounded-2xl shadow-xl shadow-[#2CA6A4]/20 hover:bg-[#1e7a78] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                    >
                      <Phone className="w-4 h-4" />
                      Call Business
                    </a>
                    {business.website && (
                      <a 
                        href={business.website}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-4 border-2 border-[#E5E7EB] text-[#2B2F33] font-black rounded-2xl hover:border-[#2CA6A4] hover:text-[#2CA6A4] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                      >
                        <Globe className="w-4 h-4" />
                        Visit Website
                      </a>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={handleShare}
                        className="py-4 border border-[#E5E7EB] text-[#2B2F33] font-bold rounded-2xl hover:bg-[#F5F7F9] transition-all flex items-center justify-center gap-2 text-xs"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                      <button className="py-4 border border-[#E5E7EB] text-[#2B2F33] font-bold rounded-2xl hover:bg-[#F5F7F9] transition-all flex items-center justify-center gap-2 text-xs">
                        <Heart className="w-4 h-4" />
                        Save
                      </button>
                    </div>
                  </div>

                  <div className="p-6 bg-[#2CA6A4]/5 rounded-[24px] border border-[#2CA6A4]/10">
                    <p className="text-[10px] font-black text-[#2CA6A4] uppercase tracking-widest mb-2">Location</p>
                    <p className="text-xs font-bold text-[#2B2F33] leading-relaxed">
                      {business.address}, {business.city}, {business.governorate}, Iraq
                    </p>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="mt-16 pt-16 border-t border-[#E5E7EB]">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-2xl font-bold text-[#2B2F33] poppins-bold tracking-tight">Customer Reviews</h3>
                    <p className="text-sm text-[#6B7280]">What people are saying about this place</p>
                  </div>
                  <button className="px-6 py-2.5 bg-white border-2 border-[#2CA6A4] text-[#2CA6A4] text-xs font-black rounded-xl hover:bg-[#2CA6A4] hover:text-white transition-all uppercase tracking-widest">
                    Write Review
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-6 bg-white rounded-[28px] border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#2CA6A4]/10 flex items-center justify-center text-[#2CA6A4] text-sm font-black">
                            {['JD', 'AS'][i-1]}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-[#2B2F33] block">{['John Doe', 'Ahmed S.'][i-1]}</span>
                            <span className="text-[10px] text-[#6B7280] font-medium uppercase tracking-widest">2 days ago</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className={`w-3 h-3 ${j < 4 ? 'text-[#E87A41] fill-[#E87A41]' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-[#6B7280] leading-relaxed italic">
                        "Amazing experience! The service was top-notch and the atmosphere was very welcoming. Highly recommend visiting if you're in {business.city}."
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
