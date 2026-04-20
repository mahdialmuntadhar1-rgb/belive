import React, { useState, useRef } from "react";
import { Pencil, Loader2, X } from "lucide-react";
import { useBuildMode } from "@/hooks/useBuildMode";
import { useHomeStore } from "@/stores/homeStore";
import { supabase } from "@/lib/supabaseClient";
import { Post } from "@/lib/supabase";

interface EditablePostProps {
  post: Post;
  onUpdate: (updated: Post) => void;
  children: React.ReactNode;
}

export default function EditablePost({
  post,
  onUpdate,
  children,
}: EditablePostProps) {
  const { isBuildModeEnabled } = useBuildMode();
  const { language } = useHomeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newCaption, setNewCaption] = useState(post.content);
  const [isUploading, setIsUploading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleCaptionSave = async () => {
    try {
      await supabase.from("posts").update({ content: newCaption }).eq("id", post.id);
      onUpdate({ ...post, content: newCaption });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save post caption:', err);
      alert(language === "ar" ? "خطأ في الحفظ" : "Error saving caption");
      setNewCaption(post.content);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (typeof file === "undefined" || file === null) return;

    setIsUploading(true);
    try {
      const timestamp = Date.now();
      const fileName = `post-${timestamp}`;

      await supabase.storage.from("feed-images").upload(fileName, file);
      const { data: { publicUrl } } = supabase.storage
        .from("feed-images")
        .getPublicUrl(fileName);

      await supabase.from("posts").update({ image_url: publicUrl }).eq("id", post.id);
      onUpdate({ ...post, image_url: publicUrl });
    } catch (err) {
      console.error('Failed to upload post image:', err);
      alert(language === "ar" ? "خطأ في تحميل الصورة" : "Error uploading image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    const msg = language === "ar" ? "هل تريد الحذف؟" : "Delete?";
    if (confirm(msg) === false) return;
    try {
      await supabase.from("posts").delete().eq("id", post.id);
      onUpdate({ ...post, id: "" });
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert(language === "ar" ? "خطأ في الحذف" : "Error deleting post");
    }
  };

  return (
    <div
      className={isBuildModeEnabled ? "relative group" : ""}
      onMouseEnter={() =>
        isBuildModeEnabled && setIsHovering(true)
      }
      onMouseLeave={() =>
        isBuildModeEnabled && setIsHovering(false)
      }
    >
      {children}

      {isBuildModeEnabled && isHovering && (
        <div className="absolute top-4 right-4 z-20 flex gap-2 bg-white/95 backdrop-blur-sm p-2 rounded-2xl shadow-lg">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4 text-[#0F7B6C]" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading === true}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            {isUploading === true ? (
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            ) : (
              <Pencil className="w-4 h-4 text-blue-500" />
            )}
          </button>
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}

      {isEditing === true && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] p-8 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-black text-[#111827] mb-4">
              {language === "ar" ? "تحرير" : "Edit"}
            </h3>
            <textarea
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              className="w-full h-24 p-4 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F7B6C] resize-none"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg font-bold hover:bg-slate-50"
              >
                {language === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={handleCaptionSave}
                className="flex-1 px-4 py-2 bg-[#0F7B6C] text-white rounded-lg font-bold hover:bg-[#0d6857]"
              >
                {language === "ar" ? "حفظ" : "Save"}
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
