import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Post } from '@/lib/supabase';

// Real posts table schema (camelCase columns):
// id, businessId, businessName, businessAvatar, caption, imageUrl,
// createdAt, likes, isVerified

export function usePosts(
  businessId?: string,
  businessName?: string,
  businessAvatar?: string
) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('posts')
        .select('*')
        .order('createdAt', { ascending: false });

      if (businessId) {
        query = query.eq('businessId', businessId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      if (data) {
        const mappedPosts: Post[] = data.map((item: any) => ({
          id: item.id,
          businessId: item.businessId,
          content: item.caption,         // posts.caption maps to Post.content
          image: item.imageUrl,
          likes: item.likes || 0,
          createdAt: new Date(item.createdAt),
          authorName: item.businessName,
          authorAvatar: item.businessAvatar,
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
        .insert([{
          businessId,
          businessName: businessName || '',
          businessAvatar: businessAvatar || null,
          caption: content,              // Post.content → posts.caption
          imageUrl: imageUrl || null,
          likes: 0,
          isVerified: false,
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        fetchPosts();
      }
    } catch (err) {
      console.error('Error creating post:', err);
      throw err;
    }
  };

  const likePost = async (postId: string) => {
    try {
      // increment_likes RPC now exists on live DB (applied in Phase 1)
      const { error: likeError } = await supabase.rpc('increment_likes', { post_id: postId });
      if (likeError) throw likeError;

      setPosts(prev =>
        prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p)
      );
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, createPost, likePost, refresh: fetchPosts };
}
