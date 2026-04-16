/**
 * ADMIN ONLY - Image Uploader component for Build Mode
 * Uploads images to Supabase Storage via useAdminDB
 */

import React from 'react';
import { Upload } from 'lucide-react';
import { useAdminDB } from '@/hooks/useAdminDB';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  onUrlChange: (url: string) => void;
  label?: string;
  folder?: 'hero' | 'feed' | 'posts' | 'businesses';
}

export default function ImageUploader({ value, onChange, onUrlChange, label = "Image", folder = 'hero' }: ImageUploaderProps) {
  const { uploadImage, loading } = useAdminDB();
  const [isUploading, setIsUploading] = React.useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit file size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Please choose an image under 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      const publicUrl = await uploadImage(file, folder);
      onChange(publicUrl);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload image to Supabase');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="flex gap-3">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative">
          {isUploading ? (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : null}
          <img src={value} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
        </div>
        <div className="flex-1 space-y-2">
          <label className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors shadow-sm">
            {isUploading ? 'Uploading...' : (
              <>
                <Upload className="w-3.5 h-3.5" />
                Upload Photo
              </>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
          </label>
          <input 
            type="text"
            value={value}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="Or paste URL..."
            className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-[9px] font-medium focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}
