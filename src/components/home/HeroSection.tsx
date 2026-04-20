import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Sparkles, TrendingUp, Users, ShieldCheck, LayoutDashboard, ArrowRight, Download, Briefcase, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import { useBuildMode } from '@/hooks/useBuildMode';
import { heroContent } from '@/data/heroContent';
import { heroService, HeroSlide } from '@/lib/heroService';
import { supabase } from '@/lib/supabaseClient';

interface HeroSectionProps {
  businesses: Business[];
  onBusinessClick?: (business: Business) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  heroSlides?: HeroSlide[];
  currentHeroIndex?: number;
  onPrevHero?: () => void;
  onNextHero?: () => void;
  onHeroSlidesUpdate?: (slides: HeroSlide[]) => void;
}

export default function HeroSection({
  businesses,
  onBusinessClick,
  searchQuery,
  setSearchQuery,
  heroSlides: propHeroSlides = [],
  currentHeroIndex = 0,
  onPrevHero,
  onNextHero,
  onHeroSlidesUpdate
}: HeroSectionProps) {
  const { language } = useHomeStore();
  const { isBuildModeEnabled } = useBuildMode();
  const content = heroContent[language] || heroContent['ar'];
  const isRTL = language === 'ar' || language === 'ku';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Use prop hero slides if provided, otherwise use local state
  const heroSlides = propHeroSlides.length > 0 ? propHeroSlides : [];
  const currentSlideIndex = propHeroSlides.length > 0 ? currentHeroIndex : 0;
  const hasSlides = heroSlides && heroSlides.length > 0;
  const currentSlide = hasSlides ? heroSlides[currentSlideIndex] : null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentSlide) return;

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
      if (onHeroSlidesUpdate) {
        onHeroSlidesUpdate(updated);
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to upload hero image:', err);
      alert('Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <div className="w-full px-4 mb-12 sm:mb-20">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-[48px] aspect-square">
          {/* Database hero slides if available */}
          {hasSlides && currentSlide ? (
            <>
              <motion.img
                key={currentSlide.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                src={currentSlide.image_url}
                alt="Hero slide"
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {/* Slide navigation */}
              {heroSlides.length > 1 && (
                <>
                  <button
                    onClick={onPrevHero}
                    className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/90 hover:bg-white rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={onNextHero}
                    className="absolute right-6 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/90 hover:bg-white rounded-full transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
              {/* Edit overlay (owner only) */}
              {isBuildModeEnabled && isEditing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
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
              {/* Edit button when build mode is enabled */}
              {isBuildModeEnabled && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute top-4 right-4 z-20 px-4 py-2 bg-white/90 backdrop-blur-md rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-all shadow-lg"
                >
                  <Loader2 className="w-4 h-4" />
                  Edit Hero
                </button>
              )}
              {/* Search overlay */}
              <div
                className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center p-8 sm:p-16 group"
              >
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <input
                    type="text"
                    placeholder={content.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-6 py-4 rounded-full bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button className="px-8 py-4 bg-[#C8A96A] text-[#0F7B6C] rounded-full font-black hover:bg-[#b89a5a] transition-colors">
                    {content.searchButton}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Fallback to static content */
            <div className="relative overflow-hidden rounded-[48px] aspect-square bg-gradient-to-br from-[#0F7B6C] to-[#0d6857]">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 sm:p-16">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-6 poppins-bold tracking-tighter">
                  {content.title}
                </h1>
                <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl">
                  {content.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <input
                    type="text"
                    placeholder={content.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-6 py-4 rounded-full bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button className="px-8 py-4 bg-[#C8A96A] text-[#0F7B6C] rounded-full font-black hover:bg-[#b89a5a] transition-colors">
                    {content.searchButton}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
