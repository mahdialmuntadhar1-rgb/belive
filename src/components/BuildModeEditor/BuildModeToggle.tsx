/**
 * // BUILD MODE ONLY
 * Modular Build Mode Toggle button.
 */

import React from 'react';
import { Settings } from 'lucide-react';
import { useBuildMode } from '@/hooks/useBuildMode';

export default function BuildModeToggle() {
  const { buildModeEnabled, toggleBuildMode } = useBuildMode();

  return (
    <button 
      onClick={toggleBuildMode}
      className="fixed bottom-32 right-8 z-[9999] p-4 bg-primary text-white rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 group"
    >
      <Settings className={`w-6 h-6 group-hover:rotate-90 transition-transform duration-500 ${buildModeEnabled ? 'rotate-90' : ''}`} />
      <span className="font-black uppercase tracking-widest text-[10px] pr-2">Build Mode</span>
    </button>
  );
}
