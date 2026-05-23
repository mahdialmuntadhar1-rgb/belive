import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Eye, EyeOff, LogOut, ShieldCheck, ChevronRight } from 'lucide-react';
import { useBuildModeContext } from '@/contexts/BuildModeContext';
import { useAuth } from '@/hooks/useAuth';

export default function AdminToolbar() {
  const { isEditingEnabled, toggleEditing, isAdmin } = useBuildModeContext();
  const { profile, signOut } = useAuth();

  if (!isAdmin) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex items-center gap-2">
      <AnimatePresence mode="wait">
        <motion.div
          layout
          className="bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-2xl rounded-[24px] overflow-hidden flex items-center p-1.5"
        >
          {/* User Info */}
          <div className="px-4 py-2 border-r border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#111827]">
                {profile?.full_name || 'Admin'}
              </span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">
                Mode: {isEditingEnabled ? 'Editing' : 'Preview'}
              </span>
            </div>
          </div>

          {/* Toggle */}
          <button
            onClick={toggleEditing}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
              isEditingEnabled 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-slate-50 text-slate-400 hover:text-primary hover:bg-slate-100'
            }`}
          >
            {isEditingEnabled ? (
              <>
                <Eye className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">عرض الموقع</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">تفعيل التحرير</span>
              </>
            )}
          </button>

          {/* Logout */}
          <button
            onClick={signOut}
            className="ml-1 p-2 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
