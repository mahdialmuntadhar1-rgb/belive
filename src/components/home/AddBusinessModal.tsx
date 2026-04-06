import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Phone, MapPin, Building2, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { useHomeStore } from '@/stores/homeStore';
import { supabase } from '@/lib/supabaseClient';

interface AddBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const GOVERNORATES = [
  'Baghdad', 'Basra', 'Mosul', 'Erbil', 'Sulaymaniyah', 'Duhok',
  'Kirkuk', 'Najaf', 'Karbala', 'Hilla', 'Diyala', 'Anbar',
  'Salahuddin', 'Dhi Qar', 'Muthanna', 'Wasit', 'Babil', 'Qadisiyah'
];

const CATEGORIES = [
  'Restaurant', 'Cafe', 'Hotel', 'Hospital', 'Clinic', 'Pharmacy',
  'Supermarket', 'Shopping', 'Gym', 'Salon', 'Car Repair', 'Electronics',
  'Education', 'Real Estate', 'Travel', 'Bank', 'Other'
];

export default function AddBusinessModal({ isOpen, onClose, onSuccess }: AddBusinessModalProps) {
  const { language } = useHomeStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    category: '',
    governorate: '',
    city: '',
    address: '',
    description: ''
  });

  const translations = {
    title: {
      en: 'Add Your Business',
      ar: 'أضف عملك التجاري',
      ku: 'کارەکەت زیاد بکە'
    },
    subtitle: {
      en: 'Join thousands of businesses on Saku Maku',
      ar: 'انضم إلى آلاف الشركات على شكو ماكو',
      ku: 'بەشداری هەزاران کار بکە لە سaku مaku'
    },
    name: {
      en: 'Business Name',
      ar: 'اسم العمل',
      ku: 'ناوی کار'
    },
    phone: {
      en: 'Phone Number',
      ar: 'رقم الهاتف',
      ku: 'ژمارەی مۆبایل'
    },
    category: {
      en: 'Category',
      ar: 'الفئة',
      ku: 'پۆل'
    },
    governorate: {
      en: 'Governorate',
      ar: 'المحافظة',
      ku: 'پارێزگا'
    },
    city: {
      en: 'City',
      ar: 'المدينة',
      ku: 'شار'
    },
    address: {
      en: 'Address',
      ar: 'العنوان',
      ku: 'ناونیشان'
    },
    description: {
      en: 'Description (Optional)',
      ar: 'الوصف (اختياري)',
      ku: 'پێناسە (ئارەزوومەندانە)'
    },
    submit: {
      en: 'Submit Business',
      ar: 'إرسال العمل',
      ku: 'ناردنی کار'
    },
    submitting: {
      en: 'Submitting...',
      ar: 'جاري الإرسال...',
      ku: 'ناردن...'
    },
    success: {
      en: 'Business Added Successfully!',
      ar: 'تم إضافة العمل بنجاح!',
      ku: 'کار بە سەرکەوتوویی زیاد کرا!'
    },
    successDesc: {
      en: 'Your business will be reviewed and published soon.',
      ar: 'سيتم مراجعة عملك ونشره قريباً.',
      ku: 'کارەکەت لە کاتی نزیکدا پێداچوونەوەی بۆ دەکرێت و بڵاودەبرێتەوە.'
    },
    close: {
      en: 'Close',
      ar: 'إغلاق',
      ku: 'داخستن'
    },
    required: {
      en: 'This field is required',
      ar: 'هذا الحقل مطلوب',
      ku: 'ئەم خانەیە پێویستە'
    }
  };

  const isRTL = language === 'ar' || language === 'ku';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: supabaseError } = await supabase
        .from('businesses')
        .insert([{
          name: formData.name,
          phone: formData.phone,
          category: formData.category,
          governorate: formData.governorate,
          city: formData.city,
          address: formData.address || null,
          description: formData.description || null,
          is_featured: false,
          is_verified: false,
          rating: 0,
          review_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (supabaseError) throw supabaseError;

      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add business');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSuccess(false);
      setError(null);
      setFormData({
        name: '',
        phone: '',
        category: '',
        governorate: '',
        city: '',
        address: '',
        description: ''
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-primary to-primary-dark p-8 text-white">
            <button 
              onClick={handleClose}
              disabled={loading}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black poppins-bold">{translations.title[language]}</h2>
              </div>
            </div>
            <p className="text-white/80 text-sm">{translations.subtitle[language]}</p>
          </div>

          {/* Content */}
          <div className="p-6">
            {success ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-text-main mb-2">{translations.success[language]}</h3>
                <p className="text-text-muted text-sm mb-6">{translations.successDesc[language]}</p>
                <button 
                  onClick={handleClose}
                  className="px-8 py-3 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark transition-all"
                >
                  {translations.close[language]}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Business Name */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-black text-text-muted uppercase tracking-widest mb-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    {translations.name[language]} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold"
                    placeholder={translations.name[language]}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-black text-text-muted uppercase tracking-widest mb-2">
                    <Phone className="w-4 h-4 text-primary" />
                    {translations.phone[language]} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold"
                    placeholder="+964 770 123 4567"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-black text-text-muted uppercase tracking-widest mb-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    {translations.category[language]} *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold appearance-none cursor-pointer"
                  >
                    <option value="">{translations.category[language]}</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Governorate */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-black text-text-muted uppercase tracking-widest mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    {translations.governorate[language]} *
                  </label>
                  <select
                    required
                    value={formData.governorate}
                    onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold appearance-none cursor-pointer"
                  >
                    <option value="">{translations.governorate[language]}</option>
                    {GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-black text-text-muted uppercase tracking-widest mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    {translations.city[language]} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold"
                    placeholder={translations.city[language]}
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-black text-text-muted uppercase tracking-widest mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    {translations.address[language]}
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold"
                    placeholder={translations.address[language]}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-black text-text-muted uppercase tracking-widest mb-2">
                    <FileText className="w-4 h-4 text-primary" />
                    {translations.description[language]}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold resize-none"
                    placeholder={translations.description[language]}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-bold">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-primary text-white font-black rounded-2xl hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-widest text-sm shadow-lg shadow-primary/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {translations.submitting[language]}
                    </>
                  ) : (
                    translations.submit[language]
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
