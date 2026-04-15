import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Sparkles, TrendingUp, Users, ShieldCheck, LayoutDashboard, ArrowRight, Download, Briefcase, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import { useBuildMode } from '@/hooks/useBuildMode';
import { heroContent } from '@/data/heroContent';

interface HeroSectionProps {
  businesses: Business[];
  onBusinessClick?: (business: Business) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function HeroSection({ businesses, onBusinessClick, searchQuery, setSearchQuery }: HeroSectionProps) {
  const { language } = useHomeStore();
  const { buildModeEnabled, heroSlides: playgroundSlides, activeSlideId } = useBuildMode();
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
                src={currentSlide.image} 
                alt="Hero Image"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/belive-fallback/1200/600';
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
