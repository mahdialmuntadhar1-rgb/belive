import React, { useState, useRef } from 'react';
import { Pencil, Loader2, X } from 'lucide-react';
import { useBuildMode } from '@/hooks/useBuildMode';
import { useHomeStore } from '@/stores/homeStore';
import { supabase } from '@/lib/supabaseClient';
import { Business } from '@/lib/supabase';

interface EditableBusinessCardProps {
  business: Business;
  onUpdate: (updated: Business) => void;
  children: React.ReactNode;
}

export default function EditableBusinessCard({
  business,
  onUpdate,
  children,
}: EditableBusinessCardProps) {
  const { isBuildModeEnabled } = useBuildMode();
  const { language } = useHomeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [editData, setEditData] = useState({
    name: business.name,
    phone: business.phone || '',
  });

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('businesses')
        .update({
          name: editData.name,
          phone: editData.phone,
        })
        .eq('id', business.id);

      if (error) throw error;

      onUpdate({
        ...business,
        name: editData.name,
        phone: editData.phone,
      });

      setIsEditing(false);
    } catch (err) {
      console.error('Error updating business:', err);
      alert(language === 'ar' ? 'خطأ في التحديث' : 'Error updating business');
      setEditData({ name: business.name, phone: business.phone || '' });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const timestamp = Date.now();
      const fileName = `business-${timestamp}-${Math.random().toString(36).substr(2, 9)}`;

      const { error } = await supabase.storage
        .from('business-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('business-images')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('businesses')
        .update({ image_url: publicUrl })
        .eq('id', business.id);

      if (updateError) throw updateError;

      onUpdate({ ...business, image: publicUrl });
    } catch (err) {
      console.error('Error uploading image:', err);
      alert(language === 'ar' ? 'خطأ في تحميل الصورة' : 'Error uploading image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className={`relative ${isBuildModeEnabled ? 'group' : ''}`}
      onMouseEnter={() => isBuildModeEnabled && setIsHovering(true)}
      onMouseLeave={() => isBuildModeEnabled && setIsHovering(false)}
    >
      {children}

      {/* Edit Buttons */}
      {isBuildModeEnabled && isHovering && (
        <div className="absolute top-4 right-4 z-20 flex gap-2 bg-white/95 backdrop-blur-sm p-2 rounded-2xl shadow-lg">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title={language === 'ar' ? 'تحرير' : 'Edit'}
          >
            <Pencil className="w-4 h-4 text-[#0F7B6C]" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            title={language === 'ar' ? 'تغيير الصورة' : 'Change image'}
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            ) : (
              <Pencil className="w-4 h-4 text-blue-500" />
            )}
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-8 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-black text-[#111827] mb-6">
              {language === 'ar' ? 'تحرير المشروع' : 'Edit Business'}
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-[#111827] mb-2">
                  {language === 'ar' ? 'الاسم' : 'Name'}
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F7B6C]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#111827] mb-2">
                  {language === 'ar' ? 'الهاتف' : 'Phone'}
                </label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) =>
                    setEditData({ ...editData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F7B6C]"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditData({ name: business.name, phone: business.phone || '' });
                }}
                className="flex-1 px-4 py-2 border border-slate-200 text-[#111827] rounded-lg hover:bg-slate-50 transition-colors font-bold"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-[#0F7B6C] text-white rounded-lg hover:bg-[#0d6857] transition-colors font-bold"
              >
                {language === 'ar' ? 'حفظ' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}
