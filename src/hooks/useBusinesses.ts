import { useState, useEffect, useCallback } from 'react';
import type { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import { supabase } from '@/lib/supabaseClient';

interface UseBusinessesResult {
  businesses: Business[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  loadMore: () => void;
  refresh: () => void;
}

const ITEMS_PER_PAGE = 24;

export function useBusinesses(searchQuery: string): UseBusinessesResult {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const { selectedGovernorate, selectedCategory, selectedCity } = useHomeStore();

  const fetchBusinesses = useCallback(async (isRefresh = false) => {
    setError(null);
    
    const currentPage = isRefresh ? 1 : page;
    
    if (isRefresh) {
      setLoading(true);
    }

    try {
      let query = supabase
        .from('businesses')
        .select('*', { count: 'exact' })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (selectedGovernorate) {
        query = query.eq('governorate', selectedGovernorate);
      }
      if (selectedCity) {
        query = query.eq('city', selectedCity);
      }
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      // Search filter: apply as OR within name/description only
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, count, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      if (data) {
        const mappedBusinesses: Business[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          nameAr: item.name_ar,
          nameKu: item.name_ku,
          category: item.category,
          governorate: item.governorate,
          city: item.city,
          address: item.address,
          phone: item.phone,
          rating: item.rating || 0,
          reviewCount: item.review_count || 0,
          isFeatured: item.is_featured || false,
          isVerified: item.is_verified || false,
          image: item.image_url || item.image || `https://picsum.photos/seed/${item.id}/600/400`,
          website: item.website,
          socialLinks: item.social_links || {},
          description: item.description,
          descriptionAr: item.description_ar,
          openingHours: item.opening_hours,
          ownerId: item.owner_id,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at || item.created_at)
        }));

        setBusinesses(prev => {
          const newBusinesses = isRefresh ? mappedBusinesses : [...prev, ...mappedBusinesses];
          const countVal = count || 0;
          setTotalCount(countVal);
          setHasMore(newBusinesses.length < countVal);
          return newBusinesses;
        });
      }
    } catch (err) {
      console.error('Error fetching businesses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch businesses');
    } finally {
      setLoading(false);
    }
  }, [page, selectedGovernorate, selectedCity, selectedCategory, searchQuery]);

  useEffect(() => {
    setPage(1);
    fetchBusinesses(true);
  }, [selectedGovernorate, selectedCity, selectedCategory, searchQuery]);

  useEffect(() => {
    if (page > 1) {
      fetchBusinesses(false);
    }
  }, [page]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const refresh = () => {
    setPage(1);
    fetchBusinesses(true);
  };

  return { businesses, loading, error, hasMore, totalCount, loadMore, refresh };
}
