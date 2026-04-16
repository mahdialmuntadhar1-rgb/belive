/**
 * Admin Database Hook
 * Single source of truth for all admin CRUD operations
 * All content managed from Supabase only - no localStorage fallbacks
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Types
export interface HeroSlide {
  id: string;
  title_en?: string;
  title_ar?: string;
  title_ku?: string;
  subtitle_en?: string;
  subtitle_ar?: string;
  subtitle_ku?: string;
  image_url: string;
  cta_text_en?: string;
  cta_text_ar?: string;
  cta_text_ku?: string;
  cta_link?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeedSection {
  id: string;
  title_en: string;
  title_ar: string;
  title_ku: string;
  description_en?: string;
  description_ar?: string;
  description_ku?: string;
  section_type: string;
  sort_order: number;
  is_active: boolean;
  config?: any;
  created_at: string;
  updated_at: string;
}

export interface AdminPost {
  id: string;
  businessId: string;
  content: string;
  caption?: string;
  image_url?: string;
  image?: string;
  likes: number;
  views?: number;
  commentsCount?: number;
  post_type?: string;
  is_featured?: boolean;
  is_active?: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
  authorName?: string;
  authorAvatar?: string;
  isVerified?: boolean;
}

export function useAdminDB() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // HERO SLIDES
  // ============================================================================

  const fetchHeroSlides = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (fetchError) throw fetchError;
      return data as HeroSlide[];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch hero slides';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addHeroSlide = useCallback(async (slide: Omit<HeroSlide, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from('hero_slides')
        .insert([slide])
        .select()
        .single();

      if (insertError) throw insertError;
      return data as HeroSlide;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add hero slide';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateHeroSlide = useCallback(async (id: string, updates: Partial<HeroSlide>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from('hero_slides')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      return data as HeroSlide;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update hero slide';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteHeroSlide = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete hero slide';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reorderHeroSlides = useCallback(async (slides: HeroSlide[]) => {
    setLoading(true);
    setError(null);
    try {
      const updates = slides.map((slide, index) => ({
        id: slide.id,
        sort_order: index
      }));

      const { error: updateError } = await supabase
        .from('hero_slides')
        .upsert(updates);

      if (updateError) throw updateError;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reorder hero slides';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // FEED SECTIONS
  // ============================================================================

  const fetchFeedSections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('feed_sections')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (fetchError) throw fetchError;
      return data as FeedSection[];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch feed sections';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addFeedSection = useCallback(async (section: Omit<FeedSection, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from('feed_sections')
        .insert([section])
        .select()
        .single();

      if (insertError) throw insertError;
      return data as FeedSection;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add feed section';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFeedSection = useCallback(async (id: string, updates: Partial<FeedSection>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from('feed_sections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      return data as FeedSection;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update feed section';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFeedSection = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('feed_sections')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete feed section';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reorderFeedSections = useCallback(async (sections: FeedSection[]) => {
    setLoading(true);
    setError(null);
    try {
      const updates = sections.map((section, index) => ({
        id: section.id,
        sort_order: index
      }));

      const { error: updateError } = await supabase
        .from('feed_sections')
        .upsert(updates);

      if (updateError) throw updateError;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reorder feed sections';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // POSTS
  // ============================================================================

  const fetchPosts = useCallback(async (options?: { isFeatured?: boolean; postType?: string }) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('posts')
        .select('*')
        .eq('is_active', true);

      if (options?.isFeatured) {
        query = query.eq('is_featured', true);
      }
      if (options?.postType) {
        query = query.eq('post_type', options.postType);
      }

      query = query.order('sort_order', { ascending: true });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      return data as AdminPost[];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch posts';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addPost = useCallback(async (post: Omit<AdminPost, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from('posts')
        .insert([post])
        .select()
        .single();

      if (insertError) throw insertError;
      return data as AdminPost;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add post';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePost = useCallback(async (id: string, updates: Partial<AdminPost>) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      return data as AdminPost;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update post';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePost = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete post';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reorderPosts = useCallback(async (posts: AdminPost[]) => {
    setLoading(true);
    setError(null);
    try {
      const updates = posts.map((post, index) => ({
        id: post.id,
        sort_order: index
      }));

      const { error: updateError } = await supabase
        .from('posts')
        .upsert(updates);

      if (updateError) throw updateError;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reorder posts';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // IMAGE UPLOAD TO SUPABASE STORAGE
  // ============================================================================

  const uploadImage = useCallback(async (file: File, folder: 'hero' | 'feed' | 'posts' | 'businesses') => {
    setLoading(true);
    setError(null);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('build-mode-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('build-mode-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload image';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteImage = useCallback(async (imageUrl: string) => {
    setLoading(true);
    setError(null);
    try {
      // Extract file path from URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 2] + '/' + pathParts[pathParts.length - 1];

      const { error: deleteError } = await supabase.storage
        .from('build-mode-images')
        .remove([fileName]);

      if (deleteError) throw deleteError;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete image';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    // Hero slides
    fetchHeroSlides,
    addHeroSlide,
    updateHeroSlide,
    deleteHeroSlide,
    reorderHeroSlides,
    // Feed sections
    fetchFeedSections,
    addFeedSection,
    updateFeedSection,
    deleteFeedSection,
    reorderFeedSections,
    // Posts
    fetchPosts,
    addPost,
    updatePost,
    deletePost,
    reorderPosts,
    // Image upload
    uploadImage,
    deleteImage,
  };
}
