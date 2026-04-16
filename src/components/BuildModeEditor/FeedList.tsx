import React from 'react';
import { Plus } from 'lucide-react';
import { useAdminDB } from '@/hooks/useAdminDB';
import FeedItemEditor from './FeedItemEditor';
import { canAccessBuildMode } from '@/lib/buildModeAccess';

export default function FeedList() {
  if (!canAccessBuildMode()) return null;

  const { feedSections, addFeedSection } = useAdminDB();

  const handleAdd = () => {
    addFeedSection({
      title: 'New Feed Section',
      subtitle: 'Optional subtitle',
      content: '',
      image_url: 'https://images.unsplash.com/photo-1501339819398-ee49a94b016f?q=80&w=800&auto=format&fit=crop',
      visibility: true,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {feedSections.map((item, index) => (
          <div key={item.id}>
            <FeedItemEditor 
              item={item} 
              index={index} 
              totalCount={feedSections.length} 
            />
          </div>
        ))}
      </div>
      
      <button 
        onClick={handleAdd}
        className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[32px] text-slate-400 hover:border-primary hover:text-primary hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group"
      >
        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest">Add Feed Item</span>
      </button>
    </div>
  );
}

