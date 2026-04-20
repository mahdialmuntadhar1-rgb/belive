import { supabase } from './supabaseClient';

export interface HeroSlide {
  id: string;
  title_en: string;
  title_ar: string;
  title_ku: string;
  subtitle_en: string;
  subtitle_ar: string;
  subtitle_ku: string;
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
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getAllSlides(): Promise<HeroSlide[]> {
    const { data, error } = await supabase
      .from('hero_slides')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createSlide(slide: Partial<HeroSlide>): Promise<HeroSlide> {
    const { data, error } = await supabase
      .from('hero_slides')
      .insert([slide])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSlide(id: string, updates: Partial<HeroSlide>): Promise<HeroSlide> {
    const { data, error } = await supabase
      .from('hero_slides')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSlide(id: string): Promise<void> {
    const { error } = await supabase
      .from('hero_slides')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async uploadImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `slides/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('hero-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('hero-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async deleteImage(url: string): Promise<void> {
    try {
      const path = url.split('/hero-images/')[1];
      if (path) {
        await supabase.storage.from('hero-images').remove([path]);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }
};
