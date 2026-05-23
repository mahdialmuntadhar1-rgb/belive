import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Upload, Loader2, Save, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { useBuildMode } from '@/hooks/useBuildMode';

export default function HeroEditor() {
  const { 
    heroSlides: slides, 
    updateSlide, 
    deleteSlide, 
    reorderSlides, 
    addSlide, 
    saveToRepo, 
    isSaving 
  } = useBuildMode();
  const [loading, setLoading] = useState(false);

  const handleUpload = async (index: number, file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'hero');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      const slideId = slides[index].id || String(index);
      updateSlide(slideId, { image: `${data.path}?t=${Date.now()}` });
      toast.success('Image replaced');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await saveToRepo(false);
      toast.success('Hero saved successfully');
    } catch (err) {
      toast.error('Save failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-slate-900">HERO SLIDER</h3>
        <Button size="sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="space-y-4">
        {slides.map((slide, i) => (
          <div key={slide.id || i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="aspect-video rounded-xl overflow-hidden bg-slate-200 relative group">
              <img src={slide.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Upload className="text-white h-8 w-8" />
                <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(i, e.target.files[0])} />
              </label>
            </div>
            <div className="flex gap-2">
              <Button size="icon-sm" variant="outline" onClick={() => reorderSlides(slide.id, 'up')} disabled={i === 0}>
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button size="icon-sm" variant="outline" onClick={() => reorderSlides(slide.id, 'down')} disabled={i === slides.length - 1}>
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button size="icon-sm" variant="destructive" className="ml-auto" onClick={() => deleteSlide(slide.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        <Button 
          variant="outline" 
          className="w-full border-dashed py-8 rounded-2xl"
          onClick={() => addSlide({ id: crypto.randomUUID(), image: 'https://picsum.photos/seed/new/1920/1080', title: 'New Slide' })}
        >
          Add New Slide
        </Button>
      </div>
    </div>
  );
}
