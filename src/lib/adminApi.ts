import { supabase } from './supabaseClient';

export interface AdminStats {
  total: number;
  verified: number;
  unverified: number;
  featured: number;
  posts: number;
}

export interface Business {
  id: string;
  name: string;
  category: string;
  location?: string;
  description?: string;
  is_verified: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AppSettings {
  id: string;
  hero_title_ar: string;
  hero_subtitle_ar: string;
  hero_image_url?: string;
  featured_label: string;
  trending_label: string;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  updated_at: string;
}

export interface Post {
  id: string;
  business_id?: string;
  content: string;
  image_url?: string;
  is_featured: boolean;
  is_trending: boolean;
  created_at: string;
  updated_at: string;
}

// Check if current user is admin
export async function checkAdminAccess(): Promise<{ isAdmin: boolean; userId?: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { isAdmin: false, error: 'Not authenticated' };
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error checking admin role:', error);
      return { isAdmin: false, error: error.message };
    }

    return { isAdmin: profile?.role === 'admin', userId: user.id };
  } catch (error) {
    console.error('Error checking admin access:', error);
    return { isAdmin: false, error: 'Failed to check admin access' };
  }
}

// Fetch all businesses
export async function fetchBusinesses(): Promise<{ data: Business[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching businesses:', error);
      return { data: [], error: error.message };
    }

    return { data: data as Business[] || [] };
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return { data: [], error: 'Failed to fetch businesses' };
  }
}

// Fetch admin stats
export async function fetchAdminStats(): Promise<{ data: AdminStats; error?: string }> {
  try {
    const [businessesResult, postsResult] = await Promise.all([
      supabase.from('businesses').select('id, is_verified, is_featured'),
      supabase.from('posts').select('id')
    ]);

    if (businessesResult.error) {
      console.error('Error fetching businesses stats:', businessesResult.error);
      return { data: { total: 0, verified: 0, unverified: 0, featured: 0, posts: 0 }, error: businessesResult.error.message };
    }

    if (postsResult.error) {
      console.error('Error fetching posts stats:', postsResult.error);
      // Continue with businesses data even if posts fail
    }

    const businesses = businessesResult.data || [];
    const posts = postsResult.data || [];

    const total = businesses.length;
    const verified = businesses.filter((b: any) => b.is_verified).length;
    const unverified = total - verified;
    const featured = businesses.filter((b: any) => b.is_featured).length;
    const postsCount = posts.length;

    return { data: { total, verified, unverified, featured, posts: postsCount } };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { data: { total: 0, verified: 0, unverified: 0, featured: 0, posts: 0 }, error: 'Failed to fetch stats' };
  }
}

// Update business
export async function updateBusiness(id: string, updates: Partial<Business>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating business:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating business:', error);
    return { success: false, error: 'Failed to update business' };
  }
}

// Toggle business verification
export async function toggleBusinessVerification(id: string, isVerified: boolean): Promise<{ success: boolean; error?: string }> {
  return updateBusiness(id, { is_verified: isVerified });
}

// Toggle business featured status
export async function toggleBusinessFeatured(id: string, isFeatured: boolean): Promise<{ success: boolean; error?: string }> {
  return updateBusiness(id, { is_featured: isFeatured });
}

// Delete business
export async function deleteBusiness(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting business:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting business:', error);
    return { success: false, error: 'Failed to delete business' };
  }
}

// ============================================
// APP SETTINGS FUNCTIONS
// ============================================

// Fetch app settings
export async function fetchAppSettings(): Promise<{ data: AppSettings | null; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching app settings:', error);
      return { data: null, error: error.message };
    }

    return { data: data as AppSettings };
  } catch (error) {
    console.error('Error fetching app settings:', error);
    return { data: null, error: 'Failed to fetch app settings' };
  }
}

// Update app settings
export async function updateAppSettings(updates: Partial<AppSettings>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('app_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', '00000000-0000-0000-0000-000000000001');

    if (error) {
      console.error('Error updating app settings:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating app settings:', error);
    return { success: false, error: 'Failed to update app settings' };
  }
}

// ============================================
// POSTS FUNCTIONS (Shaku Maku Feed)
// ============================================

// Fetch all posts
export async function fetchPosts(): Promise<{ data: Post[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return { data: [], error: error.message };
    }

    return { data: data as Post[] || [] };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { data: [], error: 'Failed to fetch posts' };
  }
}

// Create post
export async function createPost(post: Omit<Post, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: Post; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert(post)
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Post };
  } catch (error) {
    console.error('Error creating post:', error);
    return { success: false, error: 'Failed to create post' };
  }
}

// Update post
export async function updatePost(id: string, updates: Partial<Post>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('posts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating post:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating post:', error);
    return { success: false, error: 'Failed to update post' };
  }
}

// Toggle post featured status
export async function togglePostFeatured(id: string, isFeatured: boolean): Promise<{ success: boolean; error?: string }> {
  return updatePost(id, { is_featured: isFeatured });
}

// Toggle post trending status
export async function togglePostTrending(id: string, isTrending: boolean): Promise<{ success: boolean; error?: string }> {
  return updatePost(id, { is_trending: isTrending });
}

// Delete post
export async function deletePost(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting post:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting post:', error);
    return { success: false, error: 'Failed to delete post' };
  }
}

// ============================================
// IMAGE UPLOAD FUNCTIONS
// ============================================

// Upload image to Supabase Storage
export async function uploadImage(
  file: File,
  bucket: 'hero-images' | 'post-images' | 'business-media',
  path?: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const fileName = path || `${Date.now()}-${file.name}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error uploading image:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { success: false, error: 'Failed to upload image' };
  }
}

// Delete image from Supabase Storage
export async function deleteImage(
  url: string,
  bucket: 'hero-images' | 'post-images' | 'business-media'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract file path from URL
    const urlParts = url.split('/');
    const filePath = urlParts[urlParts.length - 1];

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting image:', error);
    return { success: false, error: 'Failed to delete image' };
  }
}
