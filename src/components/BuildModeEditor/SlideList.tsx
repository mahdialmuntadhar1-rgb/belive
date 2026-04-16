/**
 * // BUILD MODE ONLY
 * Modular Slide List component for Build Mode.
 */

import React from 'react';
import { Plus } from 'lucide-react';
import { useBuildMode } from '@/hooks/useBuildMode';
import HeroSlideEditor from './HeroSlideEditor';
import { useLocation } from 'react-router-dom';
import { canAccessBuildMode } from '@/lib/buildModeAccess';

export default function SlideList() {
  const location = useLocation();
  if (!canAccessBuildMode(location.search)) return null;

  const { heroSlides, addSlide } = useBuildMode();

  const handleAddSlide = () => {
    addSlide({
      id: Math.random().toString(36).substr(2, 9),
      image: 'https://picsum.photos/seed/new/1200/600'
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
