import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Post } from '@/lib/supabase';

export function usePosts(businessId?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [invalidLinkedCount, setInvalidLinkedCount] = useState(0);
  const [page, setPage] = useState(0);
  const [canLike] = useState(import.meta.env.VITE_ENABLE_POST_LIKES === 'true');
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

      let data: any[] | null = null;
      let count: number | null = null;

      const runModernQuery = async () => {
        let query = supabase
          .from('posts')
          .select(`
            id,
            business_id,
            caption,
            image_url,
            likes_count,
            created_at,
            is_active,
            businesses (
              id,
              business_name,
              name,
              name_ar,
              name_ku,
              category,
              governorate,
              city,
              phone_1,
              phone,
              image_url
            )
          `, { count: 'exact' })
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .range(from, to);

        if (businessId) {
          query = query.eq('business_id', businessId);
        }
        return query;
      };

      const runLegacyQuery = async () => {
        let query = supabase
          .from('posts')
          .select(`
            id,
            business_id,
            content,
            image_url,
            likes,
            created_at,
            businesses (
              id,
              business_name,
              name,
              name_ar,
              name_ku,
              category,
              governorate,
              city,
              phone_1,
              phone,
              image_url
            )
          `, { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to);

        if (businessId) {
          query = query.eq('business_id', businessId);
        }
        return query;
      };

      const modernResult = await runModernQuery();
      if (modernResult.error) {
        const legacyResult = await runLegacyQuery();
        if (legacyResult.error) throw legacyResult.error;
        data = legacyResult.data as any[] | null;
        count = legacyResult.count;
      } else {
        data = modernResult.data as any[] | null;
        count = modernResult.count;
      }

      if (data) {
        const mappedPosts: Post[] = data.map((item: any) => ({
          id: item.id,
          businessId: item.business_id,
          content: item.caption || item.content || '',
          image: item.image_url,
          likes: item.likes_count ?? item.likes ?? 0,
          createdAt: new Date(item.created_at),
          authorName: item.businesses?.name || item.businesses?.business_name,
          authorAvatar: item.businesses?.image_url,
          businessName: item.businesses?.business_name || item.businesses?.name,
          businessNameAr: item.businesses?.name_ar,
          businessNameKu: item.businesses?.name_ku,
          businessCategory: item.businesses?.category,
          businessGovernorate: item.businesses?.governorate,
          businessCity: item.businesses?.city,
          businessPhone: item.businesses?.phone_1 || item.businesses?.phone,
          hasValidBusiness: Boolean(item.businesses?.id)
        }));
        const invalidLinks = mappedPosts.filter((post) => !post.hasValidBusiness).length;

        if (isLoadMore) {
          setPosts(prev => [...prev, ...mappedPosts]);
          setInvalidLinkedCount((prev) => prev + invalidLinks);
          setPage(prev => prev + 1);
        } else {
          setPosts(mappedPosts);
          setInvalidLinkedCount(invalidLinks);
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
      const modernInsert = await supabase
        .from('posts')
        .insert([
          {
            business_id: businessId,
            caption: content,
            image_url: imageUrl,
            likes_count: 0,
            comments_count: 0,
            is_active: true
          }
        ])
        .select()
        .single();
      let data = modernInsert.data;
      if (modernInsert.error) {
        const legacyInsert = await supabase
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
        if (legacyInsert.error) throw legacyInsert.error;
        data = legacyInsert.data;
      }
      
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
    if (!canLike) return;
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

  return { posts, loading, error, hasMore, invalidLinkedCount, canLike, loadMore, createPost, likePost, refresh: fetchPosts };
}
