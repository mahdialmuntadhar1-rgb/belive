import React from 'react';
import { Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useAdminDB, AdminPost } from '@/hooks/useAdminDB';
import ImageUploader from './ImageUploader';
import { canAccessBuildMode } from '@/lib/buildModeAccess';

interface PostItemEditorProps {
  item: AdminPost;
  index: number;
  totalCount: number;
}

export default function PostItemEditor({ item, index, totalCount }: PostItemEditorProps) {
  const { deletePost, updatePost, reorderPost } = useAdminDB();

  if (!canAccessBuildMode()) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group">
      <div className="aspect-square relative bg-slate-50">
        <img src={item.image_url} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button 
            onClick={() => deletePost(item.id)}
            className="p-2 bg-white text-red-500 rounded-xl hover:scale-110 transition-transform"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex flex-col gap-3">
          <ImageUploader 
            value={item.image_url}
            onChange={(url) => updatePost(item.id, { image_url: url })}
            onUrlChange={(url) => updatePost(item.id, { image_url: url })}
            label="Post Image"
            folder="posts"
          />
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Author Name</label>
            <input 
              type="text"
              value={item.author_name || ''}
              onChange={(e) => updatePost(item.id, { author_name: e.target.value })}
              placeholder="e.g. Belive Directory"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-medium focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Caption</label>
            <textarea 
              value={item.caption || ''}
              onChange={(e) => updatePost(item.id, { caption: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-medium min-h-[60px]"
            />
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={item.is_active} 
                onChange={(e) => updatePost(item.id, { is_active: e.target.checked })}
                id={`active-${item.id}`}
              />
              <label htmlFor={`active-${item.id}`} className="text-[10px] font-bold text-slate-500">Active</label>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={item.is_featured} 
                onChange={(e) => updatePost(item.id, { is_featured: e.target.checked })}
                id={`featured-${item.id}`}
              />
              <label htmlFor={`featured-${item.id}`} className="text-[10px] font-bold text-slate-500">Featured</label>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          <div className="flex items-center gap-1">
            <button 
              onClick={() => reorderPost(item.id, 'up')}
              disabled={index === 0}
              className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 disabled:opacity-20"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => reorderPost(item.id, 'down')}
              disabled={index === totalCount - 1}
              className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 disabled:opacity-20"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Post {index + 1}</span>
        </div>
      </div>
    </div>
  );
}
