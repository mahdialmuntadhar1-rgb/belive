import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';

export interface AdminHeroSlide {
  id: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

export interface AdminFeedSection {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  content: string;
  sort_order: number;
  visibility: boolean;
}

export interface AdminPost {
  id: string;
  business_id?: string;
  image_url: string;
  caption: string;
  author_name: string;
  post_type: 'shaku_maku' | 'postcard' | 'normal';
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  likes: number;
}

interface AdminDBState {
  heroSlides: AdminHeroSlide[];
  feedSections: AdminFeedSection[];
  posts: AdminPost[];
  loading: boolean;
  error: string | null;
  
  fetchHeroSlides: () => Promise<void>;
  fetchFeedSections: () => Promise<void>;
  fetchPosts: () => Promise<void>;
  fetchAll: () => Promise<void>;

  // Hero
  addHeroSlide: (slide: Partial<AdminHeroSlide>) => Promise<void>;
  updateHeroSlide: (id: string, updates: Partial<AdminHeroSlide>) => Promise<void>;
  deleteHeroSlide: (id: string) => Promise<void>;
  reorderHeroSlide: (id: string, direction: 'up' | 'down') => Promise<void>;

  // Feed
  addFeedSection: (section: Partial<AdminFeedSection>) => Promise<void>;
  updateFeedSection: (id: string, updates: Partial<AdminFeedSection>) => Promise<void>;
  deleteFeedSection: (id: string) => Promise<void>;
  reorderFeedSection: (id: string, direction: 'up' | 'down') => Promise<void>;

