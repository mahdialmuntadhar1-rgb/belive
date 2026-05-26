import { heroSlidesApi, uploadApi } from './api';

export interface HeroSlide {
  id: string;
  title_en: string;
  title_ar: string;
  title_ku: string;
  subtitle_en: string;
  subtitle_ar: string;
  subtitle_ku: string;
  slogan_en: string;
  slogan_ar: string;
  slogan_ku: string;
  image_url: string;
  cta_text_en: string;
  cta_text_ar: string;
  cta_text_ku: string;
  cta_link: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const heroService = {
  async getActiveSlides(): Promise<HeroSlide[]> {
    const res = await heroSlidesApi.list(true);
    return res.data || [];
  },

  async getAllSlides(): Promise<HeroSlide[]> {
    const res = await heroSlidesApi.list(false);
    return res.data || [];
  },

  async createSlide(slide: Partial<HeroSlide>): Promise<HeroSlide> {
    const res = await heroSlidesApi.create(slide);
    return res.data;
  },

  async updateSlide(id: string, updates: Partial<HeroSlide>): Promise<HeroSlide> {
    const res = await heroSlidesApi.update(id, updates);
    return res.data;
  },

  async uploadImage(file: File): Promise<string> {
    return uploadApi.image(file, 'hero');
  },

  async deleteImage(_url: string): Promise<void> {
    // Image deletion from R2 is handled server-side when needed
  }
};
