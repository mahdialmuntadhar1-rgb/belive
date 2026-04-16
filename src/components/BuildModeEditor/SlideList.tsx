/**
 * // ADMIN MODE ONLY
 * Modular Slide List component for Build Mode.
 */

import React from 'react';
import { Plus } from 'lucide-react';
import { useAdminDB } from '@/hooks/useAdminDB';
import HeroSlideEditor from './HeroSlideEditor';
import { canAccessBuildMode } from '@/lib/buildModeAccess';

export default function SlideList() {
  if (!canAccessBuildMode()) return null;

  const { heroSlides, addHeroSlide } = useAdminDB();

  const handleAddSlide = () => {
    addHeroSlide({
      image_url: 'https://picsum.photos/seed/new/1200/600',
      is_active: true
    });
  };

  return (
    <div className="space-y-6 pt-4">
      {heroSlides.map((slide, index) => (
        <div key={slide.id}>
          <HeroSlideEditor 
            slide={slide} 
            index={index} 
            total={heroSlides.length} 
          />
        </div>
      ))}
      <button 
        onClick={handleAddSlide}
        className="w-full py-4 border-2 border-dashed border-slate-200 rounded-[24px] text-slate-400 font-black uppercase tracking-widest text-[10px] hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add New Slide
      </button>
    </div>
  );
}

