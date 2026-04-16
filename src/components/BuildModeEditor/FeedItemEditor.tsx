import React from 'react';
import { Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useAdminDB, AdminFeedSection } from '@/hooks/useAdminDB';
import ImageUploader from './ImageUploader';
import { canAccessBuildMode } from '@/lib/buildModeAccess';

interface FeedItemEditorProps {
  item: AdminFeedSection;
  index: number;
  totalCount: number;
}

export default function FeedItemEditor({ item, index, totalCount }: FeedItemEditorProps) {
  const { deleteFeedSection, updateFeedSection, reorderFeedSection } = useAdminDB();

  if (!canAccessBuildMode()) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group">
      <div className="aspect-video relative bg-slate-50">
        <img src={item.image_url} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button 
            onClick={() => deleteFeedSection(item.id)}
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
            onChange={(url) => updateFeedSection(item.id, { image_url: url })}
            onUrlChange={(url) => updateFeedSection(item.id, { image_url: url })}
            label="Feed Block Image"
            folder="feed"
          />
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
            <input 
              type="text"
              value={item.title || ''}
              onChange={(e) => updateFeedSection(item.id, { title: e.target.value })}
              placeholder="e.g. Featured Section"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-medium focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Subtitle</label>
            <input 
              type="text"
              value={item.subtitle || ''}
              onChange={(e) => updateFeedSection(item.id, { subtitle: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-medium"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Content / Body</label>
            <textarea 
              value={item.content || ''}
              onChange={(e) => updateFeedSection(item.id, { content: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-medium min-h-[60px]"
            />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input 
              type="checkbox" 
              checked={item.visibility} 
              onChange={(e) => updateFeedSection(item.id, { visibility: e.target.checked })}
              id={`visibility-${item.id}`}
            />
            <label htmlFor={`visibility-${item.id}`} className="text-[10px] font-bold text-slate-500">Visible to Public</label>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          <div className="flex items-center gap-1">
            <button 
              onClick={() => reorderFeedSection(item.id, 'up')}
              disabled={index === 0}
              className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 disabled:opacity-20"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => reorderFeedSection(item.id, 'down')}
              disabled={index === totalCount - 1}
              className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 disabled:opacity-20"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Section {index + 1}</span>
        </div>
      </div>
    </div>
  );
}
