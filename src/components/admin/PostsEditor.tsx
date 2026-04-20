import React, { useState } from 'react';
import { Loader2, Upload, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAdminStorage } from '@/hooks/useAdminStorage';
import { Post } from '@/lib/supabase';

interface PostsEditorProps {
  posts: Post[];
  onUpdate: (posts: Post[]) => void;
}

export default function PostsEditor({ posts, onUpdate }: PostsEditorProps) {
  const { uploadImage, isUploading } = useAdminStorage();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Post> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEdit = (post: Post) => {
    setEditingId(post.id);
    setFormData({ ...post });
  };

  const startNew = () => {
    const newId = `temp-${Date.now()}`;
    setEditingId(newId);
    setFormData({
      id: newId,
      content: '',
      likes: 0,
      status: 'visible',
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const publicUrl = await uploadImage(file, {
      bucket: 'assets',
      folder: 'posts',
    });

    if (publicUrl) {
      setFormData(prev => ({ ...prev, image: publicUrl }));
    }
  };

  const savePost = async () => {
    if (!formData || !editingId) return;
    setIsLoading(true);
    setError(null);

    try {
      if (editingId.startsWith('temp-')) {
        // New post
        const { data, error: insertErr } = await supabase
          .from('posts')
          .insert([
            {
              content: formData.content,
              image_url: formData.image,
              title: formData.title,
              likes: formData.likes || 0,
              status: formData.status || 'visible',
              created_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (insertErr) throw insertErr;
        onUpdate([...posts, data as Post]);
      } else {
        // Update existing
        const { error: updateErr } = await supabase
          .from('posts')
          .update({
            content: formData.content,
            image_url: formData.image,
            title: formData.title,
            status: formData.status,
          })
          .eq('id', editingId);

        if (updateErr) throw updateErr;

        const updated = posts.map(p =>
          p.id === editingId ? { ...p, ...formData } as Post : p
        );
        onUpdate(updated);
      }

      setEditingId(null);
      setFormData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Delete this post?')) return;
    setIsLoading(true);

    try {
      const { error: deleteErr } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (deleteErr) throw deleteErr;

      onUpdate(posts.filter(p => p.id !== postId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (editingId && formData) {
    return (
      <div className="space-y-4">
        {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

        <div>
          <label className="block text-sm font-bold mb-2">Post Image</label>
          <div className="relative">
            {formData.image && (
              <img
                src={formData.image}
                alt="Post"
                className="w-full h-48 object-cover rounded-lg mb-2"
              />
            )}
            <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              <Upload className="w-5 h-5" />
              <span className="text-sm font-bold">Upload Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">Title (Optional)</label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Post title..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">Content / Caption</label>
          <textarea
            value={formData.content || ''}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Write your post..."
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1">Status</label>
            <select
              value={formData.status || 'visible'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Likes</label>
            <input
              type="number"
              value={formData.likes || 0}
              onChange={(e) => setFormData({ ...formData, likes: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={() => {
              setEditingId(null);
              setFormData(null);
            }}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg font-bold hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={savePost}
            disabled={isLoading || isUploading}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading || isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Post'
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Feed Posts ({posts.length})</h3>
        <button
          onClick={startNew}
          className="flex items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600"
        >
          <Plus className="w-4 h-4" />
          New
        </button>
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
          >
            {post.image && (
              <img
                src={post.image}
                alt="Post"
                className="w-12 h-12 object-cover rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">
                {post.title || post.content?.substring(0, 50) || 'Untitled'}
              </p>
              <p className="text-xs text-slate-600">
                {post.status === 'visible' ? '✓ Visible' : '✗ Hidden'} • {post.likes || 0} likes
              </p>
            </div>
            <button
              onClick={() => startEdit(post)}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm font-bold hover:bg-blue-600"
            >
              Edit
            </button>
            <button
              onClick={() => deletePost(post.id)}
              disabled={isLoading}
              className="p-2 hover:bg-red-50 rounded text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
