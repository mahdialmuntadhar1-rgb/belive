import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '@/lib/supabaseClient';

interface LiveSlide {
  id: string;
  image_url: string;
}

export default function HeroSection() {
  const [slides, setSlides] = useState<LiveSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSlides() {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('id, image_url')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (!error && data) {
        setSlides(data);
      }
      setLoading(false);
    }
    loadSlides();
  }, []);

  const nextSlide = () => {
    if (slides.length <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    if (slides.length <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (loading) {
    return (
      <div className="w-full px-4 mb-12 sm:mb-20">
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-[48px] aspect-video bg-slate-100/50 animate-pulse flex items-center justify-center">
          </div>
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
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

  const currentSlide = slides[currentIndex];
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
        <div className="relative overflow-hidden rounded-[48px] aspect-square lg:aspect-[21/9]">
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
            </motion.div>
          </AnimatePresence>
          
          {slides.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDirection(idx > currentIndex ? 1 : -1);
                    setCurrentIndex(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
