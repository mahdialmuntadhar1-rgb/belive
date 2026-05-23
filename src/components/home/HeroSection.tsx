import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, Search, Edit2, Check, X } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';
import { useLocalBuildStore } from '@/stores/localBuildStore';
import { useHeroSlides } from '@/hooks/useHeroSlides';
import { heroService, HeroSlide } from '@/lib/heroService';
import { useHomeStore } from '@/stores/homeStore';
import { Link } from 'react-router-dom';

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function HeroSection({ searchQuery, setSearchQuery }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  const { isBuildMode } = useLocalBuildStore();
  const { language } = useHomeStore();
  const { slides, refresh, loading: slidesLoading } = useHeroSlides();
  const [replacing, setReplacing] = useState<string | null>(null);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editData, setEditData] = useState<Partial<HeroSlide>>({});
  const [saving, setSaving] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const heroSlides = slides.length > 0 
    ? (isBuildMode ? slides : slides.filter(s => s.is_active)) 
    : [];
  
  const isRTL = language === 'ar' || language === 'ku';

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      direction: isRTL ? 'rtl' : 'ltr',
      duration: 30
    }, 
    [
      Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }),
      Fade()
    ]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const handleImageUpload = async (slideId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          setReplacing(slideId);
          const publicUrl = await heroService.uploadImage(file);
          await heroService.updateSlide(slideId, { image_url: publicUrl });
          await refresh();
        } catch (error) {
          console.error(error);
        } finally {
          setReplacing(null);
        }
      }
    };
    input.click();
  };

  const startEditing = (slide: HeroSlide) => {
    setEditData(slide);
    setIsEditingContent(true);
  };

  const handleSaveContent = async () => {
    if (!editData.id) return;
    try {
      setSaving(true);
      await heroService.updateSlide(editData.id, editData);
      await refresh();
      setIsEditingContent(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const getTranslated = (slide: HeroSlide, field: 'title' | 'subtitle' | 'slogan' | 'cta_text') => {
    const key = `${field}_${language}` as keyof HeroSlide;
    const val = slide[key] || slide[`${field}_en` as keyof HeroSlide] || '';
    return val as string;
  };

  return (
    <div className="w-full mb-8 sm:mb-12" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {slidesLoading && heroSlides.length === 0 ? (
          <div className="h-[300px] sm:h-[500px] rounded-[32px] bg-slate-100 flex items-center justify-center animate-pulse">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : heroSlides.length > 0 ? (
          <div className="relative group/hero overflow-hidden rounded-[32px] shadow-2xl">
            {/* Main Carousel */}
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {heroSlides.map((slide, index) => (
                  <div key={slide.id} className="relative flex-[0_0_100%] min-w-0 h-[300px] sm:h-[500px] overflow-hidden">
                    {/* Background Image with Parallax */}
                    <motion.img
                      style={{ y }}
                      src={slide.image_url}
                      alt={getTranslated(slide, 'title')}
                      className="absolute inset-0 w-full h-[120%] object-cover"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30 z-10" />
                    
                    {/* Content Overlay */}
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 sm:px-12">
                      <AnimatePresence mode="wait">
                        {selectedIndex === index && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="max-w-4xl"
                          >
                            {/* Slogan */}
                            <motion.span 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                              className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white/80 font-bold text-[10px] uppercase tracking-[0.3em] mb-6 border border-white/10"
                            >
                              {getTranslated(slide, 'slogan')}
                            </motion.span>
                            
                            {/* Title */}
                            <h1 className="text-3xl sm:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tight uppercase drop-shadow-2xl">
                              {getTranslated(slide, 'title')}
                            </h1>
                            
                            {/* Subtitle */}
                            <p className="text-sm sm:text-xl text-slate-300 mb-10 font-medium max-w-2xl mx-auto leading-relaxed">
                              {getTranslated(slide, 'subtitle')}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                              {/* Search Bar - Center aligned */}
                              <div className="relative group/search w-full max-w-md">
                                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-white/40 group-focus-within/search:text-primary transition-colors">
                                  <Search className="w-5 h-5" />
                                </div>
                                <input
                                  type="text"
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                                  placeholder={language === 'ar' ? 'ابحث هنا...' : 'Search here...'}
                                  className="w-full bg-white/10 backdrop-blur-3xl border border-white/20 rounded-full py-4 pl-14 pr-6 text-sm text-white placeholder:text-white/40 focus:ring-4 focus:ring-primary/20 focus:bg-white focus:text-slate-900 focus:placeholder:text-slate-400 outline-none transition-all"
                                />
                              </div>

                              {/* CTA Button */}
                              {(slide.cta_text_en || slide.cta_text_ar || slide.cta_text_ku) && (
                                <Link
                                  to={slide.cta_link || '/explore'}
                                  className="px-10 py-4 border-2 border-white text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all active:scale-95 whitespace-nowrap"
                                >
                                  {getTranslated(slide, 'cta_text')}
                                </Link>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Multi-action Build Mode Buttons (Repositioned to bottom right as per prompt) */}
                    {isBuildMode && (
                      <div className="absolute bottom-6 right-6 z-40 flex flex-col gap-2">
                        <button
                          onClick={() => startEditing(slide)}
                          className="w-10 h-10 bg-white/90 backdrop-blur-md text-primary rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-90 transition-all border border-slate-200"
                          title="Edit Metadata"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          disabled={replacing === slide.id}
                          onClick={() => handleImageUpload(slide.id)}
                          className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-90 transition-all disabled:opacity-50"
                          title="Replace Image"
                        >
                          {replacing === slide.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            {heroSlides.length > 1 && (
              <>
                <button 
                  onClick={scrollPrev}
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white text-white hover:text-primary backdrop-blur-md rounded-full flex items-center justify-center transition-all z-30 border border-white/20 opacity-0 group-hover/hero:opacity-100"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={scrollNext}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white text-white hover:text-primary backdrop-blur-md rounded-full flex items-center justify-center transition-all z-30 border border-white/20 opacity-0 group-hover/hero:opacity-100"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
                  {heroSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => scrollTo(idx)}
                      className="group py-2"
                    >
                      <div className={`h-1.5 rounded-full transition-all duration-300 ${idx === selectedIndex ? 'w-10 bg-primary' : 'w-2 bg-white/40 hover:bg-white/60'}`} />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>

      {/* Legacy Edit Modal */}
      {isBuildMode && isEditingContent && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[32px] p-8 max-w-4xl w-full text-slate-900 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black uppercase tracking-tight">Edit Slide Content</h3>
              <button onClick={() => setIsEditingContent(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Multilingual inputs preserved */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-slate-400">English</h4>
                <input className="w-full p-4 bg-slate-100 rounded-xl font-bold text-xs" value={editData.title_en || ''} onChange={e => setEditData({...editData, title_en: e.target.value})} />
                <textarea className="w-full p-4 bg-slate-100 rounded-xl font-medium h-24 text-xs" value={editData.subtitle_en || ''} onChange={e => setEditData({...editData, subtitle_en: e.target.value})} />
                <input className="w-full p-4 bg-slate-100 rounded-xl font-bold text-xs" placeholder="Slogan" value={editData.slogan_en || ''} onChange={e => setEditData({...editData, slogan_en: e.target.value})} />
              </div>
              <div className="space-y-4" dir="rtl">
                <h4 className="text-[10px] font-black uppercase text-slate-400" dir="ltr">Arabic</h4>
                <input className="w-full p-4 bg-slate-100 rounded-xl font-bold font-arabic text-xs" value={editData.title_ar || ''} onChange={e => setEditData({...editData, title_ar: e.target.value})} />
                <textarea className="w-full p-4 bg-slate-100 rounded-xl font-medium font-arabic h-24 text-xs" value={editData.subtitle_ar || ''} onChange={e => setEditData({...editData, subtitle_ar: e.target.value})} />
              </div>
              <div className="space-y-4" dir="rtl">
                <h4 className="text-[10px] font-black uppercase text-slate-400" dir="ltr">Kurdish</h4>
                <input className="w-full p-4 bg-slate-100 rounded-xl font-bold font-arabic text-xs" value={editData.title_ku || ''} onChange={e => setEditData({...editData, title_ku: e.target.value})} />
                <textarea className="w-full p-4 bg-slate-100 rounded-xl font-medium font-arabic h-24 text-xs" value={editData.subtitle_ku || ''} onChange={e => setEditData({...editData, subtitle_ku: e.target.value})} />
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-slate-100">
              <button disabled={saving} onClick={handleSaveContent} className="flex-1 px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Changes
              </button>
              <button onClick={() => setIsEditingContent(false)} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-colors">
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
