export type Language = 'en' | 'ar' | 'ku';

export interface City {
  id: string;
  name: {
    en: string;
    ar: string;
    ku: string;
  };
  governorate: {
    en: string;
    ar: string;
    ku: string;
  };
  icon: string;
}

export interface User {
  id: string;
  email?: string;
  phone?: string;
  display_name?: string;
  display_name_ar?: string;
  display_name_ku?: string;
  avatar_url?: string;
  governorate: string;
  role: 'user' | 'business_owner' | 'admin';
  created_at: string;
}
