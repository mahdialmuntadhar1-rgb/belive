import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Loader2, Check, AlertCircle, Trash2, Plus } from 'lucide-react';

export interface EditorField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'url' | 'number' | 'checkbox' | 'select' | 'image';
  options?: { label: string; value: any }[];
  placeholder?: string;
  description?: string;
}

interface InlineEditorProps {
  title: string;
  fields: EditorField[];
  initialData: any;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
  isLoading?: boolean;
}

export default function InlineEditor({
  title,
  fields,
  initialData,
  onSave,
  onCancel,
  onDelete,
  isLoading: externalLoading
}: InlineEditorProps) {
  const [formData, setFormData] = useState(initialData);
  const [internalLoading, setInternalLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoading = externalLoading || internalLoading;

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInternalLoading(true);
    setError(null);
    try {
      await onSave(formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onCancel();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 overflow-hidden w-full max-w-md pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="text-lg font-black poppins-bold uppercase tracking-tight text-primary">
          {title}
        </h3>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-primary shadow-sm border border-slate-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <p className="text-xs font-bold">{error}</p>
          </div>
        )}

        <div className="grid gap-6">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                {field.label}
              </label>
              
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold text-[#111827] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[100px]"
                />
              ) : field.type === 'select' ? (
                <select
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-[#111827] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                >
                  {field.options?.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all">
                  <input
                    type="checkbox"
                    name={field.name}
                    checked={formData[field.name] || false}
                    onChange={handleChange}
                    className="w-5 h-5 rounded-lg border-slate-200 text-primary focus:ring-primary/20"
                  />
                  <span className="text-sm font-bold text-[#111827]">
                    {field.description || 'تفعيل / تعطيل'}
                  </span>
                </div>
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-[#111827] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              )}
            </div>
          ))}
        </div>
      </form>

      {/* Footer */}
      <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
        {onDelete && (
          <button
            type="button"
            onClick={() => {
              if (confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
                onDelete();
              }
            }}
            className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100 group"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
        
        <div className="flex-1 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 bg-white text-slate-400 text-xs font-black uppercase tracking-widest rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all"
          >
            إلغاء
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className={`flex-[2] py-4 rounded-2xl text-white text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              success 
                ? 'bg-emerald-500 shadow-emerald-500/20' 
                : 'bg-primary shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : success ? (
              <Check className="w-5 h-5" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {success ? 'تم الحفظ' : 'حفظ التعديلات'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
