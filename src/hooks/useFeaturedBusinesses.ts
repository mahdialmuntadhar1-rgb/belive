import { useState, useEffect } from 'react';
import type { Business } from '@/lib/supabase';
import { supabase } from '@/lib/supabaseClient';

interface UseFeaturedBusinessesResult {
  businesses: Business[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetch featured businesses independent of pagination
 * This ensures featured section always shows available featured businesses
 */
export function useFeaturedBusinesses(): UseFeaturedBusinessesResult {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('businesses')
          .select('*')
          .eq('is_featured', true)
          .limit(10);

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

          setBusinesses(mappedBusinesses);
        }
      } catch (err) {
        console.error('Error fetching featured businesses:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch featured businesses');
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return { businesses, loading, error };
}
