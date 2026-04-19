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

      // Fetch posts - filter for visible posts only
      let query = supabase
        .from('posts')
        .select('*, business:businesses(name, image_url)', { count: 'exact' })
        .or('status.eq.visible,status.is.null');

      if (isTrending) {
        query = query.order('likes', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      query = query.range(from, to);

      if (businessId) {
        // business_id is the correct snake_case DB column
        query = query.eq('business_id', businessId);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        console.error('Supabase query error:', fetchError);
        throw fetchError;
      }

      if (data) {
        const mappedPosts: Post[] = data.map((item: any) => ({
          id: item.id,
          businessId: item.business_id || item.businessId || '',
          content: item.content || item.caption || '',
          image: item.image_url || '',
          likes: item.likes || 0,
          views: item.views || 0,
          commentsCount: item.comments_count || item.commentsCount || 0,
          createdAt: new Date(item.created_at),
          authorName: item.author_name || 'Community',
          authorAvatar: `https://i.pravatar.cc/150?u=${item.id}`,
          isVerified: item.is_verified || false,
          status: item.status || 'visible',
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

  const createPost = async (
    content: string,
    imageUrl?: string,
    metadata?: { businessName?: string; businessAvatar?: string; isVerified?: boolean; businessId?: string }
  ) => {
    try {
      const insertData: any = {
        content,
        caption: content,
        image_url: imageUrl || null,
        likes: 0,
        views: 0,
        status: 'visible',
        created_at: new Date().toISOString(),
      };

      // Only attach business_id if it looks like a real UUID (36 chars)
      const resolvedBusinessId = businessId || metadata?.businessId;
      if (resolvedBusinessId && resolvedBusinessId.length === 36) {
        insertData.business_id = resolvedBusinessId;
      }

      const { data, error: insertError } = await supabase
        .from('posts')
        .insert([insertData])
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        fetchPosts();
      }
      return data;
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

    await supabase.rpc('increment_comments', { post_id: postId });

    return data;
  };

  const likePost = async (postId: string, userId?: string) => {
    try {
      if (userId) {
        const { data: existingLike } = await supabase
          .from('likes')
          .select('*')
          .eq('post_id', postId)
          .eq('user_id', userId)
          .single();

        if (existingLike) {
          await supabase.from('likes').delete().eq('id', existingLike.id);
          await supabase.rpc('decrement_likes', { post_id: postId });
          setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: Math.max(0, p.likes - 1) } : p));
        } else {
          await supabase.from('likes').insert([{ post_id: postId, user_id: userId }]);
          await supabase.rpc('increment_likes', { post_id: postId });
          setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
        }
      } else {
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
