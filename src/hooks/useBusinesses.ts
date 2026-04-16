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

const ITEMS_PER_PAGE = 100;

const FALLBACK_BUSINESSES: Business[] = [
  {
    id: 'f1',
    name: "Rotana Erbil",
    nameAr: "أربيل روتانا",
    category: "hotels",
    governorate: "Erbil",
    city: "Erbil",
    address: "Gulan Street, Erbil",
    phone: "+964 66 210 5555",
    rating: 4.8,
    reviewCount: 1250,
    isFeatured: true,
    isVerified: true,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    description: "Luxury hotel in the heart of Erbil.",
    descriptionAr: "فندق فاخر في قلب أربيل.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'f2',
    name: "Babylon Rotana",
    nameAr: "بابل روتانا",
    category: "hotels",
    governorate: "Baghdad",
    city: "Baghdad",
    address: "Al Jadriya, Baghdad",
    phone: "+964 780 911 1111",
    rating: 4.7,
    reviewCount: 980,
    isFeatured: true,
    isVerified: true,
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
    description: "Iconic hotel overlooking the Tigris river.",
    descriptionAr: "فندق أيقوني يطل على نهر دجلة.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'f3',
    name: "Saj Al-Reef",
    nameAr: "صاج الريف",
    category: "dining",
    governorate: "Baghdad",
    city: "Baghdad",
    address: "Mansour, Baghdad",
    phone: "+964 770 123 4567",
    rating: 4.5,
    reviewCount: 2100,
    isFeatured: false,
    isVerified: true,
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    description: "Famous Iraqi fast food and traditional dishes.",
    descriptionAr: "أشهر المأكولات السريعة والأطباق التقليدية العراقية.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'f4',
    name: "Erbil Citadel Cafe",
    nameAr: "مقهى قلعة أربيل",
    category: "cafe",
    governorate: "Erbil",
    city: "Erbil",
    address: "Citadel, Erbil",
    phone: "+964 750 111 2222",
    rating: 4.9,
    reviewCount: 3500,
    isFeatured: true,
    isVerified: true,
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
    description: "Historic cafe with a view of the city.",
    descriptionAr: "مقهى تاريخي مع إطلالة على المدينة.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'f5',
    name: "Basra International Hotel",
    nameAr: "فندق البصرة الدولي",
    category: "hotels",
    governorate: "Basra",
    city: "Basra",
    address: "Corniche Street, Basra",
    phone: "+964 780 123 4567",
    rating: 4.4,
    reviewCount: 750,
    isFeatured: false,
    isVerified: true,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
    description: "The most prestigious hotel in Basra.",
    descriptionAr: "أرقى فندق في البصرة.",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export function useBusinesses(searchQuery: string): UseBusinessesResult & { featuredBusinesses: Business[] } {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [featuredBusinesses, setFeaturedBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const { selectedGovernorate, selectedCategory, selectedCity } = useHomeStore();

  const fetchFeatured = async () => {
    try {
      // Fetch businesses without filtering on potentially missing 'is_featured' column
      // to avoid 400 errors in production. Filter in JS instead.
      const { data, error: fetchError } = await supabase
        .from('businesses')
        .select('*')
        .limit(50);
      
      if (fetchError) throw fetchError;
      
      if (data) {
        // Filter for featured businesses in JS
        const featured = data.filter((item: any) => item.is_featured === true || item.isFeatured === true);
        
        // If we found featured businesses, use them. Otherwise use the first 5 as "featured"
        const finalFeatured = featured.length > 0 ? featured.slice(0, 5) : data.slice(0, 5);
        mapFeaturedData(finalFeatured);
      }
    } catch (err) {
      console.error('Error fetching featured businesses:', err);
      // Fallback to empty or predefined featured if everything fails
      setFeaturedBusinesses([]);
    }
  };

  const mapFeaturedData = (data: any[]) => {
    setFeaturedBusinesses(data.map((item: any) => ({
      id: item.id,
      name: item.name,
      nameAr: item.nameAr || item.name_ar,
      nameKu: item.nameKu || item.name_ku,
      category: item.category,
      governorate: item.governorate,
      city: item.city,
      address: item.address,
      phone: item.phone,
      rating: item.rating || 0,
      reviewCount: item.reviewCount || item.review_count || 0,
      isFeatured: true,
      isVerified: item.isVerified || item.is_verified || false,
      image: item.imageUrl || item.image_url || item.image || `https://picsum.photos/seed/${item.id}/600/400`,
      website: item.website,
      socialLinks: item.social_links || {},
      description: item.description,
      descriptionAr: item.descriptionAr || item.description_ar,
      openingHours: item.openHours || item.opening_hours,
      ownerId: item.owner_id,
      createdAt: new Date(item.createdAt || item.created_at),
      updatedAt: new Date(item.updatedAt || item.updated_at || item.created_at)
    })));
  };

  const fetchBusinesses = useCallback(async (isRefresh = false) => {
    setError(null);
    
    const currentPage = isRefresh ? 1 : page;
    
    if (isRefresh) {
      setLoading(true);
      fetchFeatured();
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
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, count, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      let mappedBusinesses: Business[] = [];
      if (data && data.length > 0) {
        mappedBusinesses = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          nameAr: item.nameAr || item.name_ar,
          nameKu: item.nameKu || item.name_ku,
          category: item.category,
          governorate: item.governorate,
          city: item.city,
          address: item.address,
          phone: item.phone,
          rating: item.rating || 0,
          reviewCount: item.reviewCount || item.review_count || 0,
          isFeatured: item.isFeatured || item.is_featured || false,
          isVerified: item.isVerified || item.is_verified || false,
          image: item.imageUrl || item.image_url || item.image || `https://picsum.photos/seed/${item.id}/600/400`,
          website: item.website,
          socialLinks: item.social_links || {},
          description: item.description,
          descriptionAr: item.descriptionAr || item.description_ar,
          openingHours: item.openHours || item.opening_hours,
          ownerId: item.owner_id,
          createdAt: new Date(item.createdAt || item.created_at),
          updatedAt: new Date(item.updatedAt || item.updated_at || item.created_at)
        }));
      } else if (isRefresh && !selectedGovernorate && !selectedCategory && !selectedCity && !searchQuery) {
        // Only show fallbacks if it's a fresh load with no filters
        mappedBusinesses = FALLBACK_BUSINESSES;
      }

      setBusinesses(prev => {
        const newBusinesses = isRefresh ? mappedBusinesses : [...prev, ...mappedBusinesses];
        const countVal = count || mappedBusinesses.length;
        setTotalCount(countVal);
        setHasMore(newBusinesses.length < countVal);
        return newBusinesses;
      });
    } catch (err) {
      console.error('Error fetching businesses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch businesses');
      
      // On error, if it's a fresh load, show fallbacks
      if (isRefresh) {
        setBusinesses(FALLBACK_BUSINESSES);
        setTotalCount(FALLBACK_BUSINESSES.length);
        setHasMore(false);
      }
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

  return { businesses, featuredBusinesses, loading, error, hasMore, totalCount, loadMore, refresh };
}
