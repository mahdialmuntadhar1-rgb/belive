import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface Category {
  id: string;
  name_ar: string;
  name_ku: string;
  name_en: string;
  icon_name: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) {
        // If recursion or table missing error, or display_order missing
        const { data: fallbackData, error: fallbackError } = await supabase.from('categories').select('*');
        if (fallbackError) {
          // If even raw select fails, just return empty instead of crashing
          setCategories([]);
          return;
        }
        setCategories((fallbackData || []).map((cat: any) => ({
          ...cat,
          icon_name: cat.icon_name || cat.icon || 'LayoutGrid'
        })));
        return;
      }

      const formattedData = (data || []).map((cat: any) => ({
        ...cat,
        icon_name: cat.icon_name || cat.icon || 'LayoutGrid'
      }));

      setCategories(formattedData);
    } catch (err: any) {
      // Quietly handle known DB issues
      if (err?.code === '42P17' || err?.code === 'PGRST205') return;
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, refresh: fetchCategories };
}
