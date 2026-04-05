import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MapPin, Sparkles, TrendingUp, Users, ShieldCheck } from 'lucide-react';
import { Business } from '@/lib/supabase';

interface HeroSectionProps {
  businesses: Business[];
  onBusinessClick?: (business: Business) => void;
}

const SLOGANS = [
  {
    en: "Discover Iraq's hidden gems",
    ar: "اكتشف جواهر العراق الخفية",
    ku: "گەوهەرە شاراوەکانی عێراق بدۆزەرەوە",
    icon: Sparkles,
    color: "#2CA6A4"
  },
  {
    en: "Grow your business with Shakou Marku",
    ar: "نمِّ عملك التجاري مع Shakou Marku",
    ku: "کارەکەت لەگەڵ Shakou Marku گەشە پێ بدە",
    icon: TrendingUp,
    color: "#E87A41"
  },
  {
    en: "Verified reviews you can trust",
    ar: "مراجعات موثوقة يمكنك الاعتماد عليها",
    ku: "پێداچوونەوەی ڕاست و باوەڕپێکراو",
    icon: ShieldCheck,
    color: "#2CA6A4"
  }
];

export default function HeroSection({ businesses, onBusinessClick }: HeroSectionProps) {
  const featured = businesses.filter(b => b.isFeatured).slice(0, 5);
  const [currentSlogan, setCurrentSlogan] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlogan((prev) => (prev + 1) % SLOGANS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <section className="w-full mb-12">
      {/* Unified Big Rectangle Hero */}
      <div className="relative w-full h-[400px] sm:h-[500px] bg-[#2B2F33] overflow-hidden flex flex-col items-center justify-center text-center px-6">
        {featured.length > 0 ? (
          <div className="absolute inset-0 flex h-full overflow-x-auto snap-x snap-mandatory no-scrollbar">
            {featured.map((biz) => (
              <div 
                key={biz.id} 
                className="flex-shrink-0 w-full h-full snap-center relative group cursor-pointer"
                onClick={() => onBusinessClick?.(biz)}
              >
                {/* Background Image */}
                <img 
                  src={biz.image} 
                  alt={biz.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Deep Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                
                {/* Content Container */}
                <div className="absolute inset-0 max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-center items-start text-white text-left">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 mb-6"
                  >
                    <span className="px-4 py-2 bg-[#2CA6A4] text-xs font-black rounded-xl uppercase tracking-[0.2em] shadow-2xl shadow-[#2CA6A4]/40">
                      {biz.category.replace('_', ' & ')}
                    </span>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/20">
                      <Star className="w-4 h-4 text-[#E87A41] fill-[#E87A41]" />
                      <span className="text-sm font-black">{biz.rating}</span>
                    </div>
                  </motion.div>
                  
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl sm:text-7xl font-black mb-6 poppins-bold tracking-tighter leading-[0.9]"
                  >
                    {biz.name}
                  </motion.h2>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3 text-white/80 text-lg font-medium mb-10"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#2CA6A4]/20 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[#2CA6A4]" />
                    </div>
                    <span>{biz.city}, {biz.governorate}</span>
                  </motion.div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-10 py-5 bg-white text-[#2B2F33] font-black rounded-2xl hover:bg-[#2CA6A4] hover:text-white transition-all duration-500 uppercase tracking-widest text-sm shadow-2xl"
                  >
                    View Details
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-6xl font-black text-white mb-8 tracking-tighter poppins-bold"
            >
              SHAKOU MARKU
            </motion.h1>
            
            <div className="h-24 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlogan}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-2"
                >
                  <p className="text-xl sm:text-2xl font-bold text-[#2CA6A4]">{SLOGANS[currentSlogan].en}</p>
                  <p className="text-lg sm:text-xl text-white/80 font-medium">{SLOGANS[currentSlogan].ar}</p>
                  <p className="text-lg sm:text-xl text-white/60 font-medium">{SLOGANS[currentSlogan].ku}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#2CA6A4] rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#E87A41] rounded-full blur-[120px]" />
        </div>

        {/* Bottom Scroll Indicators (only if featured) */}
        {featured.length > 0 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {featured.map((_, idx) => (
              <div 
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx === 0 ? 'w-12 bg-[#2CA6A4]' : 'w-3 bg-white/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
