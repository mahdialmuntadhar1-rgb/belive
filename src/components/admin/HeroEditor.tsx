import React, { useState } from 'react';
import { Loader2, Upload, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useHomeStore } from '@/stores/homeStore';

// Minimal inline hero editor - for admin use only
// Only allows image replacement via Supabase Storage

interface HeroSlide {
  id: string;
  image_url: string;
  sort_order?: number;
}

interface HeroEditorProps {
  slides: HeroSlide[];
  onUpdate: (slides: HeroSlide[]) => void;
}

export default function HeroEditor({ slides, onUpdate }: HeroEditorProps) {
  const { language } = useHomeStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slideId: string) => {
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
        .eq('id', slideId);

      if (updateError) throw updateError;

      const updated = slides.map(s =>
        s.id === slideId ? { ...s, image_url: publicUrl } : s
      );
      onUpdate(updated);
    } catch (err) {
      console.error('Failed to upload hero image:', err);
      setError('Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}
      <h3 className="text-lg font-bold">Hero Slides ({slides.length})</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
          >
            <img
              src={slide.image_url}
              alt="Slide"
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">Slide {slide.sort_order || 0}</p>
            </div>
            <label className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded text-sm font-bold hover:bg-blue-600 cursor-pointer">
              <Upload className="w-4 h-4" />
              Replace
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, slide.id)}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
