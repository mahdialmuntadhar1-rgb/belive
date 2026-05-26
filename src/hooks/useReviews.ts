import { useState, useEffect, useCallback } from 'react';
import { reviewsApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

export interface Review {
  id: string;
  businessId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  userName?: string;
  userAvatar?: string;
}

export function useReviews(businessId?: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 5;

  const fetchReviews = useCallback(async (isLoadMore = false) => {
    if (!businessId) return;
    if (!isLoadMore) { setLoading(true); setPage(0); }
    setError(null);
    try {
      const currentOffset = isLoadMore ? (page + 1) * PAGE_SIZE : 0;
      const res = await reviewsApi.list(businessId, { limit: PAGE_SIZE, offset: currentOffset });
      const mappedReviews: Review[] = (res.data || []).map((item: any) => ({
        id: item.id,
        businessId: item.business_id,
        userId: item.user_id,
        rating: item.rating,
        comment: item.comment,
        createdAt: new Date(item.created_at),
        userName: item.user_name || 'Anonymous',
        userAvatar: item.user_avatar,
      }));
      if (isLoadMore) { setReviews(prev => [...prev, ...mappedReviews]); setPage(prev => prev + 1); }
      else { setReviews(mappedReviews); }
      setHasMore(mappedReviews.length === PAGE_SIZE);
    } catch (err) {
      console.error('[useReviews] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, [businessId, page]);

  const loadMore = () => { if (!loading && hasMore) fetchReviews(true); };

  const addReview = async (rating: number, comment: string) => {
    if (!businessId) return;
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) throw new Error('Must be logged in to review');
    try {
      await reviewsApi.add(businessId, rating, comment);
      fetchReviews();
    } catch (err) {
      console.error('[useReviews] Add error:', err);
      throw err;
    }
  };

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  return { reviews, loading, error, hasMore, loadMore, addReview, refresh: fetchReviews };
}
