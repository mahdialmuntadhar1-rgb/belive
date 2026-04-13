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
  phone_1?: string;
  phone_2?: string;
  rating?: number;
  reviewCount?: number;
  isFeatured?: boolean;
  isVerified?: boolean;
  image?: string;
  image_url?: string;
  website?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
  };
  description?: string;
  descriptionAr?: string;
  descriptionKu?: string;
  openingHours?: string;
  ownerId?: string;
  lat?: number;
  lng?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  businessId: string;
  title?: string;
  content: string;
  caption?: string;
  image?: string;
  image_url?: string;
  likes: number;
  views?: number;
  commentsCount?: number;
  createdAt: Date;
  authorName?: string;
  authorAvatar?: string;
  isVerified?: boolean;
  status?: 'visible' | 'hidden';
}