  // Posts
  addPost: (post: Partial<AdminPost>) => Promise<void>;
  updatePost: (id: string, updates: Partial<AdminPost>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  reorderPost: (id: string, direction: 'up' | 'down') => Promise<void>;
  
  uploadImage: (file: File, folder: string) => Promise<string | null>;
}

export const useAdminDB = create<AdminDBState>()((set, get) => ({
  heroSlides: [],
  feedSections: [],
  posts: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      await Promise.all([
        get().fetchHeroSlides(),
        get().fetchFeedSections(),
        get().fetchPosts()
      ]);
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchHeroSlides: async () => {
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    set({ heroSlides: data as AdminHeroSlide[] });
  },

  fetchFeedSections: async () => {
    const { data, error } = await supabase
      .from('feed_sections')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    set({ feedSections: data as AdminFeedSection[] });
  },

  fetchPosts: async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .in('post_type', ['shaku_maku', 'postcard'])
      .order('sort_order', { ascending: true });
    if (error) throw error;
    set({ posts: data as AdminPost[] });
  },

  // HERO
  addHeroSlide: async (slide) => {
    const { heroSlides } = get();
    const sort_order = heroSlides.length > 0 ? Math.max(...heroSlides.map(s => s.sort_order)) + 1 : 0;
    const { error } = await supabase.from('hero_slides').insert([{ ...slide, sort_order }]);
    if (error) throw error;
    await get().fetchHeroSlides();
  },
  
  updateHeroSlide: async (id, updates) => {
    const { error } = await supabase.from('hero_slides').update(updates).eq('id', id);
    if (error) throw error;
    await get().fetchHeroSlides();
  },

  deleteHeroSlide: async (id) => {
    const { error } = await supabase.from('hero_slides').delete().eq('id', id);
    if (error) throw error;
    await get().fetchHeroSlides();
  },

  reorderHeroSlide: async (id, direction) => {
    const { heroSlides } = get();
    const index = heroSlides.findIndex(s => s.id === id);
    if (index === -1) return;
    
    if (direction === 'up' && index > 0) {
      const current = heroSlides[index];
      const prev = heroSlides[index - 1];
      await supabase.from('hero_slides').update({ sort_order: prev.sort_order }).eq('id', current.id);
      await supabase.from('hero_slides').update({ sort_order: current.sort_order }).eq('id', prev.id);
    } else if (direction === 'down' && index < heroSlides.length - 1) {
      const current = heroSlides[index];
      const next = heroSlides[index + 1];
      await supabase.from('hero_slides').update({ sort_order: next.sort_order }).eq('id', current.id);
      await supabase.from('hero_slides').update({ sort_order: current.sort_order }).eq('id', next.id);
    }
    await get().fetchHeroSlides();
  },

  // FEED SECTIONS
  addFeedSection: async (section) => {
    const { feedSections } = get();
    const sort_order = feedSections.length > 0 ? Math.max(...feedSections.map(s => s.sort_order)) + 1 : 0;
    const { error } = await supabase.from('feed_sections').insert([{ ...section, sort_order }]);
    if (error) throw error;
    await get().fetchFeedSections();
  },
  
  updateFeedSection: async (id, updates) => {
    const { error } = await supabase.from('feed_sections').update(updates).eq('id', id);
    if (error) throw error;
    await get().fetchFeedSections();
  },

  deleteFeedSection: async (id) => {
    const { error } = await supabase.from('feed_sections').delete().eq('id', id);
    if (error) throw error;
    await get().fetchFeedSections();
  },

  reorderFeedSection: async (id, direction) => {
    const { feedSections } = get();
    const index = feedSections.findIndex(s => s.id === id);
    if (index === -1) return;
    
    if (direction === 'up' && index > 0) {
      const current = feedSections[index];
      const prev = feedSections[index - 1];
      await supabase.from('feed_sections').update({ sort_order: prev.sort_order }).eq('id', current.id);
      await supabase.from('feed_sections').update({ sort_order: current.sort_order }).eq('id', prev.id);
    } else if (direction === 'down' && index < feedSections.length - 1) {
      const current = feedSections[index];
      const next = feedSections[index + 1];
      await supabase.from('feed_sections').update({ sort_order: next.sort_order }).eq('id', current.id);
      await supabase.from('feed_sections').update({ sort_order: current.sort_order }).eq('id', next.id);
    }
    await get().fetchFeedSections();
  },

  // POSTS
  addPost: async (post) => {
    const { posts } = get();
    // Default to postcard if not specified
    const type = post.post_type || 'postcard';
    const typePosts = posts.filter(p => p.post_type === type);
    const sort_order = typePosts.length > 0 ? Math.max(...typePosts.map(s => s.sort_order)) + 1 : 0;
    
    const { error } = await supabase.from('posts').insert([{ ...post, sort_order, post_type: type }]);
    if (error) throw error;
    await get().fetchPosts();
  },
  
  updatePost: async (id, updates) => {
    const { error } = await supabase.from('posts').update(updates).eq('id', id);
    if (error) throw error;
    await get().fetchPosts();
  },

  deletePost: async (id) => {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
    await get().fetchPosts();
  },

  reorderPost: async (id, direction) => {
    const { posts } = get();
    const postToMove = posts.find(p => p.id === id);
    if (!postToMove) return;
    
    // Only sort within the same type
    const sameTypePosts = posts.filter(p => p.post_type === postToMove.post_type);
    const index = sameTypePosts.findIndex(s => s.id === id);
    if (index === -1) return;
    
    if (direction === 'up' && index > 0) {
      const current = sameTypePosts[index];
      const prev = sameTypePosts[index - 1];
      await supabase.from('posts').update({ sort_order: prev.sort_order }).eq('id', current.id);
      await supabase.from('posts').update({ sort_order: current.sort_order }).eq('id', prev.id);
    } else if (direction === 'down' && index < sameTypePosts.length - 1) {
      const current = sameTypePosts[index];
      const next = sameTypePosts[index + 1];
      await supabase.from('posts').update({ sort_order: next.sort_order }).eq('id', current.id);
      await supabase.from('posts').update({ sort_order: current.sort_order }).eq('id', next.id);
    }
    await get().fetchPosts();
  },

  uploadImage: async (file: File, folder: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('build-mode-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('build-mode-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err) {
      console.error('Upload failed:', err);
      return null;
    }
  }
}));
