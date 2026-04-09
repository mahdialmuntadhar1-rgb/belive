export interface Business {
  id: string;
  name: string;
  nameAr?: string;
  nameKu?: string;
  category: string;
  governorate: string;
  city: string;
  neighborhood?: string;
  address: string;
  phone: string;
  rating?: number;
  reviewCount?: number;
  isFeatured?: boolean;
  isVerified?: boolean;
  image?: string;
  website?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
  };
  description?: string;
  descriptionAr?: string;
  openingHours?: string;
  ownerId?: string;
  lat?: number;
  lng?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  businessId?: string;
  content?: string;
  caption?: string;
  image?: string;
  image_url?: string;
  likes?: number;
  likes_count?: number;
  createdAt: Date;
  created_at?: Date;
  authorName?: string;
  authorAvatar?: string;
  title?: string;
  city?: string;
  category?: string;
  neighborhood?: string;
  governorate?: string;
  address?: string;
  lat?: number;
  lng?: number;
  rating?: number;
}
