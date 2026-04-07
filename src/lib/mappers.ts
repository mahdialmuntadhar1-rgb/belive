import { Business } from './supabase';
import { CATEGORIES } from '@/constants';

export interface MappedBusinessCard {
  id: string;
  name: string;
  image: string;
  category: string;
  categoryName: string;
  location: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isFeatured: boolean;
  phone: string;
  description?: string;
}

export const mapBusinessToCard = (biz: Business, language: 'en' | 'ar' | 'ku'): MappedBusinessCard => {
  const category = CATEGORIES.find(c => c.id === biz.category);
  
  const getName = () => {
    if (language === 'ar' && biz.nameAr) return biz.nameAr;
    if (language === 'ku' && biz.nameKu) return biz.nameKu;
    return biz.name;
  };

  const getImage = () => {
    if (biz.image) return biz.image;
    return category?.image || `https://picsum.photos/seed/${biz.id}/600/400`;
  };

  const getLocation = () => {
    const neighborhood = biz.neighborhood ? `${biz.neighborhood}, ` : '';
    return `${neighborhood}${biz.city} • ${biz.governorate}`;
  };

  return {
    id: biz.id,
    name: getName(),
    image: getImage(),
    category: biz.category,
    categoryName: category?.name[language] || biz.category,
    location: getLocation(),
    rating: biz.rating || 5.0,
    reviewCount: biz.reviewCount || 0,
    isVerified: biz.isVerified || false,
    isFeatured: biz.isFeatured || false,
    phone: biz.phone,
    description: language === 'ar' ? biz.descriptionAr : biz.description
  };
};
