/**
 * // BUILD MODE ONLY
 * Modular Image Uploader component for Build Mode.
 */

import React from 'react';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (base64: string) => void;
  onUrlChange: (url: string) => void;
  label?: string;
}

import { canAccessBuildMode } from '@/lib/buildModeAccess';

export default function ImageUploader({ value, onChange, onUrlChange, label = "Image" }: ImageUploaderProps) {
  if (!canAccessBuildMode()) return null;

  const [isUploading, setIsUploading] = React.useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit file size to 5MB before processing
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Please choose an image under 5MB.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Max dimensions for hero image to keep base64 size reasonable
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress as JPEG with 0.7 quality
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          onChange(compressedBase64);
        } else {
          onChange(reader.result as string);
        }
        setIsUploading(false);
      };
      img.onerror = () => {
        setIsUploading(false);
        alert('Failed to load image');
      };
      img.src = reader.result as string;
    };
    reader.onerror = () => {
      setIsUploading(false);
      alert('Upload failed');
    };
    reader.readAsDataURL(file);
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
