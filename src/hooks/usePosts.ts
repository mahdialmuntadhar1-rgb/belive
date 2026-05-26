import { useState, useEffect, useCallback } from 'react';
import { postsApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { Post } from '@/lib/types';

const PAGE_SIZE = 10;

function mapPost(item: any): Post {
  return {
    id: item.id || '',
    businessId: item.business_id || '',
    content: item.caption || item.content || '',
    caption: item.caption || item.content || '',
    image: item.image_url || null,
    image_url: item.image_url || null,
    likes: item.likes_count || 0,
    views: item.views || 0,
    createdAt: item.created_at ? new Date(item.created_at) : new Date(),
    authorName: item.business_name || item.author_name || 'Unknown Business',
    authorAvatar: item.business_image || item.author_avatar || null,
    isVerified: Boolean(item.business_is_verified),
    status: item.status || 'visible',
  };
}

export function usePosts(businessId?: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const initialized = useAuthStore((state) => state.initialized);

  const fetchPosts = useCallback(async (isLoadMore = false) => {
    if (!initialized) { setLoading(false); return; }
    if (!isLoadMore) { setLoading(true); setOffset(0); }
    setError(null);

    const currentOffset = isLoadMore ? offset + PAGE_SIZE : 0;
    try {
      const res = await postsApi.list({ businessId, limit: PAGE_SIZE, offset: currentOffset });
      const mapped = (res.data || []).map(mapPost);
      if (isLoadMore) { setPosts(prev => [...prev, ...mapped]); setOffset(currentOffset); }
      else { setPosts(mapped); }
      setHasMore(mapped.length === PAGE_SIZE);
    } catch (err: any) {
      console.warn('[usePosts] Fetch error (recovered):', err);
      if (!isLoadMore) setPosts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [businessId, offset, initialized]);

  const loadMore = () => { if (!loading && hasMore) fetchPosts(true); };

  const createPost = async (caption: string, imageUrl?: string, _meta?: any) => {
    if (!businessId) return null;
    try {
      const res = await postsApi.create({ business_id: businessId, caption, image_url: imageUrl });
      fetchPosts();
      return res.data;
    } catch (err) { console.error('[usePosts] Create error:', err); return null; }
  };

  const updatePost = async (postId: string, updates: any) => {
    try {
      const res = await postsApi.update(postId, updates);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updates } : p));
      return res.data;
    } catch (err) { console.error('[usePosts] Update error:', err); return null; }
  };

  const deletePost = async (postId: string) => {
    try {
      await postsApi.delete(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      return true;
    } catch (err) { console.error('[usePosts] Delete error:', err); return false; }
  };

  const uploadPostImage = async (file: File): Promise<string> => {
    const { uploadApi } = await import('@/lib/api');
    return uploadApi.image(file, 'feed');
  };

  const likePost = async (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p));
    postsApi.like(postId).catch(() => {});
  };

  const addComment = async (postId: string, authorName: string, commentText: string) => {
    try {
      const res = await postsApi.addComment(postId, authorName, commentText);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p));
      return res.data;
    } catch (err) { console.error('[usePosts] Comment error:', err); return null; }
  };

  useEffect(() => { fetchPosts(); }, [initialized, businessId]);

  return { posts, loading, error, hasMore, loadMore, createPost, updatePost, deletePost, uploadPostImage, likePost, addComment, refresh: () => fetchPosts(false) };
}
