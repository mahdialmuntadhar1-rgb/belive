import React, { useState, useRef } from "react";
import { Plus, Upload, Loader2, X } from "lucide-react";
import { useBuildMode } from "@/hooks/useBuildMode";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { Post } from "@/lib/supabase";

interface AddPostButtonProps {
  onPostCreated: (post: Post) => void;
}

export default function AddPostButton({ onPostCreated }: AddPostButtonProps) {
  const { isBuildModeEnabled } = useBuildMode();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  if (!isBuildModeEnabled) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (typeof file === "undefined" || file === null) return;
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (evt) => setImagePreview(evt.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async () => {
    if (!caption.trim() || !selectedImage) return;
    setIsCreating(true);
    try {
      const fileName = `post-${Date.now()}`;
      await supabase.storage.from("feed-images").upload(fileName, selectedImage);
      const { data: { publicUrl } } = supabase.storage.from("feed-images").getPublicUrl(fileName);

      const insertData: any = {
        content: caption,
        image_url: publicUrl,
        user_id: user?.id,
        status: "published",
        created_at: new Date().toISOString(),
        likes: 0,
      };

      const { data } = await supabase.from("posts").insert([insertData]).select().single();
      onPostCreated({
        id: data.id,
        content: caption,
        image: publicUrl,
        likes: 0,
        createdAt: data.created_at,
        businessId: user?.id || "",
        authorName: user?.email?.split("@")[0] || "User",
        authorAvatar: "",
      } as Post);
      setCaption("");
      setSelectedImage(null);
      setImagePreview("");
      setIsOpen(false);
    } catch (err) {
      alert("Error creating post");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-40 w-16 h-16 bg-[#0F7B6C] text-white rounded-full flex items-center justify-center shadow-lg"
      >
        <Plus className="w-8 h-8" />
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black">New Post</h3>
              <button onClick={() => setIsOpen(false)} className="p-2">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-6">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-2xl" />
                  <button onClick={() => {
                    setImagePreview("");
                    setSelectedImage(null);
                  }} className="absolute top-2 right-2 p-2 bg-white rounded-lg">
                    <X className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              ) : (
                <button onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center gap-3">
                  <Upload className="w-8 h-8 text-slate-400" />
                  <p className="text-sm font-bold">Click to upload</p>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-black mb-2">Caption</label>
              <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Add caption..." className="w-full h-32 p-4 border border-slate-200 rounded-xl" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsOpen(false)} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-bold">Cancel</button>
              <button onClick={handleCreatePost} disabled={isCreating || !caption.trim() || !selectedImage} className="flex-1 px-4 py-3 bg-[#0F7B6C] text-white rounded-xl font-bold">
                {isCreating ? "Creating..." : "Publish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
