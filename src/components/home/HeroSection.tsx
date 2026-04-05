import React from 'react';
import { motion } from 'motion/react';
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
    so: "گەوهەرە شاراوەکانی عێراق بدۆزەرەوە",
    ku: "Cewherên veşartî yên Iraqê kifş bikin",
    icon: Sparkles,
    color: "#2CA6A4"
  },
  {
    en: "Grow your business with BELIVE",
    ar: "نمِّ عملك التجاري مع BELIVE",
    so: "کارەکەت لەگەڵ BELIVE گەشە پێ بدە",
    ku: "Karsaziya xwe bi BELIVE re mezin bikin",
    icon: TrendingUp,
    color: "#E87A41"
  },
  {
    en: "Verified reviews you can trust",
    ar: "مراجعات موثوقة يمكنك الاعتماد عليها",
    so: "پێداچوونەوەی ڕاست و باوەڕپێکراو",
    ku: "Nirxandinên rast ên ku hûn dikarin pê bawer bin",
    icon: ShieldCheck,
    color: "#2CA6A4"
  },
  {
    en: "Reach thousands of new customers",
    ar: "تواصل مع آلاف العملاء الجدد",
    so: "بگە بە هەزاران کڕیاری نوێ",
    ku: "Bigihîjin bi hezaran xerîdarên nû",
    icon: Users,
    color: "#E87A41"
  }
];

export default function HeroSection({ businesses, onBusinessClick }: HeroSectionProps) {
  const featured = businesses.filter(b => b.isFeatured).slice(0, 5);
  
  return (
    <section className="w-full mb-12">
      {/* Unified Big Rectangle Hero */}
      <div className="relative w-full h-[500px] sm:h-[600px] bg-[#2B2F33] overflow-hidden">
        {featured.length > 0 ? (
          <div className="flex h-full overflow-x-auto snap-x snap-mandatory no-scrollbar">
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
                <div className="absolute inset-0 max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-center items-start text-white">
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
          <div className="w-full h-full flex items-center justify-center text-white/20 font-black text-4xl">
            BELIVE IRAQ
          </div>
        )}

        {/* Floating Value Proposition Marquee */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-black/20 backdrop-blur-md border-b border-white/10 py-3 overflow-hidden">
          <motion.div 
            animate={{ x: [0, -2000] }}
            transition={{ 
              duration: 40, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="flex items-center gap-16 whitespace-nowrap px-4"
          >
            {[...SLOGANS, ...SLOGANS, ...SLOGANS].map((slogan, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <slogan.icon className="w-4 h-4" style={{ color: slogan.color }} />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{slogan.en}</span>
                <span className="text-[10px] font-bold text-white/60 dir-rtl">{slogan.ar}</span>
                <div className="w-1 h-1 rounded-full bg-white/20" />
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom Scroll Indicators */}
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
      </div>
    </section>
  );
}
