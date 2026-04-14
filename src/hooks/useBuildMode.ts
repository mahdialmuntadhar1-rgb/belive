/**
 * // BUILD MODE ONLY
 * State management for Build Mode using Zustand and localStorage.
 * Phase 1: Hero Section Only.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HeroSlide, Direction } from '@/types/buildMode';

interface BuildModeState {
  buildModeEnabled: boolean;
  heroSlides: HeroSlide[];
  activeSlideId: string | null;
  lastSaved: string | null;
  
  // Actions
  toggleBuildMode: () => void;
  setActiveSlideId: (id: string | null) => void;
  addSlide: (slide: HeroSlide) => void;
  deleteSlide: (slideId: string) => void;
  updateSlide: (slideId: string, updates: Partial<HeroSlide>) => void;
  reorderSlides: (slideId: string, direction: Direction) => void;
  resetToOriginal: () => void;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: '1',
    title: 'Discover Baghdad',
    subtitle: 'Find the best places to eat, shop and stay in the heart of Iraq.',
    buttonText: 'Explore Now',
    buttonLink: '/directory',
    image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=1200&auto=format&fit=crop'
  }
];

export const useBuildMode = create<BuildModeState>()(
  persist(
    (set) => ({
      buildModeEnabled: false,
      heroSlides: DEFAULT_SLIDES,
      activeSlideId: null,
      lastSaved: null,

      toggleBuildMode: () => set((state) => ({ buildModeEnabled: !state.buildModeEnabled })),

      setActiveSlideId: (id) => set({ activeSlideId: id }),

      addSlide: (slide) => set((state) => ({
        heroSlides: [...state.heroSlides, slide],
        activeSlideId: slide.id,
        lastSaved: new Date().toISOString()
      })),

      deleteSlide: (slideId) => set((state) => ({
        heroSlides: state.heroSlides.filter((s) => s.id !== slideId),
        activeSlideId: state.activeSlideId === slideId ? null : state.activeSlideId,
        lastSaved: new Date().toISOString()
      })),

      updateSlide: (slideId, updates) => set((state) => ({
        heroSlides: state.heroSlides.map((s) => s.id === slideId ? { ...s, ...updates } : s),
        lastSaved: new Date().toISOString()
      })),

      reorderSlides: (slideId, direction) => set((state) => {
        const index = state.heroSlides.findIndex(s => s.id === slideId);
        if (index === -1) return state;
        
        const newSlides = [...state.heroSlides];
        if (direction === 'up' && index > 0) {
          [newSlides[index], newSlides[index - 1]] = [newSlides[index - 1], newSlides[index]];
        } else if (direction === 'down' && index < newSlides.length - 1) {
          [newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]];
        }
        
        return { 
          heroSlides: newSlides,
          lastSaved: new Date().toISOString()
        };
      }),

      resetToOriginal: () => set({ 
        heroSlides: DEFAULT_SLIDES,
        lastSaved: new Date().toISOString()
      })
    }),
    {
      name: 'belive_hero_build_mode',
      partialize: (state) => ({ 
        heroSlides: state.heroSlides,
        buildModeEnabled: state.buildModeEnabled 
      }),
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          return JSON.parse(str);
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch (e) {
            if (e instanceof DOMException && (
              e.code === 22 || 
              e.code === 1014 || 
              e.name === 'QuotaExceededError' || 
              e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
            ) {
              console.error('Build Mode: LocalStorage quota exceeded. Image may be too large.');
              alert('Storage full! This image is too large to save locally. Try a smaller image or use a URL instead.');
            }
          }
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
