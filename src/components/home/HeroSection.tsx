import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Sparkles, TrendingUp, Users, ShieldCheck, LayoutDashboard, ArrowRight, Download, Briefcase, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import { useBuildMode } from '@/hooks/useBuildMode';
import { heroContent } from '@/data/heroContent';
import { Upload } from 'lucide-react';

interface HeroSectionProps {
  businesses: Business[];
  onBusinessClick?: (business: Business) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function HeroSection({ businesses, onBusinessClick, searchQuery, setSearchQuery }: HeroSectionProps) {
  const { language } = useHomeStore();
  const { fetchHeroSlides, loading } = useAdminDB();
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isRTL = language === 'ar' || language === 'ku';

  // Single Source of Truth: Use playground slides in Build Mode, otherwise use heroContent.ts
  // Ensure we fallback to heroContent if playground is empty or build mode is disabled
  const slidesToUse = useMemo(() => {
    if (buildModeEnabled && playgroundSlides && playgroundSlides.length > 0) {
      return playgroundSlides;
    }
    return heroContent && heroContent.length > 0 ? heroContent : [];
  }, [buildModeEnabled, playgroundSlides]);

  // Sync currentIndex with activeSlideId in Build Mode
  useEffect(() => {
    if (buildModeEnabled && activeSlideId && slidesToUse.length > 0) {
      const index = slidesToUse.findIndex(s => s.id === activeSlideId);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [activeSlideId, buildModeEnabled, slidesToUse]);

  const [direction, setDirection] = useState(0);

  const nextSlide = () => {
    if (slidesToUse.length === 0) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slidesToUse.length);
  };

  const prevSlide = () => {
    if (slidesToUse.length === 0) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slidesToUse.length) % slidesToUse.length);
  };

  useEffect(() => {
    if (slidesToUse.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [slidesToUse.length]);

  // Fallback if no slides
  if (!slidesToUse || slidesToUse.length === 0) {
    return (
      <div className="w-full px-4 mb-12 sm:mb-20">
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-[48px] aspect-video bg-slate-100 flex items-center justify-center">
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No Hero Content Available</p>
          </div>
        </div>
      </div>
    );
  }

  const currentSlide = slidesToUse[currentIndex] || slidesToUse[0];
  if (!currentSlide) return null;

  const { updateSlide } = useBuildMode();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      updateSlide(currentSlide.id, { image: base64 });
    };
    reader.readAsDataURL(file);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  // Get localized content
  const getTitle = (slide: HeroSlide) => {
    if (language === 'ar') return slide.title_ar || slide.title_en || '';
    if (language === 'ku') return slide.title_ku || slide.title_en || '';
    return slide.title_en || '';
  };

  const getSubtitle = (slide: HeroSlide) => {
    if (language === 'ar') return slide.subtitle_ar || slide.subtitle_en || '';
    if (language === 'ku') return slide.subtitle_ku || slide.subtitle_en || '';
    return slide.subtitle_en || '';
  };

  const getCTAText = (slide: HeroSlide) => {
    if (language === 'ar') return slide.cta_text_ar || slide.cta_text_en || '';
    if (language === 'ku') return slide.cta_text_ku || slide.cta_text_en || '';
    return slide.cta_text_en || '';
  };

  return (
    <div className="w-full px-4 mb-12 sm:mb-20">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-[48px] aspect-square">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div 
              key={currentSlide.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.5 }
              }}
              className="absolute inset-0"
            >
              <img 
                src={currentSlide.image_url} 
                alt="Hero Image"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/belive-fallback/1200/600';
                }}
              />

              {/* Build Mode Overlay Controls */}
              {buildModeEnabled && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <label className="cursor-pointer bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform group">
                    <Upload className="w-5 h-5 text-primary" />
                    <span className="text-xs font-black uppercase tracking-widest text-primary">Replace Background</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
