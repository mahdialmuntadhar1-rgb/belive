import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/stores/authStore';
import type { Post } from '@/lib/supabase';

export function usePosts(businessId?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;
  const initialized = useAuthStore((state) => state.initialized);

  const fetchPosts = useCallback(async (isLoadMore = false) => {
    if (!initialized) { setLoading(false); return; }
    if (!isLoadMore) { setLoading(true); setPage(0); }
    setError(null);

    try {
      const from = isLoadMore ? (page + 1) * PAGE_SIZE : 0;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('posts')
        .select(`*, businesses:business_id (id, name, category, city, image_url, logo_url, phone_1, phone, whatsapp, social_links, is_active, status)`)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (businessId) { query = query.eq('business_id', businessId); }

      const { data, error: queryError } = await query;
      if (queryError) {
        console.warn('[usePosts] Query error (non-fatal):', queryError.message);
        if (!isLoadMore) setPosts([]);
        setHasMore(false);
        setLoading(false);
        return;
      }
      if (!data || data.length === 0) {
        if (!isLoadMore) setPosts([]);
        setHasMore(false);
        setLoading(false);
        return;
      }

      const mappedPosts: Post[] = data
        .filter((item: any) => {
          const hasBusinessRelation = Boolean(item.business_id);
          const hasValidBusiness = !hasBusinessRelation || (item.businesses && (item.businesses.is_active === true || item.businesses.status === 'approved'));
          if (!hasValidBusiness) console.warn('[usePosts] Filtering out post with invalid business:', { postId: item.id, businessId: item.business_id });
          return hasValidBusiness;
        })
        .map((item: any) => {
          const business = item.businesses || {};
          return {
            id: item.id || '',
            businessId: item.business_id || '',
            content: item.caption || item.content || '',
            image: item.image_url || item.image || null,
            likes: item.likes_count || item.likes || 0,
            comments: item.comments_count || item.comments || 0,
            shares: item.shares_count || item.shares || 0,
            createdAt: item.created_at ? new Date(item.created_at) : new Date(),
            authorName: business.name || item.business_name || item.author_name || 'Unknown Business',
            authorAvatar: business.image_url || business.logo_url || item.author_avatar || null,
            businessName: business.name || item.business_name || 'Unknown Business',
            businessCity: business.city || '',
            businessCategory: business.category || 'General',
            businessPhone: business.phone_1 || business.phone || '',
            businessWhatsapp: business.whatsapp || business.social_links?.whatsapp || '',
            postComments: []
          };
        });

      if (isLoadMore) { setPosts(prev => [...prev, ...mappedPosts]); setPage(prev => prev + 1); }
      else { setPosts(mappedPosts); }
      setHasMore(data.length === PAGE_SIZE);
    } catch (err: any) {
      console.error('[usePosts] Fatal error (recovered):', err);
      setError(null);
      setPosts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [businessId, page, initialized]);

  const loadMore = () => { if (!loading && hasMore) fetchPosts(true); };

  const createPost = async (caption: string, imageUrl?: string, metadata: Record<string, unknown> = {}) => {
    try {
      const insertData: Record<string, unknown> = {
        caption,
        content: caption,
        is_active: true,
        ...metadata,
      };
      if (businessId) insertData.business_id = businessId;
      if (imageUrl) insertData.image_url = imageUrl;
      if (metadata.businessName) insertData.business_name = metadata.businessName;

      const { data, error: insertError } = await supabase.from('posts').insert([insertData]).select().single();
      if (insertError) { console.error('[usePosts] Create error:', insertError); return null; }
      fetchPosts();
      return data;
    } catch (err) { console.error('[usePosts] Create fatal error:', err); return null; }
  };

  const updatePost = async (postId: string, updates: Record<string, unknown>) => {
    const updateData: Record<string, unknown> = { ...updates };
    if (typeof updates.content === 'string') updateData.caption = updates.content;
    if (typeof updates.image === 'string') updateData.image_url = updates.image;

    const { error: updateError } = await supabase.from('posts').update(updateData).eq('id', postId);
    if (updateError) throw updateError;
    setPosts(prev => prev.map(post => post.id === postId ? { ...post, ...updates } : post));
  };

  const deletePost = async (postId: string) => {
    const { error: deleteError } = await supabase.from('posts').delete().eq('id', postId);
    if (deleteError) throw deleteError;
    setPosts(prev => prev.filter(post => post.id !== postId));
  };

  const uploadPostImage = async (file: File) => {
    const extension = file.name.split('.').pop() || 'jpg';
    const filePath = `posts/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from('post-images').upload(filePath, file, { upsert: false });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('post-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const likePost = async (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p));
  };

  const addComment = async (postId: string, authorName: string, commentText: string) => {
    try {
      const { data, error } = await supabase.from('post_comments').insert([{ post_id: postId, author_name: authorName, comment_text: commentText }]).select().single();
      if (error) { console.error('[usePosts] Comment error:', error); return null; }
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: (p.comments || 0) + 1 } : p));
      return data;
    } catch (err) { console.error('[usePosts] Comment fatal error:', err); return null; }
  };

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  return { posts, loading, error, hasMore, loadMore, createPost, updatePost, deletePost, uploadPostImage, likePost, addComment, refresh: fetchPosts };
}
