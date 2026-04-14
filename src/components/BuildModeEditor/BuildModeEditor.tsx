/**
 * // BUILD MODE ONLY
 * Main Build Mode Editor panel.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Layout, 
  MessageSquare, 
  Star,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useBuildMode } from '@/hooks/useBuildMode';
import BuildModeToggle from './BuildModeToggle';
import SlideList from './SlideList';
import ImageUploader from './ImageUploader';

export default function BuildModeEditor() {
  const { buildModeEnabled, toggleBuildMode, lastSaved, resetToOriginal } = useBuildMode();
  const [activeSection, setActiveSection] = useState<'hero' | null>(null);
  const [showSaved, setShowSaved] = useState(false);

  // Show "Saved" feedback briefly when lastSaved changes
  React.useEffect(() => {
    if (lastSaved) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved]);

  return (
    <>
      <BuildModeToggle />

      <AnimatePresence>
        {buildModeEnabled && (
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
                <h2 className="text-xl font-black poppins-bold uppercase tracking-tight text-primary">Build Mode Editor</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Temporary Playground Only</p>
                  <AnimatePresence>
                    {showSaved && (
                      <motion.span 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1"
                      >
                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                        ✓ Saved locally
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <button 
                onClick={toggleBuildMode}
                className="p-3 hover:bg-white rounded-2xl transition-colors shadow-sm border border-slate-100"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              
              {/* Hero Section Editor */}
              <SectionCollapse 
                title="Hero Section" 
                icon={<Layout className="w-4 h-4" />} 
                isOpen={activeSection === 'hero'} 
                onToggle={() => setActiveSection(activeSection === 'hero' ? null : 'hero')}
              >
                <SlideList />
                
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <button 
                    onClick={() => {
                      if (confirm('Reset all hero slides to default? This cannot be undone.')) {
                        resetToOriginal();
                      }
                    }}
                    className="w-full py-4 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-dashed border-slate-200 hover:border-red-100"
                  >
                    Reset to Defaults
                  </button>
                </div>
              </SectionCollapse>

            </div>

            {/* Footer */}
            <div className="p-8 border-t border-slate-100 bg-slate-50/50">
              <p className="text-[10px] text-slate-400 font-medium italic text-center">
                Changes are saved to local storage for this session.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function SectionCollapse({ title, icon, children, isOpen, onToggle }: any) {
  return (
    <div className="border border-slate-100 rounded-[32px] overflow-hidden bg-white shadow-sm">
      <button 
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl transition-colors ${isOpen ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400'}`}>
            {icon}
          </div>
          <span className="font-black uppercase tracking-widest text-[11px]">{title}</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-300" /> : <ChevronRight className="w-4 h-4 text-slate-300" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TextInput({ label, value, onChange, isTextArea = false }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      {isTextArea ? (
        <textarea 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary text-xs font-medium min-h-[80px] leading-relaxed"
        />
      ) : (
        <input 
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary text-xs font-medium"
        />
      )}
    </div>
  );
}
