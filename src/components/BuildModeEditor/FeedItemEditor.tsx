import React from 'react';
import { Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useBuildMode } from '@/hooks/useBuildMode';
import { FeedItem } from '@/types/buildMode';
import ImageUploader from './ImageUploader';

interface FeedItemEditorProps {
  item: FeedItem;
  index: number;
  totalCount: number;
}

export default function FeedItemEditor({ item, index, totalCount }: FeedItemEditorProps) {
  const { deleteFeedItem, updateFeedItem, reorderFeedItems } = useBuildMode();

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group">
      <div className="aspect-video relative bg-slate-50">
        <img src={item.image} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button 
            onClick={() => deleteFeedItem(item.id)}
            className="p-2 bg-white text-red-500 rounded-xl hover:scale-110 transition-transform"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex flex-col gap-3">
          <ImageUploader 
            value={item.image}
            onChange={(base64) => updateFeedItem(item.id, { image: base64 })}
            onUrlChange={(url) => updateFeedItem(item.id, { image: url })}
            label="Feed Image"
          />
          <div className="space-y-2">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Caption</label>
            <textarea 
              value={item.caption || ''}
              onChange={(e) => updateFeedItem(item.id, { caption: e.target.value })}
              placeholder="Write a caption..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-medium min-h-[60px] focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Author Name</label>
              <input 
                type="text"
                value={item.authorName || ''}
                onChange={(e) => updateFeedItem(item.id, { authorName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Author Avatar URL</label>
              <input 
                type="text"
                value={item.authorAvatar || ''}
                onChange={(e) => updateFeedItem(item.id, { authorAvatar: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-medium"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          <div className="flex items-center gap-1">
            <button 
              onClick={() => reorderFeedItems(item.id, 'up')}
              disabled={index === 0}
              className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 disabled:opacity-20"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => reorderFeedItems(item.id, 'down')}
              disabled={index === totalCount - 1}
              className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 disabled:opacity-20"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Item {index + 1}</span>
        </div>
      </div>
    </div>
  );
}
