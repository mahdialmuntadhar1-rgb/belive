import { useState } from 'react';
import { adminApi, businessesApi, postsApi } from '@/lib/api';
import type { Business, Post } from '@/lib/types';

export interface ClaimRequest {
  id: string;
  business_id: string;
  user_id: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  business?: {
    name: string;
  };
  profiles?: {
    full_name: string;
    email: string;
  };
}

export function useAdmin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      return await adminApi.summary();
    } catch (err) {
      console.error('Error fetching summary:', err);
      return { totalBusinesses: 0, totalPosts: 0, pendingClaims: 0, featuredBusinesses: 0, verifiedBusinesses: 0 };
    } finally { setLoading(false); }
  };

  const searchBusinesses = async (filters: { name?: string; phone?: string; category?: string; governorate?: string }) => {
    setLoading(true);
    try {
      const res = await adminApi.searchBusinesses({ ...filters, limit: 100 });
      return (res.data || []).map((item: any) => ({
        id: item.id, name: item.name, nameAr: item.name_ar, nameKu: item.name_ku,
        category: item.category, governorate: item.governorate, city: item.city,
        address: item.address, phone: item.phone, phone_1: item.phone_1, phone_2: item.phone_2,
        rating: item.rating || 0, reviewCount: item.review_count || 0,
        isFeatured: Boolean(item.is_featured), isVerified: Boolean(item.is_verified),
        image: item.image_url || item.image, image_url: item.image_url, website: item.website,
        socialLinks: typeof item.social_links === 'string' ? JSON.parse(item.social_links || '{}') : (item.social_links || {}),
        description: item.description, descriptionAr: item.description_ar,
        openingHours: item.opening_hours, ownerId: item.owner_id,
        createdAt: new Date(item.created_at), updatedAt: new Date(item.updated_at || item.created_at),
      })) as Business[];
    } catch (err) {
      console.error('Error searching businesses:', err);
      return [];
    } finally { setLoading(false); }
  };

  const updateBusiness = async (id: string, updates: any) => {
    setLoading(true);
    try {
      await businessesApi.update(id, updates);
      return true;
    } catch (err) { console.error('Error updating business:', err); throw err; }
    finally { setLoading(false); }
  };

  const fetchClaimRequests = async () => {
    setLoading(true);
    try {
      const res = await adminApi.claimRequests('pending');
      return (res.data || []).map((item: any) => ({
        ...item,
        business: item.business_name ? { name: item.business_name } : undefined,
        profiles: item.user_email ? { full_name: item.user_name, email: item.user_email } : undefined,
      })) as ClaimRequest[];
    } catch (err) {
      console.error('Error fetching claim requests:', err);
      return [];
    } finally { setLoading(false); }
  };

  const handleClaimAction = async (requestId: string, _businessId: string, _userId: string, action: 'approve' | 'reject', verify = false) => {
    setLoading(true);
    try {
      await adminApi.handleClaim(requestId, action, verify);
      return true;
    } catch (err) { console.error(`Error ${action}ing claim:`, err); throw err; }
    finally { setLoading(false); }
  };

  const fetchPosts = async (filters: { businessId?: string; category?: string; governorate?: string }) => {
    setLoading(true);
    try {
      const res = await postsApi.list({ businessId: filters.businessId, limit: 100 });
      return (res.data || []).map((item: any) => ({
        id: item.id, businessId: item.business_id, title: item.title,
        content: item.content, caption: item.caption || item.content,
        image: item.image_url, image_url: item.image_url,
        likes: item.likes_count || 0, views: item.views || 0,
        createdAt: new Date(item.created_at), isVerified: false,
        businessName: item.business_name, status: item.status || 'visible',
      }));
    } catch (err) {
      console.error('Error fetching posts:', err);
      return [];
    } finally { setLoading(false); }
  };

  const updatePost = async (id: string, updates: any) => {
    setLoading(true);
    try {
      await postsApi.update(id, updates);
      return true;
    } catch (err) { console.error('Error updating post:', err); throw err; }
    finally { setLoading(false); }
  };

  const deleteBusiness = async (id: string) => {
    setLoading(true);
    try {
      await businessesApi.delete(id);
      return true;
    } catch (err) { console.error('Error deleting business:', err); throw err; }
    finally { setLoading(false); }
  };

  const createPost = async (postData: {
    businessId?: string; title?: string; content: string;
    caption?: string; image_url?: string; likes?: number; views?: number; status?: 'visible' | 'hidden';
  }) => {
    setLoading(true);
    try {
      await postsApi.create({ business_id: postData.businessId || '', title: postData.title, content: postData.content, caption: postData.caption, image_url: postData.image_url });
      return true;
    } catch (err) { console.error('Error creating post:', err); throw err; }
    finally { setLoading(false); }
  };

  const bulkUploadBusinesses = async (businesses: any[]) => {
    setLoading(true);
    try {
      await businessesApi.bulk(businesses);
      return true;
    } catch (err) { console.error('Error bulk uploading:', err); throw err; }
    finally { setLoading(false); }
  };

  return { loading, error, fetchSummary, searchBusinesses, updateBusiness, deleteBusiness, fetchClaimRequests, handleClaimAction, fetchPosts, updatePost, createPost, bulkUploadBusinesses };
}
