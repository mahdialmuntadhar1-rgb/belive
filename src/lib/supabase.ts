export interface Business {
  id: string;
  name: string;
  nameAr?: string;
  nameKu?: string;
  category: string;
  governorate: string;
  city: string;
  address?: string;
  phone: string;
  rating?: number;
  reviewCount?: number;
  isFeatured?: boolean;
  isVerified?: boolean;
  image?: string;
  imageUrl?: string;
  website?: string;
  whatsapp?: string;
  description?: string;
  openHours?: string;
  lat?: number;
  lng?: number;
  createdAt: string;
  updatedAt?: string;
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
