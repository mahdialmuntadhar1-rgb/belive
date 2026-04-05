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
    <section className="w-full max-w-7xl mx-auto px-4 mb-12">
      {/* Thinner Rounded Rectangle Hero */}
      <div className="relative w-full h-[320px] sm:h-[450px] bg-bg-dark rounded-[40px] overflow-hidden flex flex-col items-center justify-center text-center px-8 sm:px-12 shadow-2xl border border-white/5">
        
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1920&auto=format&fit=crop" 
            alt="Iraq Business"
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg-dark/80 via-bg-dark/60 to-bg-dark" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent" />
        </div>

        {/* Background Pattern/Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(0,191,165,0.12),transparent_70%)]" />
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary rounded-full blur-[120px] opacity-20" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary rounded-full blur-[120px] opacity-15" />
          
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        {/* Top Left Branding */}
        <div className="absolute top-10 left-10 sm:left-14">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-3xl sm:text-4xl font-black text-white poppins-bold">
              {language === 'en' ? branding.ar : branding[language]}
            </span>
          </motion.div>
        </div>

        {/* Top Right Branding & Dashboard Link */}
        <div className="absolute top-10 right-10 sm:right-14 flex flex-col items-end gap-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col items-end"
          >
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tighter poppins-bold">
              {language === 'en' ? branding.en : branding.en}
            </h1>
          </motion.div>

          {profile?.role === 'business_owner' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to="/dashboard"
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-xl shadow-primary/20 border border-white/10 hover:bg-primary-dark transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                {translations.dashboard[language]}
              </Link>
            </motion.div>
          )}
        </div>

        <div className="relative z-10 flex flex-col items-center w-full max-w-4xl">
          <div className="h-48 flex flex-col items-center justify-center w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlogan}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center gap-4 sm:gap-6"
              >
                <p className="text-4xl sm:text-6xl font-black text-white tracking-tight poppins-bold leading-tight">
                  {SLOGANS[currentSlogan][language]}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Decorative Corner Accents */}
        <div className="absolute top-8 left-8 w-4 h-4 border-t-2 border-l-2 border-white/10 rounded-tl-lg" />
        <div className="absolute top-8 right-8 w-4 h-4 border-t-2 border-r-2 border-white/10 rounded-tr-lg" />
        <div className="absolute bottom-8 left-8 w-4 h-4 border-b-2 border-l-2 border-white/10 rounded-bl-lg" />
        <div className="absolute bottom-8 right-8 w-4 h-4 border-b-2 border-r-2 border-white/10 rounded-br-lg" />
      </div>
    </section>
  );
}
