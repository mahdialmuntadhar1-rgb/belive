import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pencil, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { HeroSlide } from '@/hooks/useAdminDB';
import { useBuildMode } from '@/hooks/useBuildMode';
import { useHomeStore } from '@/stores/homeStore';
import { supabase } from '@/lib/supabaseClient';

interface EditableHeroSectionProps {
  heroSlides: HeroSlide[];
  currentIndex: number;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onSlidesUpdate: (slides: HeroSlide[]) => void;
}

export default function EditableHeroSection({
  heroSlides,
  currentIndex,
  onPrevSlide,
  onNextSlide,
  onSlidesUpdate
}: EditableHeroSectionProps) {
  const { isBuildModeEnabled } = useBuildMode();
  const { language } = useHomeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [direction, setDirection] = useState(0);

  if (heroSlides.length === 0) return null;

  const currentSlide = heroSlides[currentIndex];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const timestamp = Date.now();
      const fileName = `hero-${timestamp}`;

      const { error } = await supabase.storage
        .from('hero-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('hero-images')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('hero_slides')
        .update({ image_url: publicUrl })
        .eq('id', currentSlide.id);

      if (updateError) throw updateError;

      const updated = heroSlides.map(s =>
        s.id === currentSlide.id ? { ...s, image_url: publicUrl } : s
      );
      onSlidesUpdate(updated);
    } catch (err) {
      alert('Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full px-4 mb-12 sm:mb-20">
      <div className="max-w-6xl mx-auto">
        <div
          className="relative overflow-hidden rounded-[48px] aspect-square group"
          onMouseEnter={() => isBuildModeEnabled && setIsEditing(true)}
          onMouseLeave={() => isBuildModeEnabled && setIsEditing(false)}
        >
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentSlide.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.5 }
              }}
              className="absolute inset-0"
            >
              <img
                src={currentSlide.image_url}
                alt="Hero"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </AnimatePresence>

          {isBuildModeEnabled && isEditing && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-6 py-4 bg-white text-[#0F7B6C] font-black rounded-2xl shadow-xl"
              >
                {isUploading ? 'Uploading...' : 'Edit Image'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          )}

          {heroSlides.length > 1 && (
            <>
              <button
                onClick={() => {
                  setDirection(-1);
                  onPrevSlide();
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/90 rounded-full"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => {
                  setDirection(1);
                  onNextSlide();
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/90 rounded-full"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
