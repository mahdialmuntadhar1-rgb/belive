/**
 * // BUILD MODE ONLY
 * Modular Hero Slide Editor component for Build Mode.
 */

import React from 'react';
import { Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { HeroSlide } from '@/types/buildMode';
import { useBuildMode } from '@/hooks/useBuildMode';
import ImageUploader from './ImageUploader';

interface HeroSlideEditorProps {
  slide: HeroSlide;
  index: number;
  total: number;
}

import { useLocation } from 'react-router-dom';
import { canAccessBuildMode } from '@/lib/buildModeAccess';

export default function HeroSlideEditor({ slide, index, total }: HeroSlideEditorProps) {
  const location = useLocation();
  if (!canAccessBuildMode(location.search)) return null;

  const { updateSlide, deleteSlide, reorderSlides, setActiveSlideId } = useBuildMode();

  const handleFocus = () => {
    setActiveSlideId(slide.id);
  };

  return (
    <div 
      className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-4 relative group"
      onFocus={handleFocus}
      onClick={handleFocus}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Slide {index + 1}</span>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => reorderSlides(slide.id, 'up')} 
            disabled={index === 0} 
            className="p-1.5 hover:bg-white rounded-lg text-slate-400 disabled:opacity-20 transition-colors"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => reorderSlides(slide.id, 'down')} 
            disabled={index === total - 1} 
            className="p-1.5 hover:bg-white rounded-lg text-slate-400 disabled:opacity-20 transition-colors"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => deleteSlide(slide.id)} 
            className="p-1.5 hover:bg-white rounded-lg text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <ImageUploader 
          value={slide.image} 
          onChange={(base64) => updateSlide(slide.id, { image: base64 })} 
          onUrlChange={(url) => updateSlide(slide.id, { image: url })}
        />
      </div>
    </div>
  );
}
