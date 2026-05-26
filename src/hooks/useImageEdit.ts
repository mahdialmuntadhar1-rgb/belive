import { useState } from 'react';
import { uploadApi } from '@/lib/api';

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
    try {
      const publicUrl = await uploadApi.image(file, folder);
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
