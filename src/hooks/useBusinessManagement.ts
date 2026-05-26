import { useState } from 'react';
import { businessesApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { Business } from '@/lib/types';

export function useBusinessManagement() {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const claimBusiness = async (businessId: string, phone: string) => {
    if (!user) throw new Error('Not authenticated');
    setLoading(true); setError(null);
    try {
      await businessesApi.claim(businessId, phone);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim business');
      throw err;
    } finally { setLoading(false); }
  };

  const updateBusinessProfile = async (businessId: string, updates: Partial<Business>) => {
    if (!user) throw new Error('Not authenticated');
    setLoading(true); setError(null);
    try {
      await businessesApi.update(businessId, {
        name: updates.name, name_ar: updates.nameAr, name_ku: updates.nameKu,
        description: updates.description, description_ar: updates.descriptionAr,
        phone: updates.phone, website: updates.website, address: updates.address,
        image_url: updates.image, social_links: updates.socialLinks, opening_hours: updates.openingHours,
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update business profile');
      throw err;
    } finally { setLoading(false); }
  };

  const getOwnedBusinesses = async (): Promise<Business[]> => {
    if (!user) return [];
    setLoading(true);
    try {
      const res = await businessesApi.owned();
      return (res.data || []).map((item: any) => ({
        id: item.id, name: item.name, nameAr: item.name_ar, nameKu: item.name_ku,
        category: item.category, governorate: item.governorate, city: item.city,
        address: item.address, phone: item.phone, rating: item.rating || 0,
        reviewCount: item.review_count || 0, isFeatured: Boolean(item.is_featured),
        isVerified: Boolean(item.is_verified), image: item.image_url || item.image,
        website: item.website,
        socialLinks: typeof item.social_links === 'string' ? JSON.parse(item.social_links || '{}') : (item.social_links || {}),
        description: item.description, descriptionAr: item.description_ar,
        openingHours: item.opening_hours, ownerId: item.owner_id,
        createdAt: new Date(item.created_at), updatedAt: new Date(item.updated_at || item.created_at),
      })) as Business[];
    } catch (err) {
      console.error('Error fetching owned businesses:', err);
      return [];
    } finally { setLoading(false); }
  };

  const createBusiness = async (businessData: Omit<Business, 'id' | 'createdAt' | 'updatedAt' | 'ownerId' | 'rating' | 'reviewCount' | 'isFeatured' | 'isVerified'>) => {
    if (!user) throw new Error('Not authenticated');
    setLoading(true); setError(null);
    try {
      const res = await businessesApi.create({
        name: businessData.name, name_ar: businessData.nameAr, name_ku: businessData.nameKu,
        category: businessData.category, governorate: businessData.governorate,
        city: businessData.city, neighborhood: businessData.neighborhood,
        address: businessData.address, phone: businessData.phone, website: businessData.website,
        image_url: businessData.image, social_links: businessData.socialLinks,
        opening_hours: businessData.openingHours, description: businessData.description,
        description_ar: businessData.descriptionAr,
      });
      return res.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create business');
      throw err;
    } finally { setLoading(false); }
  };

  const submitClaimRequest = async (businessId: string, phone: string) => {
    if (!user) throw new Error('Not authenticated');
    setLoading(true); setError(null);
    try {
      await businessesApi.claim(businessId, phone);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit claim request');
      throw err;
    } finally { setLoading(false); }
  };

  return { claimBusiness, submitClaimRequest, updateBusinessProfile, getOwnedBusinesses, createBusiness, loading, error };
}
