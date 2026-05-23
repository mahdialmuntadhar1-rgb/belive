/**
 * // BUILD MODE ONLY
 * Modular Build Mode Toggle button.
 */

import React, { useEffect } from 'react';
import { Edit3, Settings, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useBuildMode } from '@/hooks/useBuildMode';
import { canAccessBuildMode } from '@/lib/buildModeAccess';

export default function BuildModeToggle() {
  const { buildModeEnabled, toggleBuildMode } = useBuildMode();
  const location = useLocation();

  const isAuthorized = canAccessBuildMode(location.search);

  // OWNER ACCESS: localStorage.setItem('owner_builder_access', 'true') + ?builder=1
  if (!isAuthorized) return null;

  return (
    <button 
      onClick={toggleBuildMode}
      className={`fixed bottom-8 right-8 z-[10001] flex items-center gap-3 px-6 py-4 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all duration-500 group border-2 border-white/20 ${
        buildModeEnabled 
          ? 'bg-slate-900 text-white scale-90' 
          : 'bg-[#00BFA5] text-white hover:scale-110 active:scale-95'
      }`}
      aria-label="Toggle Build Mode"
    >
      <div className="relative">
        {buildModeEnabled ? (
          <X className="w-6 h-6" />
        ) : (
          <Edit3 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        )}
      </div>
      <span className="font-black uppercase tracking-[0.2em] text-[10px] pr-1">
        {buildModeEnabled ? 'Close Editor' : 'Build Mode'}
      </span>
    </button>
  );
}
