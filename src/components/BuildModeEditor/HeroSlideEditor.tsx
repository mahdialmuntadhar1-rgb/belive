/**
 * // ADMIN MODE ONLY
 * Modular Hero Slide Editor component for Build Mode.
 */

import React from 'react';
import { Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { AdminHeroSlide } from '@/hooks/useAdminDB';
import { useAdminDB } from '@/hooks/useAdminDB';
import ImageUploader from './ImageUploader';
import { canAccessBuildMode } from '@/lib/buildModeAccess';

interface HeroSlideEditorProps {
  slide: AdminHeroSlide;
  index: number;
  total: number;
}


export default function HeroSlideEditor({ slide, index, total }: HeroSlideEditorProps) {
  if (!canAccessBuildMode()) return null;

  const { updateHeroSlide, deleteHeroSlide, reorderHeroSlide } = useAdminDB();

  return (
    <div 
      className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-4 relative group"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Slide {index + 1}</span>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => reorderHeroSlide(slide.id, 'up')} 
            disabled={index === 0} 
            className="p-1.5 hover:bg-white rounded-lg text-slate-400 disabled:opacity-20 transition-colors"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => reorderHeroSlide(slide.id, 'down')} 
            disabled={index === total - 1} 
            className="p-1.5 hover:bg-white rounded-lg text-slate-400 disabled:opacity-20 transition-colors"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => deleteHeroSlide(slide.id)} 
            className="p-1.5 hover:bg-white rounded-lg text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <ImageUploader 
          value={slide.image_url} 
          onChange={(url) => updateHeroSlide(slide.id, { image_url: url })} 
          onUrlChange={(url) => updateHeroSlide(slide.id, { image_url: url })}
          folder="hero"
        />
      </div>
    </div>
  );
}

