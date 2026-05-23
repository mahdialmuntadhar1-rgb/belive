import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Settings, Power, Eye, EyeOff } from 'lucide-react';
import { useBuildModeContext } from '@/contexts/BuildModeContext';

export default function BuildModeImageReplacer() {
  const { isEditingEnabled, toggleEditing, isAdmin } = useBuildModeContext();

  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md flex items-center gap-6"
      >
        <div className="flex items-center gap-3 pr-6 border-r border-white/10">
          <div className="p-2 bg-[#0F7B6C] rounded-lg">
            <Camera size={18} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0F7B6C]">Build Mode</span>
            <span className="text-xs font-bold poppins-bold">وضع التحرير نشط</span>
          </div>
        </div>

        <button
          onClick={toggleEditing}
          className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
            isEditingEnabled 
              ? 'bg-[#0F7B6C] text-white shadow-[0_0_20px_rgba(15,123,108,0.3)]' 
              : 'bg-white/5 text-slate-400 hover:bg-white/10'
          }`}
        >
          {isEditingEnabled ? <Eye size={16} /> : <EyeOff size={16} />}
          <span className="text-xs font-black uppercase tracking-tighter">
            {isEditingEnabled ? 'تحرير مفعل' : 'التحرير معطل'}
          </span>
          <div className={`w-8 h-4 rounded-full relative transition-colors ${isEditingEnabled ? 'bg-white/20' : 'bg-slate-700'}`}>
            <motion.div
              animate={{ x: isEditingEnabled ? 16 : 2 }}
              className="absolute top-1 w-2 h-2 rounded-full bg-white shadow-sm"
            />
          </div>
        </button>

        <div className="text-[9px] font-medium text-slate-500 max-w-[120px] leading-tight rtl:text-right">
          اضغط على أي صورة لاستبدالها مباشرة من واجهة التطبيق
        </div>
      </motion.div>
    </div>
  );
}
