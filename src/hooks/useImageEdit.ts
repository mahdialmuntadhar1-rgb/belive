import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useImageEdit(
  imageUrl: string,
  onSave: (newUrl: string) => void,
  folder: 'hero' | 'feed' | 'business' | 'general' = 'general'
) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openEditor = () => setIsEditing(true);
  const closeEditor = () => {
    setIsEditing(false);
    setError(null);
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    setError(null);

    const path = `${folder}/${Date.now()}-${file.name}`;

    try {
      const { data, error: uploadError } = await supabase.storage
        .from('build-mode-images')
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('build-mode-images')
        .getPublicUrl(path);

      onSave(publicUrl);
      return publicUrl;
    } catch (err: any) {
      const errorMessage = err.message || 'فشل رفع الصورة';
      setError(errorMessage);
      console.error('Error uploading image:', err);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isEditing,
    openEditor,
    closeEditor,
    isUploading,
    error,
    uploadImage
  };
}
