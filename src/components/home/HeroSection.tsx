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

const HERO_CONTENT = {
  ar: {
    title: "ابحث عن الشركات العراقية الموثوقة في مدينتك",
    subtitle: "تابع أحدث العروض والتحديثات من الشركات المحلية مباشرة.",
    ownerLabel: "هل عملك التجاري مدرج بالفعل؟",
    ownerAction: "طالب بصفحتك الآن وقم بإدارتها",
    badge: "دليل العراق الموثوق"
  },
  ku: {
    title: "کۆمپانیا باوەڕپێکراوەکانی عێراق لە شارەکەت بدۆزەرەوە",
    subtitle: "بەدواداچوون بۆ نوێترین ئۆفەر و نوێکارییەکانی کۆمپانیا ناوخۆییەکان بکە.",
    ownerLabel: "ئایا کارەکەت پێشتر لیست کراوە؟",
    ownerAction: "داوای لاپەڕەکەت بکە و بەڕێوەی ببە",
    badge: "ڕێبەری باوەڕپێکراوی عێراق"
  },
  en: {
    title: "Find Trusted Iraqi Businesses in Your City",
    subtitle: "Follow the latest offers and updates from local businesses directly.",
    ownerLabel: "Is your business already listed?",
    ownerAction: "Claim your page and manage it now",
    badge: "Iraq's Trusted Directory"
  }
};

export default function HeroSection({ businesses, onBusinessClick, searchQuery, setSearchQuery }: HeroSectionProps) {
  const { language } = useHomeStore();
  const { profile } = useAuthStore();

  const isRTL = language === 'ar' || language === 'ku';
  const content = HERO_CONTENT[language];
  
  return (
    <div className="w-full px-4 mb-8">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden bg-primary rounded-[40px] shadow-2xl border border-white/5">
          {/* Background Elements */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop" 
              alt="Iraq Business"
              className="w-full h-full object-cover opacity-10 scale-105 blur-[2px]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/80 to-primary/90" />
            
            {/* Animated Glows */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
          </div>
 
          <div className="relative z-10 p-8 sm:p-20 flex flex-col items-center text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 px-4 py-1.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
              <span className="text-[9px] sm:text-[11px] font-black text-white/90 uppercase tracking-[0.2em]">
                {content.badge}
              </span>
            </motion.div>
 
            {/* Main Content */}
            <div className="flex flex-col items-center gap-6 sm:gap-8 mb-12">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl sm:text-6xl font-black text-white tracking-tight poppins-bold leading-[1.1] uppercase max-w-4xl"
              >
                {content.title}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-sm sm:text-xl font-medium text-white/60 max-w-2xl leading-relaxed"
              >
                {content.subtitle}
              </motion.p>
            </div>

            {/* Owner CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="h-px w-12 bg-white/10" />
              <Link 
                to="/claim"
                className="group flex items-center gap-4 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1.5">
                    {content.ownerLabel}
                  </p>
                  <p className="text-xs sm:text-sm font-black text-accent uppercase tracking-wider leading-none">
                    {content.ownerAction}
                  </p>
                </div>
                <ArrowRight className={`w-5 h-5 text-white/40 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
