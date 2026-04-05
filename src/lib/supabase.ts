export interface Business {
  id: string;
  name: string;
  nameAr?: string;
  nameKu?: string;
  category: string;
  governorate: string;
  city: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  businessId: string;
  content: string;
  image?: string;
  likes: number;
  createdAt: Date;
  authorName?: string;
  authorAvatar?: string;
}
