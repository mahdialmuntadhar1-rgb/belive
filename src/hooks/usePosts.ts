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
    setError(null);
    try {
      const currentPage = isLoadMore ? page + 1 : 0;
      const from = currentPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      if (!isLoadMore) {
        setLoading(true);
      }

      let query = supabase
        .from('posts')
        .select(`
          *,
          businesses:businessId (
            name,
            image_url
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (businessId) {
        query = query.eq('businessId', businessId);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      if (data) {
        const mappedPosts: Post[] = data.map((item: any) => ({
          id: item.id,
          businessId: item.businessId,
          content: item.content || item.caption,
          image: item.image_url || item.imageUrl,
          likes: item.likes || 0,
          createdAt: new Date(item.created_at || item.createdAt),
          authorName: item.businesses?.name || item.businessName,
          authorAvatar: item.businesses?.image_url || item.businessAvatar
        }));

        if (isLoadMore) {
          setPosts(prev => [...prev, ...mappedPosts]);
          setPage(currentPage);
        } else {
          setPosts(mappedPosts);
          setPage(0);
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

  useEffect(() => {
    fetchPosts();
  }, [businessId]);

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
            businessId: businessId,
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

  return { posts, loading, error, hasMore, loadMore, createPost, likePost, refresh: fetchPosts };
}
