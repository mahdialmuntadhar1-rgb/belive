/**
 * // ADMIN MODE ONLY
 * Main Build Mode Editor panel using seamless instant sync to Supabase.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Loader2, 
  CheckCircle2, 
  ImageIcon, 
  Smartphone,
  MessageSquare
} from 'lucide-react';
import { useAdminDB } from '@/hooks/useAdminDB';
import SlideList from './SlideList';
import FeedList from './FeedList';
import PostList from './PostList';
import { canAccessBuildMode } from '@/lib/buildModeAccess';
import { useLocation } from 'react-router-dom';

export default function BuildModeEditor() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  if (!canAccessBuildMode()) return null;

  const { fetchAll, loading } = useAdminDB();
  const [activeTab, setActiveTab] = useState<'hero' | 'feed' | 'posts'>('hero');

  // Trigger open logic and fetch all immediately when active
  useEffect(() => {
    // Only open and fetch if we render this component
    setIsOpen(true);
    fetchAll();
  }, [fetchAll]);

  // If you want a toggle, you'd manage isOpen via a parent or store, but for now we mount it conditionally in App.tsx
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[10000] flex flex-col border-l border-slate-100"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black poppins-bold uppercase tracking-tight text-primary">Admin Builder</h2>
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex items-center gap-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live Syncing</p>
                <div className="flex items-center gap-1.5">
                  {loading ? (
                    <div className="flex items-center gap-1 text-[9px] font-black text-amber-500 uppercase tracking-widest">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      Syncing via Supabase...
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Live
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2 hover:bg-white rounded-2xl transition-colors shadow-sm border border-slate-100"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Close</span>
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Tab Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button 
              onClick={() => setActiveTab('hero')}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'hero' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Hero
            </button>
            <button 
              onClick={() => setActiveTab('feed')}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'feed' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Sections
            </button>
            <button 
              onClick={() => setActiveTab('posts')}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'posts' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Posts
            </button>
          </div>

          {/* Editor Sections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {activeTab === 'hero' && 'Hero Slides (Images Only)'}
                {activeTab === 'feed' && 'Homepage Feed Sections'}
                {activeTab === 'posts' && 'Postcards & Shaku Maku'}
              </h3>
            </div>
            
            {activeTab === 'hero' && <SlideList />}
            {activeTab === 'feed' && <FeedList />}
            {activeTab === 'posts' && <PostList />}
          </div>

        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/50 space-y-4">
          <p className="text-[9px] text-slate-400 font-medium italic text-center">
            All edits are synchronized live with the production database. Real users will see these updates immediately.
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

