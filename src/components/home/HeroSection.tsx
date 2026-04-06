import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MapPin, Sparkles, TrendingUp, Users, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import { useAuthStore } from '@/stores/authStore';

interface HeroSectionProps {
  businesses: Business[];
  onBusinessClick?: (business: Business) => void;
}

const SLOGANS = [
  {
    en: "Discover Iraq's hidden gems",
    ar: "اكتشف جواهر العراق الخفية",
    ku: "گەوهەرە شاراوەکانی عێراق بدۆزەرەوە"
  },
  {
    en: "Grow your business with us",
    ar: "نمِّ عملك التجاري معنا",
    ku: "کارەکەت لەگەڵ ئێمە گەشە پێ بدە"
  },
  {
    en: "Verified reviews you can trust",
    ar: "مراجعات موثوقة يمكنك الاعتماد عليها",
    ku: "پێداچوونەوەی ڕاست و باوەڕپێکراو"
  }
];

export default function HeroSection({ businesses, onBusinessClick }: HeroSectionProps) {
  const featured = businesses.filter(b => b.isFeatured).slice(0, 5);
  const [currentSlogan, setCurrentSlogan] = React.useState(0);
  const { language } = useHomeStore();
  const { profile } = useAuthStore();

  const branding = {
    en: "Saku Maku",
    ar: "شکو ماكو؟",
    ku: "چی هەیە؟" // Sorani Kurdish equivalent of "Shaku Maku"
  };

  const translations = {
    dashboard: {
      en: "Business Dashboard",
      ar: "لوحة تحكم الأعمال",
      ku: "داشبۆردی بازرگانی"
    }
  };

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlogan((prev) => (prev + 1) % SLOGANS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <section className="w-full mb-8">
      {/* Immersive Hero - Rectangle */}
      <div className="relative w-full h-[280px] sm:h-[400px] bg-bg-dark overflow-hidden flex flex-col items-center justify-center text-center px-6 sm:px-12 border-b border-white/10">
        
        {/* Background Image with Dynamic Overlay */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1920&auto=format&fit=crop" 
            alt="Iraq Business"
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg-dark/80 via-bg-dark/20 to-bg-dark" />
        </div>

        <div className="relative z-10 flex flex-col items-center w-full max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 px-3 py-1 glass rounded-full border border-white/10 flex items-center gap-2"
          >
            <div className="flex -space-x-1.5">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-5 h-5 rounded-full border border-bg-dark bg-slate-200 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt="" />
                </div>
              ))}
            </div>
            <span className="text-[8px] font-black text-white uppercase tracking-widest">
              {language === 'ar' ? '١٠ آلاف مستخدم' : language === 'ku' ? '١٠ هەزار بەکارهێنەر' : '10k+ active users'}
            </span>
          </motion.div>

          <div className="h-24 flex flex-col items-center justify-center w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlogan}
                initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col items-center"
              >
                <h2 className="text-3xl sm:text-6xl font-black text-white tracking-tighter poppins-bold leading-[1.1] drop-shadow-xl max-w-[280px] sm:max-w-none">
                  {SLOGANS[currentSlogan][language]}
                </h2>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
