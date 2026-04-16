import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Sparkles, TrendingUp, Users, ShieldCheck, LayoutDashboard, ArrowRight, Download, Briefcase, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import { useAdminDB, HeroSlide } from '@/hooks/useAdminDB';

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

  // Fetch hero slides from Supabase on mount
  useEffect(() => {
    const loadHeroSlides = async () => {
      try {
        const slides = await fetchHeroSlides();
        setHeroSlides(slides);
      } catch (err) {
        console.error('Failed to load hero slides:', err);
      }
    };
    loadHeroSlides();
  }, [fetchHeroSlides]);

  const slidesToUse = heroSlides;

  const [direction, setDirection] = useState(0);

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slidesToUse.length);
  };

  const prevSlide = () => {
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
  if (slidesToUse.length === 0) {
    return null;
  }

  const currentSlide = slidesToUse[currentIndex];

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
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
