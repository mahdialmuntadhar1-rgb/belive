import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Post } from '@/lib/supabase';

export function usePosts(businessId?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          businesses (
            name,
            image_url
          )
        `)
        .order('created_at', { ascending: false });

      if (businessId) {
        query = query.eq('business_id', businessId);
      }

      const { data, error: fetchError } = await query;

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
        setPosts(mappedPosts);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

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

  return { posts, loading, error, createPost, likePost, refresh: fetchPosts };
}
