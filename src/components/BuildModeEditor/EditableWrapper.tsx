import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pencil, Plus } from 'lucide-react';
import { useBuildModeContext } from '@/contexts/BuildModeContext';
import InlineEditor, { EditorField } from './InlineEditor';

interface EditableWrapperProps {
  children: React.ReactNode;
  title: string;
  fields: EditorField[];
  initialData: any;
  onSave: (data: any) => Promise<void>;
  onDelete?: () => Promise<void>;
  onAdd?: () => void;
  className?: string;
  showAddButton?: boolean;
  key?: React.Key;
}

export default function EditableWrapper({
  children,
  title,
  fields,
  initialData,
  onSave,
  onDelete,
  onAdd,
  className = "",
  showAddButton = false
}: EditableWrapperProps) {
  const { isEditingEnabled, isAdmin } = useBuildModeContext();
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  if (!isAdmin || !isEditingEnabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Visual Indicator */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 group-hover:bg-primary/5 rounded-3xl transition-all duration-300 pointer-events-none z-10" />
      
      {/* Edit Button */}
      <button
        onClick={() => setIsEditorOpen(true)}
        className="absolute top-4 right-4 z-20 p-3 bg-white text-primary rounded-2xl shadow-2xl border border-slate-100 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 flex items-center gap-2"
      >
        <Pencil className="w-4 h-4" />
        <span className="text-[10px] font-black uppercase tracking-widest px-1">تعديل</span>
      </button>

      {/* Add Button if applicable */}
      {showAddButton && onAdd && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          className="absolute top-4 right-24 z-20 p-3 bg-white text-emerald-500 rounded-2xl shadow-2xl border border-slate-100 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest px-1">إضافة جديد</span>
        </button>
      )}

      {children}

      {/* Editor Modal Overlay */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => setIsEditorOpen(false)}
            />
            <InlineEditor
              title={title}
              fields={fields}
              initialData={initialData}
              onSave={onSave}
              onCancel={() => setIsEditorOpen(false)}
              onDelete={onDelete}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
