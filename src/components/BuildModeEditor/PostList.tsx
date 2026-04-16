import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAdminDB } from '@/hooks/useAdminDB';
import PostItemEditor from './PostItemEditor';
import { canAccessBuildMode } from '@/lib/buildModeAccess';

export default function PostList() {
  if (!canAccessBuildMode()) return null;

  const { posts, addPost } = useAdminDB();
  const [filterType, setFilterType] = useState<'shaku_maku' | 'postcard'>('postcard');

  const filteredPosts = posts.filter(p => p.post_type === filterType);

  const handleAdd = () => {
    addPost({
      post_type: filterType,
      caption: 'New Post Caption',
      author_name: 'Admin',
      image_url: 'https://images.unsplash.com/photo-1501339819398-ee49a94b016f?q=80&w=800&auto=format&fit=crop',
      is_active: true,
      is_featured: false
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
        <button 
          onClick={() => setFilterType('postcard')}
          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filterType === 'postcard' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Postcards
        </button>
        <button 
          onClick={() => setFilterType('shaku_maku')}
          className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filterType === 'shaku_maku' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Shaku Maku
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredPosts.map((item, index) => (
          <div key={item.id}>
            <PostItemEditor 
              item={item} 
              index={index} 
              totalCount={filteredPosts.length} 
            />
          </div>
        ))}
      </div>
      
      <button 
        onClick={handleAdd}
        className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[32px] text-slate-400 hover:border-primary hover:text-primary hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group"
      >
        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest">Add {filterType.replace('_', ' ')}</span>
      </button>
    </div>
  );
}
