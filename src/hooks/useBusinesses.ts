import { useState, useEffect, useCallback } from 'react';
import type { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import { supabase } from '@/lib/supabaseClient';

interface UseBusinessesResult {
  businesses: Business[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

const ITEMS_PER_PAGE = 12;

export function useBusinesses(searchQuery: string): UseBusinessesResult {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { selectedGovernorate, selectedCategory, selectedCity } = useHomeStore();

  const fetchBusinesses = useCallback(async (isRefresh = false) => {
    setLoading(true);
    setError(null);
    
    const currentPage = isRefresh ? 1 : page;
    
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
        // Map frontend categories to database values if needed
        query = query.eq('category', selectedCategory);
      }
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, count, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      if (data) {
        // Map database columns to frontend interface using actual schema
        const mappedBusinesses: Business[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          nameAr: item.nameAr,
          nameKu: item.nameKu,
          category: item.category,
          governorate: item.governorate,
          city: item.city,
          address: item.address,
          phone: item.phone,
          rating: item.rating || 0,
          reviewCount: item.reviewCount || 0,
          isFeatured: item.isFeatured || false,
          isVerified: item.isVerified || false,
          image: item.imageUrl || item.image || `https://picsum.photos/seed/${item.id}/600/400`,
          website: item.website,
          socialLinks: {
            facebook: item.facebook,
            instagram: item.instagram,
            twitter: item.twitter,
            whatsapp: item.whatsapp
          },
          description: item.description,
          descriptionAr: item.descriptionAr,
          openingHours: item.openHours,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.createdAt)
        }));

        setBusinesses(prev => {
          const newBusinesses = isRefresh ? mappedBusinesses : [...prev, ...mappedBusinesses];
          const totalCount = count || 0;
          setHasMore(newBusinesses.length < totalCount);
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

  return { businesses, loading, error, hasMore, loadMore, refresh };
}
