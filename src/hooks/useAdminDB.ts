import { contentApi, heroSlidesApi, featuresApi, postsApi, businessesApi } from '@/lib/api';

export interface AdminContentUpdates {
  [key: string]: any;
}

export function useAdminDB() {
  const updateContent = async (table: string, id: string, updates: AdminContentUpdates) => {
    try {
      const res = await contentApi.update(table, id, updates);
      return { data: res.data, success: true };
    } catch (err) {
      console.error(`Error updating ${table}:`, err);
      return { error: err, success: false };
    }
  };

  const createContent = async (table: string, content: AdminContentUpdates) => {
    try {
      const res = await contentApi.create(table, content);
      return { data: res.data, success: true };
    } catch (err) {
      console.error(`Error creating in ${table}:`, err);
      return { error: err, success: false };
    }
  };

  const deleteContent = async (table: string, id: string) => {
    try {
      await contentApi.delete(table, id);
      return { success: true };
    } catch (err) {
      console.error(`Error deleting from ${table}:`, err);
      return { error: err, success: false };
    }
  };

  const updateHeroSlide = (id: string, updates: AdminContentUpdates) =>
    heroSlidesApi.update(id, updates).then(r => ({ data: r.data, success: true })).catch(err => ({ error: err, success: false }));
  const createHeroSlide = (content: AdminContentUpdates) =>
    heroSlidesApi.create(content).then(r => ({ data: r.data, success: true })).catch(err => ({ error: err, success: false }));
  const deleteHeroSlide = (id: string) =>
    heroSlidesApi.delete(id).then(() => ({ success: true })).catch(err => ({ error: err, success: false }));

  const updateFeature = (id: string, updates: AdminContentUpdates) =>
    featuresApi.update(id, updates).then(r => ({ data: r.data, success: true })).catch(err => ({ error: err, success: false }));
  const createFeature = (content: AdminContentUpdates) =>
    featuresApi.create(content).then(r => ({ data: r.data, success: true })).catch(err => ({ error: err, success: false }));
  const deleteFeature = (id: string) =>
    featuresApi.delete(id).then(() => ({ success: true })).catch(err => ({ error: err, success: false }));

  const updateCategory = (id: string, updates: AdminContentUpdates) => updateContent('categories', id, updates);
  const createCategory = (content: AdminContentUpdates) => createContent('categories', content);
  const deleteCategory = (id: string) => deleteContent('categories', id);

  const updatePost = (id: string, updates: AdminContentUpdates) =>
    postsApi.update(id, updates).then(r => ({ data: r.data, success: true })).catch(err => ({ error: err, success: false }));
  const createPost = (content: AdminContentUpdates) => createContent('posts', content);
  const deletePost = (id: string) =>
    postsApi.delete(id).then(() => ({ success: true })).catch(err => ({ error: err, success: false }));

  const updateBusiness = (id: string, updates: AdminContentUpdates) =>
    businessesApi.update(id, updates).then(r => ({ data: r.data, success: true })).catch(err => ({ error: err, success: false }));
  const deleteBusiness = (id: string) =>
    businessesApi.delete(id).then(() => ({ success: true })).catch(err => ({ error: err, success: false }));

  return {
    updateHeroSlide, createHeroSlide, deleteHeroSlide,
    updateFeature, createFeature, deleteFeature,
    updateCategory, createCategory, deleteCategory,
    updatePost, createPost, deletePost,
    updateBusiness, deleteBusiness,
    updateContent,
  };
}
