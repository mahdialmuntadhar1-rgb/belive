/**
 * // BUILD MODE ONLY
 * Modular Build Mode Toggle button.
 */

import React, { useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useBuildMode } from '@/hooks/useBuildMode';
import { canAccessBuildMode } from '@/lib/buildModeAccess';

export default function BuildModeToggle() {
  const { buildModeEnabled, toggleBuildMode } = useBuildMode();
  const location = useLocation();

  const isAuthorized = canAccessBuildMode(location.search);

  // Debug log for authorized owner mode
  useEffect(() => {
    if (isAuthorized) {
      console.log('Build Mode trigger mounted');
    }
  }, [isAuthorized]);

  // OWNER ACCESS: localStorage.setItem('owner_builder_access', 'true') + ?builder=1
  if (!isAuthorized) return null;

  return (
    <button 
      onClick={toggleBuildMode}
      className="fixed bottom-32 right-8 z-[10001] p-5 bg-[#00BFA5] text-white rounded-full shadow-[0_20px_50px_rgba(0,191,165,0.3)] hover:scale-110 active:scale-95 transition-all flex items-center gap-3 group border-2 border-white/20"
      aria-label="Toggle Build Mode"
    >
      <Settings className={`w-7 h-7 group-hover:rotate-90 transition-transform duration-700 ${buildModeEnabled ? 'rotate-90' : ''}`} />
      <span className="font-black uppercase tracking-[0.2em] text-[11px] pr-2 hidden sm:inline">Build Mode</span>
    </button>
  );
}
