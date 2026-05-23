import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Pencil, Loader2, Check, AlertCircle, Upload } from 'lucide-react';
import { useImageEdit } from '@/hooks/useImageEdit';
import { useBuildModeContext } from '@/contexts/BuildModeContext';

interface EditableImageProps {
  src: string;
  alt?: string;
  className?: string;
  folder?: 'hero' | 'feed' | 'business' | 'general';
  onSave: (newUrl: string) => void;
  isAdmin: boolean;
  children?: React.ReactNode;
}

export function EditableImage({
  src,
  alt = "",
  className = "",
  folder = "general",
  onSave,
  isAdmin,
  children
}: EditableImageProps) {
  const { isEditingEnabled } = useBuildModeContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    isUploading,
    error,
    uploadImage
  } = useImageEdit(src, (url) => {
    onSave(url);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  }, folder);

  // Sync internal error with timeout
  useEffect(() => {
    if (error) {
      setLocalError(error);
      const timer = setTimeout(() => setLocalError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadImage(file);
      } catch (err) {
        // Error is handled via useImageEdit's error state
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isAdmin && isEditingEnabled && !isUploading) {
      e.preventDefault();
      e.stopPropagation();
      fileInputRef.current?.click();
    }
  };

  // If not admin or editing is disabled, render cleanly
  if (!isAdmin || !isEditingEnabled) {
    if (children) return <>{children}</>;
    return (
      <img 
        src={src} 
        alt={alt} 
        className={className} 
        referrerPolicy="no-referrer" 
      />
    );
  }

  const content = children || (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      referrerPolicy="no-referrer" 
    />
  );

  return (
    <div className="relative group cursor-pointer overflow-hidden border-2 border-transparent hover:border-[#0F7B6C] transition-all rounded-inherit" onClick={handleClick}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Main Content */}
      <div className={`${isUploading ? 'opacity-50 grayscale' : ''} transition-all duration-500`}>
        {content}
      </div>

      {/* Floating Action Button - Always visible to admin */}
      <div className="absolute top-3 right-3 z-20">
        <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg border border-[#0F7B6C]/20 text-[#0F7B6C] hover:scale-110 transition-transform">
          <Pencil size={16} />
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2 pointer-events-none">
        <div className="bg-[#0F7B6C] p-3 rounded-full">
          <Upload size={24} />
        </div>
        <span className="font-black text-sm uppercase tracking-tighter poppins-bold">
          استبدال الصورة
        </span>
      </div>

      {/* Uploading State Overlay */}
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-white gap-3"
          >
            <Loader2 className="animate-spin text-[#0F7B6C]" size={32} />
            <span className="text-sm font-bold poppins-bold">جاري الرفع...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success State Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 bg-[#0F7B6C]/80 z-40 flex items-center justify-center text-white"
          >
            <motion.div
              initial={{ rotate: -45 }}
              animate={{ rotate: 0 }}
              className="bg-white text-[#0F7B6C] p-2 rounded-full shadow-2xl"
            >
              <Check size={32} strokeWidth={4} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State Overlay */}
      <AnimatePresence>
        {localError && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="absolute bottom-4 left-4 right-4 bg-red-600 text-white p-3 rounded-xl z-50 flex items-center gap-2 shadow-2xl border border-white/20"
          >
            <AlertCircle size={18} />
            <span className="text-[10px] sm:text-xs font-bold leading-tight flex-1">
              {localError}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
