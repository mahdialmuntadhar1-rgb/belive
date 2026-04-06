import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Store, MapPin, Phone, Globe, Image as ImageIcon, Clock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useHomeStore } from '@/stores/homeStore';
import { useAuthStore } from '@/stores/authStore';
import { useBusinessManagement } from '@/hooks/useBusinessManagement';
import { GOVERNORATES, CITIES, CATEGORIES } from '@/constants';

interface AddBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddBusinessModal({ isOpen, onClose, onSuccess }: AddBusinessModalProps) {
  const { language } = useHomeStore();
  const { user } = useAuthStore();
  const { createBusiness, loading } = useBusinessManagement();
  
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    category: CATEGORIES[0].id,
    governorate: GOVERNORATES[0].name.en,
    city: '',
    address: '',
    phone: '',
    website: '',
    image: '',
    description: '',
    descriptionAr: '',
    openingHours: '9:00 AM - 10:00 PM'
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to add a business.');
      return;
    }

    setError(null);
    try {
      await createBusiness({
        ...formData,
        socialLinks: {}
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add business');
    }
  };

  const translations = {
    title: { en: 'Add Your Business', ar: 'أضف عملك التجاري', ku: 'کارەکەت زیاد بکە' },
    subtitle: { en: 'Join Iraq\'s largest business directory', ar: 'انضم إلى أكبر دليل أعمال في العراق', ku: 'ببەرە بەشێک لە گەورەترین دایرێکتۆری کار لە عێراق' },
    nameEn: { en: 'Business Name (English)', ar: 'اسم العمل (بالإنجليزي)', ku: 'ناوی کار (ئینگلیزی)' },
    nameAr: { en: 'Business Name (Arabic)', ar: 'اسم العمل (بالعربي)', ku: 'ناوی کار (عەرەبی)' },
    category: { en: 'Category', ar: 'التصنيف', ku: 'پۆلێن' },
    governorate: { en: 'Governorate', ar: 'المحافظة', ku: 'پارێزگا' },
    city: { en: 'City', ar: 'المدينة', ku: 'شار' },
    address: { en: 'Address', ar: 'العنوان', ku: 'ناونیشان' },
    phone: { en: 'Phone Number', ar: 'رقم الهاتف', ku: 'ژمارەی تەلەفۆن' },
    website: { en: 'Website URL', ar: 'رابط الموقع', ku: 'لینکی ماڵپەڕ' },
    image: { en: 'Image URL', ar: 'رابط الصورة', ku: 'لینکی وێنە' },
    descriptionEn: { en: 'Description (English)', ar: 'الوصف (بالإنجليزي)', ku: 'وەسف (ئینگلیزی)' },
    descriptionAr: { en: 'Description (Arabic)', ar: 'الوصف (بالعربي)', ku: 'وەسف (عەرەبی)' },
    openingHours: { en: 'Opening Hours', ar: 'ساعات العمل', ku: 'کاتژمێرەکانی کارکردن' },
    submit: { en: 'Register Business', ar: 'تسجيل العمل', ku: 'تۆمارکردنی کار' },
    success: { en: 'Business registered successfully!', ar: 'تم تسجيل العمل بنجاح!', ku: 'کارەکە بە سەرکەوتوویی تۆمارکرا!' }
  };

  const selectedGovId = GOVERNORATES.find(g => g.name.en === formData.governorate)?.id;
  const availableCities = selectedGovId ? CITIES[selectedGovId] || [] : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg-dark/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            dir={language === 'en' ? 'ltr' : 'rtl'}
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-text-main poppins-bold uppercase tracking-tight">{translations.title[language]}</h2>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{translations.subtitle[language]}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {success ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-black text-text-main mb-2 poppins-bold">{translations.success[language]}</h3>
                  <p className="text-sm text-text-muted">Your business has been added to our directory.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{translations.nameEn[language]}</label>
                      <input 
                        required
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold"
                        placeholder="e.g. Al-Mansour Restaurant"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{translations.nameAr[language]}</label>
                      <input 
                        required
                        type="text"
                        value={formData.nameAr}
                        onChange={e => setFormData({...formData, nameAr: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold"
                        placeholder="مثلاً: مطعم المنصور"
                        dir="rtl"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{translations.category[language]}</label>
                      <select 
                        required
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold appearance-none"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name[language]}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{translations.governorate[language]}</label>
                      <select 
                        required
                        value={formData.governorate}
                        onChange={e => setFormData({...formData, governorate: e.target.value, city: ''})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold appearance-none"
                      >
                        {GOVERNORATES.map(gov => (
                          <option key={gov.id} value={gov.name.en}>{language === 'ar' ? gov.name.ar : language === 'ku' ? gov.name.ku : gov.name.en}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{translations.city[language]}</label>
                      <input 
                        required
                        type="text"
                        list="cities-list"
                        value={formData.city}
                        onChange={e => setFormData({...formData, city: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold"
                        placeholder="e.g. Mansour"
                      />
                      <datalist id="cities-list">
                        {availableCities.map(city => (
                          <option key={city.id} value={city.name.en} />
                        ))}
                      </datalist>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{translations.phone[language]}</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          required
                          type="tel"
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold"
                          placeholder="+964 7XX XXX XXXX"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{translations.address[language]}</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          required
                          type="text"
                          value={formData.address}
                          onChange={e => setFormData({...formData, address: e.target.value})}
                          className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold"
                          placeholder="Street name, landmark..."
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{translations.website[language]}</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="url"
                          value={formData.website}
                          onChange={e => setFormData({...formData, website: e.target.value})}
                          className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold"
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{translations.image[language]}</label>
                      <div className="relative">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="url"
                          value={formData.image}
                          onChange={e => setFormData({...formData, image: e.target.value})}
                          className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold"
                          placeholder="Image URL"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{translations.descriptionEn[language]}</label>
                      <textarea 
                        required
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold min-h-[100px]"
                        placeholder="Tell us about your business..."
                      />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{translations.descriptionAr[language]}</label>
                      <textarea 
                        required
                        value={formData.descriptionAr}
                        onChange={e => setFormData({...formData, descriptionAr: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold min-h-[100px]"
                        placeholder="أخبرنا عن عملك..."
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-bg-dark text-white font-black rounded-[24px] shadow-2xl hover:bg-primary hover:text-bg-dark transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : translations.submit[language]}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
