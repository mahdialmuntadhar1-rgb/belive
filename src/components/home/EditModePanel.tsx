import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2 } from 'lucide-react';
import { heroService, HeroSlide } from '@/lib/heroService';
import HeroEditor from '@/components/admin/HeroEditor';
import { supabase } from '@/lib/supabaseClient';

interface EditModePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditModePanel({ isOpen, onClose }: EditModePanelProps) {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'hero' | 'posts'>('hero');

  // Load hero slides when panel opens
  useEffect(() => {
    if (isOpen) {
      loadHeroSlides();
    }
  }, [isOpen]);

  const loadHeroSlides = async () => {
    setIsLoading(true);
    try {
      const slides = await heroService.getAllSlides();
      setHeroSlides(slides);
    } catch (err) {
      console.error('Failed to load hero slides:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[60]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-[70] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#2B2F33]">Edit Mode</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-[#0F7B6C]" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Tabs */}
                  <div className="flex border-b border-slate-200">
                    <button
                      onClick={() => setActiveTab('hero')}
                      className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
                        activeTab === 'hero'
                          ? 'border-[#0F7B6C] text-[#0F7B6C]'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Hero Slides
                    </button>
                    <button
                      onClick={() => setActiveTab('posts')}
                      className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
                        activeTab === 'posts'
                          ? 'border-[#0F7B6C] text-[#0F7B6C]'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Feed Posts
                    </button>
                  </div>

                  {/* Hero Editor */}
                  {activeTab === 'hero' && (
                    <div className="space-y-4">
                      {heroSlides.length > 0 ? (
                        <HeroEditor
                          slides={heroSlides.map(s => ({
                            id: s.id,
                            image_url: s.image_url,
                            sort_order: s.display_order
                          }))}
                          onUpdate={async (updatedSlides) => {
                            setHeroSlides(heroSlides.map(s => {
                              const updated = updatedSlides.find(us => us.id === s.id);
                              return updated ? { ...s, image_url: updated.image_url } : s;
                            }));
                          }}
                        />
                      ) : (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-sm text-amber-700">
                            No hero slides found. Create slides from the admin panel.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Posts Editor - Simplified placeholder */}
                  {activeTab === 'posts' && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700 leading-relaxed">
                        <strong>Feed Posts:</strong> Post editing coming soon. Use the admin panel for advanced post management.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
