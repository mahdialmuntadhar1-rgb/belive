import React, { useState } from 'react';
import isBuildMode from '../utils/buildMode';
import HeroEditor from './HeroEditor';
import CategoriesEditor from './CategoriesEditor';
import BusinessCardsEditor from './BusinessCardsEditor';
import ShakuMakuEditor from './ShakuMakuEditor';
import { Button } from './ui/button';
import { X, Hammer } from 'lucide-react';

export default function PageEditor() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeEditor, setActiveEditor] = useState<string | null>(null);

  if (!isBuildMode()) return null;

  return (
    <>
      {/* Floating Toggle Button when closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 bg-slate-900 text-white p-3 rounded-l-2xl shadow-2xl z-[100] hover:pr-5 transition-all"
        >
          <Hammer className="h-6 w-6" />
        </button>
      )}

      {/* Sidebar Panel */}
      <div className={`fixed top-0 right-0 h-full bg-white border-l border-slate-200 shadow-2xl z-[100] transition-all duration-300 flex flex-col ${
        isOpen ? 'w-[420px]' : 'w-0 overflow-hidden'
      }`}>
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 text-white rounded-xl">
              <Hammer className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-black leading-none text-lg tracking-tighter">BUILD MODE</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Belive CMS Engine</p>
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={() => setIsOpen(false)} className="hover:bg-white/10 text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Editor Tabs */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'hero', label: 'Hero Slider', icon: '✨' },
              { id: 'categories', label: 'Categories', icon: '📂' },
              { id: 'businesses', label: 'Businesses', icon: '🏢' },
              { id: 'shakuMaku', label: 'Shaku Maku', icon: '📸' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveEditor(activeEditor === item.id ? null : item.id)}
                className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 ${
                  activeEditor === item.id 
                    ? 'bg-slate-50 border-slate-900 shadow-inner' 
                    : 'bg-slate-50 border-transparent hover:border-slate-200'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-sm font-black uppercase tracking-tight">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100">
            {activeEditor === 'hero' && <HeroEditor />}
            {activeEditor === 'categories' && <CategoriesEditor />}
            {activeEditor === 'businesses' && <BusinessCardsEditor />}
            {activeEditor === 'shakuMaku' && <ShakuMakuEditor />}
            {!activeEditor && (
              <div className="text-center py-20 text-slate-400">
                <p className="text-sm font-medium">Select a section to start editing</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-[11px] text-amber-800 leading-relaxed">
            <p><strong>PRO TIP:</strong> Changes are saved to local JSON files. Commit your changes in the file explorer to deploy to production.</p>
          </div>
        </div>
      </div>
    </>
  );
}
