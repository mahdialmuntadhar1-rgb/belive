import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Sparkles, TrendingUp, Users, ShieldCheck, LayoutDashboard, ArrowRight, Download, Briefcase, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import { useAuthStore } from '@/stores/authStore';
import { heroService, HeroSlide as DbHeroSlide } from '@/lib/heroService';
import { useBuildMode } from '@/hooks/useBuildMode';

interface HeroSectionProps {
  businesses: Business[];
  onBusinessClick?: (business: Business) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function HeroSection({ businesses, onBusinessClick, searchQuery, setSearchQuery }: HeroSectionProps) {
  const { language } = useHomeStore();
  const { profile } = useAuthStore();
  const { buildModeEnabled, heroSlides: playgroundSlides, activeSlideId } = useBuildMode();
  const [dbSlides, setDbSlides] = useState<DbHeroSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const isRTL = language === 'ar' || language === 'ku';

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const data = await heroService.getActiveSlides();
        setDbSlides(data);
      } catch (error) {
        console.error('Error fetching hero slides:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSlides();
  }, []);

  // Use playground slides if build mode is enabled, otherwise use DB slides (or fallback)
  const slidesToUse = buildModeEnabled && playgroundSlides.length > 0
    ? playgroundSlides.map(s => ({
        id: s.id,
        title: s.title,
        subtitle: s.subtitle,
        ctaText: s.buttonText,
        ctaLink: s.buttonLink,
        image: s.image
      }))
    : dbSlides.length > 0 
      ? dbSlides.map(s => ({
          id: s.id,
          title: language === 'ar' ? s.title_ar : language === 'ku' ? s.title_ku : s.title_en,
          subtitle: language === 'ar' ? s.subtitle_ar : language === 'ku' ? s.subtitle_ku : s.subtitle_en,
          ctaText: language === 'ar' ? s.cta_text_ar : language === 'ku' ? s.cta_text_ku : s.cta_text_en,
          ctaLink: s.cta_link,
          image: s.image_url
        }))
      : playgroundSlides.map(s => ({
          id: s.id,
          title: s.title,
          subtitle: s.subtitle,
          ctaText: s.buttonText,
          ctaLink: s.buttonLink,
          image: s.image
        }));

  // Sync currentIndex with activeSlideId in Build Mode
  useEffect(() => {
    if (buildModeEnabled && activeSlideId) {
      const index = slidesToUse.findIndex(s => s.id === activeSlideId);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [activeSlideId, buildModeEnabled, slidesToUse.length]);

  useEffect(() => {
    if (slidesToUse.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slidesToUse.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slidesToUse.length]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % slidesToUse.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + slidesToUse.length) % slidesToUse.length);

  if (loading && dbSlides.length === 0 && playgroundSlides.length === 0) {
    return (
      <div className="w-full px-4 mb-12 sm:mb-20">
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden bg-slate-100 rounded-[48px] min-h-[450px] sm:min-h-[550px] flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary/20" />
          </div>
        </div>
      </div>
    );
  }

  // Fallback if no slides
  if (slidesToUse.length === 0) {
    return null;
  }

  const currentSlide = slidesToUse[currentIndex];
  
  const title = currentSlide.title;
  const subtitle = currentSlide.subtitle;
  const ctaText = currentSlide.ctaText;

  return (
    <div className="w-full px-4 mb-12 sm:mb-20">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden bg-slate-900 rounded-[48px] shadow-2xl border border-white/10 aspect-square sm:aspect-[16/9] lg:aspect-[21/9] flex items-end group">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentSlide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 z-0"
            >
              <motion.img 
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 10 }}
                src={currentSlide.image} 
                alt={title as string}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {/* Subtle gradient for text readability - only at the bottom/side */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent ${isRTL ? 'sm:bg-gradient-to-l' : 'sm:bg-gradient-to-r'} sm:from-black/60 sm:via-black/20 sm:to-transparent`} />
            </motion.div>
          </AnimatePresence>

          <div className={`relative z-10 w-full p-6 sm:p-16 lg:p-24 flex flex-col ${isRTL ? 'items-end text-right' : 'items-start text-left'}`}>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 sm:mb-8 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-2 shadow-lg"
            >
              <div className="w-2 h-2 rounded-full bg-[#C8A96A] shadow-[0_0_10px_rgba(200,169,106,0.8)] animate-pulse" />
              <span className="text-[8px] sm:text-[10px] font-black text-white uppercase tracking-[0.2em]">
                {language === 'ar' ? 'شكو ماكو - دليلك في العراق' : language === 'ku' ? 'ڕێبەری باوەڕپێکراوی عێراق' : 'Shaku Maku - Your Guide in Iraq'}
              </span>
            </motion.div>
 
            {/* Main Content */}
            <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-10 max-w-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`content-${currentSlide.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight poppins-bold leading-[1.1] uppercase drop-shadow-lg mb-3 sm:mb-4">
                    {title as string}
                  </h1>
                  <p className="text-sm sm:text-lg lg:text-xl font-medium text-white/90 leading-relaxed max-w-lg drop-shadow-md">
                    {subtitle as string}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Action Area */}
            {currentSlide.cta_link && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Link 
                  to={currentSlide.cta_link}
                  className="group flex items-center gap-3 sm:gap-4 px-6 py-3 sm:px-8 sm:py-4 bg-[#C8A96A] text-[#0F7B6C] rounded-2xl transition-all duration-500 shadow-xl hover:scale-105 hover:bg-white active:scale-95"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#0F7B6C]/10 flex items-center justify-center group-hover:bg-[#0F7B6C]/20 transition-colors">
                    <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider">
                    {ctaText as string || (language === 'ar' ? 'اكتشف المزيد' : language === 'ku' ? 'زیاتر بدۆزەرەوە' : 'Discover More')}
                  </span>
                  <ArrowRight className={`w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
                </Link>
              </motion.div>
            )}
          </div>

          {/* Navigation Controls */}
          {slidesToUse.length > 1 && (
            <>
              <div className={`absolute bottom-6 sm:bottom-10 ${isRTL ? 'left-6 sm:left-10' : 'right-6 sm:right-10'} flex items-center gap-2 sm:gap-4 z-20`}>
                <button 
                  onClick={prevSlide}
                  className="p-2 sm:p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl text-white hover:bg-white hover:text-[#0F7B6C] transition-all shadow-xl"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                </button>
                <button 
                  onClick={nextSlide}
                  className="p-2 sm:p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl sm:rounded-2xl text-white hover:bg-white hover:text-[#0F7B6C] transition-all shadow-xl"
                >
                  <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Indicators */}
              <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 z-20">
                {slidesToUse.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1 sm:h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-6 sm:w-10 bg-[#C8A96A]' : 'w-1.5 sm:w-2 bg-white/30 hover:bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
