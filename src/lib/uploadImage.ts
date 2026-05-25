import { supabase } from './supabaseClient';

export async function uploadImageToSupabase(
  file: File,
  folder: string = 'general'
): Promise<string> {
  // Validate file
  if (!file || !(file instanceof File)) {
    throw new Error('Invalid file provided');
  }

  // Create a unique filename
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 10);
  const fileName = `${timestamp}-${randomId}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  // Upload to Supabase Storage bucket
  const { data, error } = await supabase.storage
    .from('belive-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('[uploadImage] Supabase upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('belive-images')
    .getPublicUrl(filePath);

  if (!urlData?.publicUrl) {
    throw new Error('Failed to get public URL for uploaded image');
  }

  console.log('[uploadImage] Uploaded to:', urlData.publicUrl);
  return urlData.publicUrl;
}

export async function deleteImageFromSupabase(url: string): Promise<void> {
  try {
    const bucketName = 'belive-images';
    // Use getPublicUrl to derive the bucket prefix without accessing protected supabaseUrl
    const { data: { publicUrl: bucketUrlPrefix } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(''); // Empty path gives us the base URL

    let filePath: string;

    if (url.startsWith(bucketUrlPrefix)) {
      filePath = url.replace(bucketUrlPrefix, '');
    } else if (url.startsWith(`${bucketName}/`)) {
      filePath = url.replace(`${bucketName}/`, '');
    } else {
      console.warn('[uploadImage] URL does not match bucket, skipping delete:', url);
      return;
    }

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('[uploadImage] Delete error:', error);
      throw new Error(`Delete failed: ${error.message}`);
    }

    console.log('[uploadImage] Deleted:', filePath);
  } catch (err) {
    console.error('[uploadImage] Error deleting image:', err);
    throw err;
  }
}
