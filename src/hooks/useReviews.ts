import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

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
    
    if (!isLoadMore) {
      setLoading(true);
      setPage(0);
    }
    setError(null);
    try {
      const from = isLoadMore ? (page + 1) * PAGE_SIZE : 0;
      const to = from + PAGE_SIZE - 1;

      const { data, error: fetchError, count } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `, { count: 'exact' })
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (fetchError) throw fetchError;

      if (data) {
        const mappedReviews: Review[] = data.map((item: any) => ({
          id: item.id,
          businessId: item.business_id,
          userId: item.user_id,
          rating: item.rating,
          comment: item.comment,
          createdAt: new Date(item.created_at),
          userName: item.profiles?.full_name,
          userAvatar: item.profiles?.avatar_url
        }));

        if (isLoadMore) {
          setReviews(prev => [...prev, ...mappedReviews]);
          setPage(prev => prev + 1);
        } else {
          setReviews(mappedReviews);
        }

        if (count !== null) {
          setHasMore(from + data.length < count);
        }
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, [businessId, page]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchReviews(true);
    }
  };

  const addReview = async (rating: number, comment: string) => {
    if (!businessId) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to review');

      const { data, error: insertError } = await supabase
        .from('reviews')
        .insert([
          {
            business_id: businessId,
            user_id: user.id,
            rating,
            comment
          }
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      
      if (data) {
        fetchReviews();
      }
    } catch (err) {
      console.error('Error adding review:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { reviews, loading, error, hasMore, loadMore, addReview, refresh: fetchReviews };
}
