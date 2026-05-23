import { supabase } from '@/lib/supabaseClient';

export interface AdminContentUpdates {
  [key: string]: any;
}

export function useAdminDB() {
  // Generic update function
  const updateContent = async (table: string, id: string, updates: AdminContentUpdates) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (err) {
      console.error(`Error updating ${table}:`, err);
      return { error: err, success: false };
    }
  };

  // Generic insert function
  const createContent = async (table: string, content: AdminContentUpdates) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .insert([{ ...content, created_at: new Date().toISOString() }])
        .select()
        .single();

      if (error) throw error;
      return { data, success: true };
    } catch (err) {
      console.error(`Error creating in ${table}:`, err);
      return { error: err, success: false };
    }
  };

  // Generic delete function
  const deleteContent = async (table: string, id: string) => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error(`Error deleting from ${table}:`, err);
      return { error: err, success: false };
    }
  };

  const updateHeroSlide = (id: string, updates: AdminContentUpdates) => updateContent('hero_slides', id, updates);
  const createHeroSlide = (content: AdminContentUpdates) => createContent('hero_slides', content);
  const deleteHeroSlide = (id: string) => deleteContent('hero_slides', id);

  const updateFeature = (id: string, updates: AdminContentUpdates) => updateContent('features', id, updates);
  const createFeature = (content: AdminContentUpdates) => createContent('features', content);
  const deleteFeature = (id: string) => deleteContent('features', id);

  const updateCategory = (id: string, updates: AdminContentUpdates) => updateContent('categories', id, updates);
  const createCategory = (content: AdminContentUpdates) => createContent('categories', content);
  const deleteCategory = (id: string) => deleteContent('categories', id);
  
  const updatePost = (id: string, updates: AdminContentUpdates) => updateContent('posts', id, updates);
  const createPost = (content: AdminContentUpdates) => createContent('posts', content);
  const deletePost = (id: string) => deleteContent('posts', id);

  const updateBusiness = (id: string, updates: AdminContentUpdates) => updateContent('businesses', id, updates);
  const deleteBusiness = (id: string) => deleteContent('businesses', id);

  return {
    updateHeroSlide,
    createHeroSlide,
    deleteHeroSlide,
    updateFeature,
    createFeature,
    deleteFeature,
    updateCategory,
    createCategory,
    deleteCategory,
    updatePost,
    createPost,
    deletePost,
    updateBusiness,
    deleteBusiness,
    updateContent
  };
}
