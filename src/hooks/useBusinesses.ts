import { useState, useEffect, useCallback } from 'react';
import type { Business } from '@/lib/types';
import { useHomeStore } from '@/stores/homeStore';
import { businessesApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

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

function mapRow(item: any): Business {
  return {
    id: item.id || '',
    name: item.name || 'Unnamed Business',
    nameAr: item.name_ar || '',
    nameKu: item.name_ku || '',
    category: item.category || 'Uncategorized',
    governorate: item.governorate || '',
    city: item.city || '',
    address: item.address || '',
    phone: item.phone || '',
    phone_1: item.phone_1 || '',
    phone_2: item.phone_2 || '',
    rating: item.rating || 0,
    reviewCount: item.review_count || 0,
    isFeatured: Boolean(item.is_featured),
    isVerified: Boolean(item.is_verified),
    image: item.image_url || item.image || `https://picsum.photos/seed/${item.id}/600/400`,
    image_url: item.image_url,
    website: item.website || '',
    socialLinks: typeof item.social_links === 'string' ? JSON.parse(item.social_links || '{}') : (item.social_links || {}),
    description: item.description || '',
    descriptionAr: item.description_ar || '',
    descriptionKu: item.description_ku || '',
    openingHours: typeof item.opening_hours === 'string' ? JSON.parse(item.opening_hours || '{}') : (item.opening_hours || {}),
    ownerId: item.owner_id || '',
    lat: item.lat,
    lng: item.lng,
    createdAt: item.created_at ? new Date(item.created_at) : new Date(),
    updatedAt: item.updated_at ? new Date(item.updated_at) : new Date(item.created_at || Date.now()),
  };
}

export function useBusinesses(searchQuery: string): UseBusinessesResult {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const { selectedGovernorate, selectedCategory, selectedCity } = useHomeStore();
  const initialized = useAuthStore((state) => state.initialized);

  const fetchBusinesses = useCallback(async (isRefresh = false) => {
    if (!initialized) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    const currentOffset = isRefresh ? 0 : offset;

    try {
      const res = await businessesApi.list({
        governorate: selectedGovernorate || undefined,
        city: selectedCity || undefined,
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
        limit: ITEMS_PER_PAGE,
        offset: currentOffset,
      });

      const mapped = (res.data || []).map(mapRow);
      setBusinesses(prev => isRefresh ? mapped : [...prev, ...mapped]);
      setTotalCount(res.total);
      setHasMore(res.hasMore);
      if (isRefresh) setOffset(0);
    } catch (err) {
      console.warn('[useBusinesses] Fetch error (recovered):', err);
      if (isRefresh) { setBusinesses([]); setTotalCount(0); }
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [offset, selectedGovernorate, selectedCity, selectedCategory, searchQuery, initialized]);

  useEffect(() => { setOffset(0); fetchBusinesses(true); }, [selectedGovernorate, selectedCity, selectedCategory, searchQuery, initialized]);
  useEffect(() => { if (offset > 0) fetchBusinesses(false); }, [offset]);

  const loadMore = () => { if (!loading && hasMore) setOffset(prev => prev + ITEMS_PER_PAGE); };
  const refresh = () => { setOffset(0); fetchBusinesses(true); };

  return { businesses, loading, error, hasMore, totalCount, loadMore, refresh };
}

export { mapRow as mapBusinessRow };
