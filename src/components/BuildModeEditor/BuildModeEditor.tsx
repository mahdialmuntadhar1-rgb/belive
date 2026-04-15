/**
 * // BUILD MODE ONLY
 * Main Build Mode Editor panel.
 */

import React, { useState, useEffect } from 'react';
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
import SlideList from './SlideList';
import ImageUploader from './ImageUploader';
import { useLocation } from 'react-router-dom';
import { disableBuildModeAccess, canAccessBuildMode } from '@/lib/buildModeAccess';
import { Save, Loader2, CloudUpload, CheckCircle2, AlertCircle } from 'lucide-react';

export default function BuildModeEditor() {
  const location = useLocation();
  if (!canAccessBuildMode(location.search)) return null;

  const { 
    buildModeEnabled, 
    toggleBuildMode, 
    lastSaved, 
    resetToOriginal, 
    saveToRepo, 
    isSaving,
    heroSlides,
    hasUnsavedChanges
  } = useBuildMode();
  const [activeSection, setActiveSection] = useState<'hero' | null>(null);
  const [showSaved, setShowSaved] = useState(false);

  // Auto-save logic
  useEffect(() => {
    if (hasUnsavedChanges && !isSaving) {
      const timer = setTimeout(() => {
        saveToRepo(true); // Silent save
      }, 3000); // 3 second debounce
      return () => clearTimeout(timer);
    }
  }, [heroSlides, hasUnsavedChanges, isSaving, saveToRepo]);

  // Show "Saved" feedback briefly when lastSaved changes
  React.useEffect(() => {
    if (lastSaved) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved]);

  const handleDisableAccess = () => {
    if (confirm('Disable Build Mode access? You will need the private URL to enable it again.')) {
      disableBuildModeAccess();
      window.location.reload();
    }
  };

  return (
    <>
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
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Repository Sync</p>
                    <div className="flex items-center gap-1.5">
                      {isSaving ? (
                        <div className="flex items-center gap-1 text-[9px] font-black text-amber-500 uppercase tracking-widest">
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          Syncing...
                        </div>
                      ) : hasUnsavedChanges ? (
                        <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          <CloudUpload className="w-2.5 h-2.5" />
                          Unsaved
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Synced to Repo
                        </div>
                      )}
                    </div>
                  </div>
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
              
              {/* Sync Status Banner */}
              {hasUnsavedChanges && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3"
                >
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <p className="text-[10px] font-bold text-amber-700 leading-tight">
                    You have unsaved changes. They will auto-sync to the repository in a few seconds.
                  </p>
                </motion.div>
              )}

              {/* Save to Repo Button - CRITICAL */}
              <div className="mb-8">
                <button 
                  onClick={() => saveToRepo(false)}
                  disabled={isSaving}
                  className={`w-full py-6 rounded-[32px] shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100 ${
                    hasUnsavedChanges 
                      ? 'bg-primary text-white shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-95' 
                      : 'bg-slate-100 text-slate-400 shadow-none cursor-default'
                  }`}
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-black uppercase tracking-widest">
                      {hasUnsavedChanges ? 'Sync Changes Now' : 'All Changes Synced'}
                    </span>
                    <span className="text-[8px] font-bold opacity-70 uppercase tracking-tight">
                      {hasUnsavedChanges ? 'Persist edits to source code' : 'Repository is up to date'}
                    </span>
                  </div>
                </button>
              </div>

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
            <div className="p-8 border-t border-slate-100 bg-slate-50/50 space-y-4">
              <p className="text-[10px] text-slate-400 font-medium italic text-center">
                Changes are synced directly to the repository source files.
              </p>
              {!import.meta.env.DEV && (
                <button 
                  onClick={handleDisableAccess}
                  className="w-full py-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
                >
                  Disable Builder Access
                </button>
              )}
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
