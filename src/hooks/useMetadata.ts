import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

// NOTE: The old FALLBACK_CATEGORIES from constants.ts had wrong category IDs
// ('dining', 'cafe', etc.) that don't match businesses.category values
// ('Restaurants & Dining', 'Cafés & Coffee', etc.).
// The categories/governorates/cities tables are now live in the DB (Phase 1).
// No fallback needed — an empty list is safer than wrong filter options.

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
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch categories — name_en matches businesses.category exactly
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
              ku: cat.name_ku,
            },
            icon_name: cat.icon_name,
            isHot: cat.is_hot,
          })));
        } else {
          // Return empty — wrong fallback names break category filtering
          setCategories([]);
        }

        // Fetch governorates — name_en matches businesses.governorate exactly
        const { data: govData, error: govError } = await supabase
          .from('governorates')
          .select('*')
          .order('name_en', { ascending: true });

        if (!govError && govData) {
          setGovernorates(govData);
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
        // Leave categories/governorates as empty arrays — do not use wrong constants
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return { categories, governorates, cities, loading };
}
