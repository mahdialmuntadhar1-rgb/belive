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
    title: "وين تروح؟",
    subtitle: "محتار وين تروح؟ كل الخيارات صارت بيدك",
    ownerLabel: "هل عملك التجاري مدرج بالفعل؟",
    ownerAction: "طالب بصفحتك الآن وقم بإدارتها",
    badge: "شكو ماكو - دليلك في العراق"
  },
  ku: {
    title: "بۆ کوێ دەچیت؟",
    subtitle: "سەرت لێ شێواوە بۆ کوێ بچیت؟ هەموو بژاردەکان ئێستا لە دەستی تۆدان",
    ownerLabel: "ئایا کارەکەت پێشتر لیست کراوە؟",
    ownerAction: "داوای لاپەڕەکەت بکە و بەڕێوەی ببە",
    badge: "ڕێبەری باوەڕپێکراوی عێراق"
  },
  en: {
    title: "Where to go?",
    subtitle: "Confused where to go? All options are now in your hand.",
    ownerLabel: "Is your business already listed?",
    ownerAction: "Claim your page and manage it now",
    badge: "Shaku Maku - Your Guide in Iraq"
  }
};

export default function HeroSection({ businesses, onBusinessClick, searchQuery, setSearchQuery }: HeroSectionProps) {
  const { language } = useHomeStore();
  const { profile } = useAuthStore();

  const isRTL = language === 'ar' || language === 'ku';
  const content = HERO_CONTENT[language];
  
  return (
    <div className="w-full px-4 mb-12 sm:mb-20">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden bg-[#0F7B6C] rounded-[48px] shadow-2xl border border-white/10 min-h-[450px] sm:min-h-[550px] flex items-center group">
          {/* Background Layers */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <motion.img 
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
              src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=1200&auto=format&fit=crop" 
              alt="Shaku Maku Hero"
              className="w-full h-full object-cover opacity-40"
              referrerPolicy="no-referrer"
            />
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F7B6C] via-[#0F7B6C]/80 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(200,169,106,0.15),transparent_70%)]" />
            
            {/* 3D Floating Elements (Decorative) */}
            <motion.div 
              animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute top-20 right-[10%] w-32 h-32 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl hidden lg:block"
            />
            <motion.div 
              animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute bottom-20 left-[5%] w-24 h-24 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl hidden lg:block"
            />
          </div>
 
          <div className="relative z-10 w-full p-8 sm:p-24 flex flex-col items-center sm:items-start text-center sm:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 px-5 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 flex items-center gap-3 shadow-lg"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-[#C8A96A] shadow-[0_0_15px_rgba(200,169,106,0.8)] animate-pulse" />
              <span className="text-[10px] sm:text-[12px] font-black text-white uppercase tracking-[0.3em]">
                {content.badge}
              </span>
            </motion.div>
 
            {/* Main Content */}
            <div className={`flex flex-col gap-8 mb-16 max-w-3xl ${isRTL ? 'sm:items-end sm:text-right' : 'sm:items-start sm:text-left'}`}>
              <motion.h1 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl sm:text-7xl font-black text-white tracking-tighter poppins-bold leading-[1] uppercase drop-shadow-2xl"
              >
                {content.title}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg sm:text-2xl font-medium text-white/70 leading-relaxed max-w-xl"
              >
                {content.subtitle}
              </motion.p>
            </div>

            {/* Action Area */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center gap-6"
            >
              <Link 
                to="/claim"
                className="group flex items-center gap-5 px-10 py-5 bg-[#C8A96A] text-[#0F7B6C] rounded-[24px] transition-all duration-500 shadow-2xl hover:scale-105 hover:bg-white active:scale-95"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#0F7B6C]/10 flex items-center justify-center group-hover:bg-[#0F7B6C]/20 transition-colors">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1.5 opacity-60">
                    {content.ownerLabel}
                  </p>
                  <p className="text-sm font-black uppercase tracking-wider leading-none">
                    {content.ownerAction}
                  </p>
                </div>
                <ArrowRight className={`w-6 h-6 group-hover:translate-x-2 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
