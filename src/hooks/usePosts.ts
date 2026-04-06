import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Post } from '@/lib/supabase';

export function usePosts(businessId?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const fetchPosts = useCallback(async (isLoadMore = false) => {
    if (!isLoadMore) {
      setLoading(true);
      setPage(0);
    }
    setError(null);
    try {
      const from = isLoadMore ? (page + 1) * PAGE_SIZE : 0;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('posts')
        .select(`
          *,
          businesses (
            name,
            image_url
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (businessId) {
        query = query.eq('business_id', businessId);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      if (data) {
        const mappedPosts: Post[] = data.map((item: any) => ({
          id: item.id,
          businessId: item.business_id,
          content: item.content,
          image: item.image_url,
          likes: item.likes || 0,
          createdAt: new Date(item.created_at),
          authorName: item.businesses?.name,
          authorAvatar: item.businesses?.image_url
        }));

        if (isLoadMore) {
          setPosts(prev => [...prev, ...mappedPosts]);
          setPage(prev => prev + 1);
        } else {
          setPosts(mappedPosts);
        }

        if (count !== null) {
          setHasMore(from + data.length < count);
        }
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, [businessId, page]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(true);
    }
  };

  const createPost = async (content: string, imageUrl?: string) => {
    if (!businessId) return;
    
    try {
      const { data, error: insertError } = await supabase
        .from('posts')
        .insert([
          {
            business_id: businessId,
            content,
            image_url: imageUrl,
            likes: 0
          }
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      
      if (data) {
        // Refresh posts
        fetchPosts();
      }
    } catch (err) {
      console.error('Error creating post:', err);
      throw err;
    }
  };

  const likePost = async (postId: string) => {
    try {
      const { error: likeError } = await supabase.rpc('increment_likes', { post_id: postId });
      if (likeError) throw likeError;
      
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, hasMore, loadMore, createPost, likePost, refresh: fetchPosts };
}
