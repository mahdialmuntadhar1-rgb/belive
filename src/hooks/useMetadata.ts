import { useState, useEffect } from 'react';
import { metadataApi } from '@/lib/api';
import { CATEGORIES as FALLBACK_CATEGORIES, GOVERNORATES as FALLBACK_GOVERNORATES } from '@/constants';

export interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  name_ku: string;
  icon_name?: string;
  is_hot?: boolean;
}

export interface Governorate {
  id: string;
  name_en: string;
  name_ar: string;
  name_ku: string;
}

export interface City {
  id: string;
  governorate_id: string;
  name_en: string;
  name_ar: string;
  name_ku: string;
}

export function useMetadata() {
  const [categories, setCategories] = useState<any[]>([]);
  const [governorates, setGovernorates] = useState<any[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [catRes, govRes, cityRes] = await Promise.allSettled([
          metadataApi.categories(true),
          metadataApi.governorates(),
          metadataApi.cities(),
        ]);

        if (catRes.status === 'fulfilled' && catRes.value.data?.length > 0) {
          setCategories(catRes.value.data.map((cat: any) => ({
            id: cat.id,
            name: { en: cat.name_en, ar: cat.name_ar, ku: cat.name_ku },
            icon_name: cat.icon_name,
            isHot: Boolean(cat.is_hot),
          })));
        } else {
          setCategories(FALLBACK_CATEGORIES);
        }

        if (govRes.status === 'fulfilled' && govRes.value.data?.length > 0) {
          setGovernorates(govRes.value.data.map((gov: any) => ({
            id: gov.id, name_en: gov.name_en, name_ar: gov.name_ar, name_ku: gov.name_ku,
          })));
        } else {
          setGovernorates(FALLBACK_GOVERNORATES.map(gov => ({
            id: gov.id, name_en: gov.name.en, name_ar: gov.name.ar, name_ku: gov.name.ku,
          })));
        }

        if (cityRes.status === 'fulfilled') {
          setCities(cityRes.value.data || []);
        }
      } catch (err) {
        console.error('Error fetching metadata:', err);
        setCategories(FALLBACK_CATEGORIES);
        setGovernorates(FALLBACK_GOVERNORATES.map(gov => ({
          id: gov.id, name_en: gov.name.en, name_ar: gov.name.ar, name_ku: gov.name.ku,
        })));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { categories, governorates, cities, loading };
}
