import { useState, useEffect } from 'react';
import { metadataApi } from '@/lib/api';

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
      const res = await metadataApi.categories(true);
      setCategories((res.data || []).map((cat: any) => ({
        ...cat,
        icon_name: cat.icon_name || cat.icon || 'LayoutGrid',
      })));
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, refresh: fetchCategories };
}
