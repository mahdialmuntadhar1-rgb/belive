/**
 * // BUILD MODE ONLY
 * State management for Build Mode using Zustand and localStorage.
 * Phase 1: Hero Section Only.
 */

import { create } from 'zustand';
import { HeroSlide, FeedItem, Direction } from '@/types/buildMode';
import { heroContent } from '@/data/heroContent';
import { feedContent } from '@/data/feedContent';
import { toast } from 'sonner';

interface BuildModeState {
  buildModeEnabled: boolean;
  heroSlides: HeroSlide[];
  feedItems: FeedItem[];
  activeSlideId: string | null;
  lastSaved: string | null;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  
  // Actions
  toggleBuildMode: () => void;
  setActiveSlideId: (id: string | null) => void;
  
  // Hero Actions
  addSlide: (slide: HeroSlide) => void;
  deleteSlide: (slideId: string) => void;
  updateSlide: (slideId: string, updates: Partial<HeroSlide>) => void;
  reorderSlides: (slideId: string, direction: Direction) => void;
  
  // Feed Actions
  addFeedItem: (item: FeedItem) => void;
  deleteFeedItem: (itemId: string) => void;
  updateFeedItem: (itemId: string, updates: Partial<FeedItem>) => void;
  reorderFeedItems: (itemId: string, direction: Direction) => void;

  resetToOriginal: () => void;
  saveToRepo: (silent?: boolean) => Promise<void>;
}

export const useBuildMode = create<BuildModeState>()((set, get) => {
  // Initial fetch
  if (typeof window !== 'undefined') {
    fetch('/data/hero.json')
      .then(r => r.json())
      .then(data => set({ heroSlides: data.slides || [] }))
      .catch(err => console.error('Failed to load hero.json', err));
  }

  return {
    buildModeEnabled: false,
    heroSlides: [],
    feedItems: [],
    activeSlideId: null,
    lastSaved: null,
    isSaving: false,
    hasUnsavedChanges: false,

    toggleBuildMode: () => set((state) => ({ buildModeEnabled: !state.buildModeEnabled })),

    setActiveSlideId: (id) => set({ activeSlideId: id }),

    // Hero
    addSlide: (slide) => set((state) => ({
      heroSlides: [...state.heroSlides, slide],
      activeSlideId: slide.id,
      hasUnsavedChanges: true
    })),

    deleteSlide: (slideId) => set((state) => ({
      heroSlides: state.heroSlides.filter((s) => s.id !== slideId),
      activeSlideId: state.activeSlideId === slideId ? null : state.activeSlideId,
      hasUnsavedChanges: true
    })),

    updateSlide: (slideId, updates) => set((state) => ({
      heroSlides: state.heroSlides.map((s) => s.id === slideId ? { ...s, ...updates } : s),
      hasUnsavedChanges: true
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
      return { heroSlides: newSlides, hasUnsavedChanges: true };
    }),

    // Feed
    addFeedItem: (item) => set((state) => ({
      feedItems: [...state.feedItems, item],
      hasUnsavedChanges: true
    })),

    deleteFeedItem: (itemId) => set((state) => ({
      feedItems: state.feedItems.filter((i) => i.id !== itemId),
      hasUnsavedChanges: true
    })),

    updateFeedItem: (itemId, updates) => set((state) => ({
      feedItems: state.feedItems.map((i) => i.id === itemId ? { ...i, ...updates } : i),
      hasUnsavedChanges: true
    })),

    reorderFeedItems: (itemId, direction) => set((state) => {
      const index = state.feedItems.findIndex(i => i.id === itemId);
      if (index === -1) return state;
      const newItems = [...state.feedItems];
      if (direction === 'up' && index > 0) {
        [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
      } else if (direction === 'down' && index < newItems.length - 1) {
        [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      }
      return { feedItems: newItems, hasUnsavedChanges: true };
    }),

    resetToOriginal: () => set({ 
      heroSlides: [], // Or fetch again
      hasUnsavedChanges: true
    }),

    saveToRepo: async (silent = false) => {
      set({ isSaving: true });
      try {
        const response = await fetch('/api/save-hero', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            slides: get().heroSlides
          }),
        });
        
        if (!response.ok) throw new Error('Failed to save');
        
        set({ 
          lastSaved: new Date().toISOString(),
          isSaving: false,
          hasUnsavedChanges: false
        });
        if (!silent) {
          toast.success('Changes saved to repository successfully!');
        }
      } catch (error) {
        console.error('Error saving to repo:', error);
        if (!silent) {
          toast.error('Failed to save to repository.');
        }
        set({ isSaving: false });
      }
    }
  };
});
