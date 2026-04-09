import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface ShakuMakuPost {
  id: string;
  business_id: string;
  caption: string;
  caption_ar: string | null;
  caption_en: string | null;
  image_url: string;
  likes_count: number;
  views_count: number;
  is_featured: boolean;
  created_at: string;
}

interface UseShakuMakuFeedResult {
  posts: ShakuMakuPost[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

const POSTS_PER_PAGE = 12;

export function useShakuMakuFeed(): UseShakuMakuFeedResult {
  const [posts, setPosts] = useState<ShakuMakuPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setLoading(true);
      setPage(0);
    }
    setError(null);

    try {
      const currentPage = isRefresh ? 0 : page;
      const from = currentPage * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      console.log('[ShakuMaku] Fetching posts...');

      // STEP 1: Fetch base data (no joins)
      const { data, error: fetchError, count } = await supabase
        .from('shakumaku_posts')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, to);

      console.log('[ShakuMaku] Raw result:', { 
        error: fetchError?.message, 
        dataLength: data?.length,
        count,
        firstRow: data?.[0] ? {
          id: data[0].id,
          business_id: data[0].business_id,
          caption: data[0].caption?.substring(0, 30),
          has_caption_ar: !!data[0].caption_ar,
          image_url: data[0].image_url?.substring(0, 50)
        } : null
      });

      if (fetchError) throw fetchError;

      if (data) {
        setPosts(prev => {
          const newPosts = isRefresh ? data : [...prev, ...data];
          setHasMore(newPosts.length < (count || 0));
          return newPosts;
        });
      }
    } catch (err) {
      console.error('[ShakuMaku] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, [page]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(p => p + 1);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    fetchPosts(true);
  }, []);

  useEffect(() => {
    if (page > 0) {
      fetchPosts(false);
    }
  }, [page]);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh: () => fetchPosts(true)
  };
}
