import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
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
        // Fetch categories
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .order('name_en', { ascending: true });

        if (!catError && catData && catData.length > 0) {
          setCategories(catData.map(cat => ({
            id: cat.id,
            name: {
              en: cat.name_en,
              ar: cat.name_ar,
              ku: cat.name_ku
            },
            icon_name: cat.icon_name,
            isHot: cat.is_hot
          })));
        } else {
          setCategories(FALLBACK_CATEGORIES);
        }

        // Fetch governorates
        const { data: govData, error: govError } = await supabase
          .from('governorates')
          .select('*')
          .order('name_en', { ascending: true });

        if (!govError && govData && govData.length > 0) {
          setGovernorates(govData.map(gov => ({
            id: gov.id,
            name_en: gov.name_en,
            name_ar: gov.name_ar,
            name_ku: gov.name_ku
          })));
        } else {
          setGovernorates(FALLBACK_GOVERNORATES.map(gov => ({
            id: gov.id,
            name_en: gov.name.en,
            name_ar: gov.name.ar,
            name_ku: gov.name.ku
          })));
        }

        // Fetch cities
        const { data: cityData, error: cityError } = await supabase
          .from('cities')
          .select('*')
          .order('name_en', { ascending: true });

        if (!cityError && cityData) {
          setCities(cityData);
        }
      } catch (err) {
        console.error('Error fetching metadata:', err);
        setCategories(FALLBACK_CATEGORIES);
        setGovernorates(FALLBACK_GOVERNORATES.map(gov => ({
          id: gov.id,
          name_en: gov.name.en,
          name_ar: gov.name.ar,
          name_ku: gov.name.ku
        })));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { categories, governorates, cities, loading };
}
