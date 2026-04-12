import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Sparkles, TrendingUp, Users, ShieldCheck, LayoutDashboard, ArrowRight, Download, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import { useAuthStore } from '@/stores/authStore';

interface HeroSectionProps {
  businesses: Business[];
  onBusinessClick?: (business: Business) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SLOGANS = [
  {
    ar: "اكتشف الشركات العراقية حسب المدينة، وتابع آخر تحديثاتها في مكان واحد.",
    ku: "کۆمپانیا عێراقییەکان بەپێی شار بدۆزەرەوە، و بەدواداچوون بۆ نوێترین نوێکارییەکانیان بکە لە یەک شوێندا.",
    en: "Discover Iraqi businesses by city, and follow their latest updates in one place."
  },
  {
    ar: "اعثر على أفضل المطاعم، الفنادق، والخدمات في جميع محافظات العراق.",
    ku: "باشترین چێشتخانە، هوتێل، و خزمەتگوزارییەکان لە هەموو پارێزگاکانی عێراق بدۆزەرەوە.",
    en: "Find the best restaurants, hotels, and services across all Iraqi governorates."
  },
  {
    ar: "دليل الأعمال العراقي الذي يربطك بما تحتاجه، متى ما احتجت إليه.",
    ku: "ڕێبەری کارە عێراقییەکان کە پەیوەندیت پێوە دەکات بەوەی پێویستتە، هەر کاتێک پێویستت بوو.",
    en: "The Iraqi business directory that connects you with what you need, whenever you need it."
  }
];

export default function HeroSection({ businesses, onBusinessClick, searchQuery, setSearchQuery }: HeroSectionProps) {
  const [currentSlogan, setCurrentSlogan] = useState(0);
  const { language } = useHomeStore();
  const { profile } = useAuthStore();

  const isRTL = language === 'ar' || language === 'ku';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlogan((prev) => (prev + 1) % SLOGANS.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="w-full px-4 mb-8">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden bg-bg-dark rounded-[40px] shadow-2xl border border-white/5">
          {/* Background Elements */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop" 
              alt="Iraq Business"
              className="w-full h-full object-cover opacity-30 scale-105 blur-[1px]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-bg-dark/95 via-bg-dark/70 to-bg-dark/90" />
            
            {/* Animated Glows */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-pulse delay-1000" />
          </div>
 
          <div className="relative z-10 p-8 sm:p-20 flex flex-col items-center text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 px-4 py-1.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
              <span className="text-[9px] sm:text-[11px] font-black text-white/90 uppercase tracking-[0.2em]">
                {language === 'ar' ? 'دليل العراق الموثوق' : language === 'ku' ? 'ڕێبەری باوەڕپێکراوی عێراق' : 'Iraq\'s Trusted Directory'}
              </span>
            </motion.div>
 
            {/* Slogans with Animation */}
            <div className="min-h-[140px] sm:min-h-[220px] flex flex-col items-center justify-center w-full mb-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlogan}
                  initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center gap-4 sm:gap-8"
                >
                  <h1 className="text-xl sm:text-5xl font-black text-white tracking-tight poppins-bold leading-[1.1] uppercase text-center max-w-4xl">
                    {SLOGANS[currentSlogan][language]}
                  </h1>
                  <p className="text-sm sm:text-xl font-medium text-white/60 max-w-2xl leading-relaxed">
                    {language === 'ar' 
                      ? 'المنصة الأولى في العراق لاكتشاف الأماكن والخدمات والتواصل مع أصحاب الأعمال مباشرة.'
                      : language === 'ku'
                      ? 'یەکەم پلاتفۆرم لە عێراق بۆ دۆزینەوەی شوێن و خزمەتگوزارییەکان و پەیوەندیکردن لەگەڵ خاوەنکارەکان بە شێوەیەکی ڕاستەوخۆ.'
                      : 'The premier platform in Iraq to discover places, services, and connect with business owners directly.'}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Owner CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-4 flex flex-col items-center gap-4"
            >
              <div className="h-px w-12 bg-white/10" />
              <Link 
                to="/dashboard"
                className="group flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">
                    {language === 'ar' ? 'هل تملك عملاً تجارياً؟' : language === 'ku' ? 'خاوەنی کارێکی؟' : 'Own a business?'}
                  </p>
                  <p className="text-[9px] font-bold text-accent uppercase tracking-wider leading-none">
                    {language === 'ar' ? 'انضم إلينا الآن وانشر تحديثاتك' : language === 'ku' ? 'ئێستا پەیوەندیمان پێوە بکە' : 'Join us & post updates'}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-white/40 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
