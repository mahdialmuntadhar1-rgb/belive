import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Business, Post } from '@/lib/supabase';

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
      const [
        { count: businessCount },
        { count: postCount },
        { count: claimCount },
        featuredRes,
        { count: verifiedCount }
      ] = await Promise.all([
        supabase.from('businesses').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('claim_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('businesses').select('is_featured, isFeatured').then(res => {
          if (res.error || !res.data) return { count: 0 };
          const count = res.data.filter((item: any) => item.is_featured === true || item.isFeatured === true).length;
          return { count };
        }),
        supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('is_verified', true)
      ]);

      return {
        totalBusinesses: businessCount || 0,
        totalPosts: postCount || 0,
        pendingClaims: claimCount || 0,
        featuredBusinesses: featuredRes.count || 0,
        verifiedBusinesses: verifiedCount || 0
      };
    } catch (err) {
      console.error('Error fetching summary:', err);
      return { totalBusinesses: 0, totalPosts: 0, pendingClaims: 0, featuredBusinesses: 0, verifiedBusinesses: 0 };
    } finally {
      setLoading(false);
    }
  };

  const searchBusinesses = async (filters: { name?: string; phone?: string; category?: string; governorate?: string }) => {
    setLoading(true);
    try {
      let query = supabase.from('businesses').select('*');
      
      if (filters.name) query = query.ilike('name', `%${filters.name}%`);
      if (filters.phone) {
        query = query.or(`phone.ilike.%${filters.phone}%,phone_1.ilike.%${filters.phone}%,phone_2.ilike.%${filters.phone}%`);
      }
      if (filters.category) query = query.eq('category', filters.category);
      if (filters.governorate) query = query.eq('governorate', filters.governorate);

      const { data, error: fetchError } = await query.limit(100);
      if (fetchError) throw fetchError;
      
      return (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        nameAr: item.name_ar,
        nameKu: item.name_ku,
        category: item.category,
        governorate: item.governorate,
        city: item.city,
        address: item.address,
        phone: item.phone,
        phone_1: item.phone_1,
        phone_2: item.phone_2,
        rating: item.rating || 0,
        reviewCount: item.review_count || 0,
        isFeatured: item.is_featured || false,
        isVerified: item.is_verified || false,
        image: item.image_url || item.image,
        image_url: item.image_url,
        website: item.website,
        socialLinks: item.social_links || {},
        description: item.description,
        descriptionAr: item.description_ar,
        openingHours: item.opening_hours,
        ownerId: item.owner_id,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at || item.created_at)
      })) as Business[];
    } catch (err) {
      console.error('Error searching businesses:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updateBusiness = async (id: string, updates: any) => {
    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('businesses')
        .update(updates)
        .eq('id', id);
      if (updateError) throw updateError;
      return true;
    } catch (err) {
      console.error('Error updating business:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchClaimRequests = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('claim_requests')
        .select(`
          *,
          business:businesses(name),
          profiles:profiles(full_name, email)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      return data as ClaimRequest[];
    } catch (err) {
      console.error('Error fetching claim requests:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleClaimAction = async (requestId: string, businessId: string, userId: string, action: 'approve' | 'reject', verify = false) => {
    setLoading(true);
    try {
      if (action === 'approve') {
        // 1. Update business owner and verification status
        const { error: bizError } = await supabase
          .from('businesses')
          .update({ 
            owner_id: userId,
            is_verified: verify
          })
          .eq('id', businessId);
        
        if (bizError) throw bizError;

        // 2. Update claim request status
        const { error: reqError } = await supabase
          .from('claim_requests')
          .update({ status: 'approved' })
          .eq('id', requestId);
        
        if (reqError) throw reqError;
      } else {
        // Just reject the request
        const { error: reqError } = await supabase
          .from('claim_requests')
          .update({ status: 'rejected' })
          .eq('id', requestId);
        
        if (reqError) throw reqError;
      }
      return true;
    } catch (err) {
      console.error(`Error ${action}ing claim:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (filters: { businessId?: string; category?: string; governorate?: string }) => {
    setLoading(true);
    try {
      let query = supabase.from('posts').select(`
        *,
        business:businesses(name, category, governorate)
      `);

      if (filters.businessId) query = query.eq('business_id', filters.businessId);
      
      const { data, error: fetchError } = await query.order('created_at', { ascending: false }).limit(100);
      if (fetchError) throw fetchError;

      return data.map((item: any) => ({
        id: item.id,
        businessId: item.business_id,
        title: item.title,
        content: item.content,
        caption: item.caption || item.content,
        image: item.image_url || item.image,
        image_url: item.image_url,
        likes: item.likes || 0,
        views: item.views || 0,
        createdAt: new Date(item.created_at),
        isVerified: item.is_verified || false,
        businessName: item.business?.name,
        businessCategory: item.business?.category,
        businessGovernorate: item.business?.governorate,
        status: item.status || 'visible'
      }));
    } catch (err) {
      console.error('Error fetching posts:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updatePost = async (id: string, updates: any) => {
    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', id);
      if (updateError) throw updateError;
      return true;
    } catch (err) {
      console.error('Error updating post:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBusiness = async (id: string) => {
    setLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from('businesses')
        .delete()
        .eq('id', id);
      if (deleteError) throw deleteError;
      return true;
    } catch (err) {
      console.error('Error deleting business:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: { 
    businessId?: string; 
    title?: string; 
    content: string; 
    caption?: string; 
    image_url?: string; 
    likes?: number; 
    views?: number;
    status?: 'visible' | 'hidden';
  }) => {
    setLoading(true);
    try {
      const { error: createError } = await supabase
        .from('posts')
        .insert([{
          business_id: postData.businessId,
          title: postData.title,
          content: postData.content,
          caption: postData.caption,
          image_url: postData.image_url,
          likes: postData.likes || 0,
          views: postData.views || 0,
          status: postData.status || 'visible',
          created_at: new Date().toISOString()
        }]);
      if (createError) throw createError;
      return true;
    } catch (err) {
      console.error('Error creating post:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const bulkUploadBusinesses = async (businesses: any[]) => {
    setLoading(true);
    try {
      // Filter out existing by phone or name (simple check)
      // In a real app, we might want a more complex upsert or check
      const { error: uploadError } = await supabase
        .from('businesses')
        .insert(businesses);
      
      if (uploadError) throw uploadError;
      return true;
    } catch (err) {
      console.error('Error bulk uploading:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchSummary,
    searchBusinesses,
    updateBusiness,
    deleteBusiness,
    fetchClaimRequests,
    handleClaimAction,
    fetchPosts,
    updatePost,
    createPost,
    bulkUploadBusinesses
  };
}
