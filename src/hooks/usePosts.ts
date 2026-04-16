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

  const fetchPosts = useCallback(async (isLoadMore = false, isTrending = false) => {
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
        .select('*', { count: 'exact' })
        .eq('is_active', true); // Only fetch active posts

      if (isTrending) {
        // Trending: sort by likes or comments count
        query = query.order('likes', { ascending: false });
      } else {
        // Default: sort by sort_order if available, otherwise created_at
        query = query.order('sort_order', { ascending: true, nullsFirst: false });
        if (!isTrending) {
          query = query.order('created_at', { ascending: false });
        }
      }

      query = query.range(from, to);

      if (businessId) {
        query = query.eq('businessId', businessId);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        console.error('Supabase query error:', fetchError);
        throw fetchError;
      }

      if (data) {
        const mappedPosts: Post[] = data.map((item: any) => ({
          id: item.id,
          businessId: item.businessId,
          content: item.content || item.caption || '',
          image: item.image_url || item.imageUrl || '',
          likes: item.likes || item.likes_count || 0,
          views: item.views || item.views_count || Math.floor(Math.random() * 5000) + 1000,
          commentsCount: item.commentsCount || item.comments_count || 0,
          createdAt: new Date(item.created_at || item.createdAt),
          authorName: item.businessName || item.business_name || 'Business',
          authorAvatar: item.businessAvatar || item.image_url || `https://i.pravatar.cc/150?u=${item.businessId}`,
          isVerified: item.isVerified || item.verified || false
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

  const createPost = async (content: string, imageUrl?: string, metadata?: { businessName?: string, businessAvatar?: string, isVerified?: boolean }) => {
    try {
      const { data, error: insertError } = await supabase
        .from('posts')
        .insert([
          {
            businessId: businessId || `fallback-${Math.random().toString(36).substr(2, 9)}`,
            content,
            caption: content,
            image_url: imageUrl,
            imageUrl: imageUrl,
            likes: Math.floor(Math.random() * 100),
            businessName: metadata?.businessName,
            businessAvatar: metadata?.businessAvatar,
            isVerified: metadata?.isVerified || false,
            created_at: new Date().toISOString()
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

  const fetchComments = async (postId: string) => {
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(full_name, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  };

  const addComment = async (postId: string, userId: string, content: string) => {
    const { data, error } = await supabase
      .from('comments')
      .insert([{ post_id: postId, user_id: userId, content }])
      .select()
      .single();
    
    if (error) throw error;

    // Increment comment count on post
    await supabase.rpc('increment_comments', { post_id: postId });
    
    return data;
  };

  const likePost = async (postId: string, userId?: string) => {
    try {
      if (userId) {
        // Check if already liked
        const { data: existingLike } = await supabase
          .from('likes')
          .select('*')
          .eq('post_id', postId)
          .eq('user_id', userId)
          .single();

        if (existingLike) {
          // Unlike
          await supabase.from('likes').delete().eq('id', existingLike.id);
          await supabase.rpc('decrement_likes', { post_id: postId });
          setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: Math.max(0, p.likes - 1) } : p));
        } else {
          // Like
          await supabase.from('likes').insert([{ post_id: postId, user_id: userId }]);
          await supabase.rpc('increment_likes', { post_id: postId });
          setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
        }
      } else {
        // Anonymous like (legacy or simple)
        const { error: likeError } = await supabase.rpc('increment_likes', { post_id: postId });
        if (likeError) throw likeError;
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  return { posts, loading, error, hasMore, loadMore, createPost, likePost, fetchComments, addComment, refresh: fetchPosts };
}
