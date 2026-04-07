import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Store, MapPin, Phone, Globe, Image as ImageIcon, Clock, Loader2, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
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
    whatsapp: '',
    facebook: '',
    instagram: '',
    neighborhood: '',
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
        socialLinks: {
          whatsapp: formData.whatsapp,
          facebook: formData.facebook,
          instagram: formData.instagram
        }
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
    neighborhood: { en: 'Neighborhood', ar: 'الحي/المنطقة', ku: 'گەڕەک' },
    address: { en: 'Address', ar: 'العنوان', ku: 'ناونیشان' },
    phone: { en: 'Phone Number', ar: 'رقم الهاتف', ku: 'ژمارەی تەلەفۆن' },
    whatsapp: { en: 'WhatsApp Number', ar: 'رقم الواتساب', ku: 'ژمارەی واتسئەپ' },
    facebook: { en: 'Facebook URL', ar: 'رابط فيسبوك', ku: 'لینکی فەیسبووک' },
    instagram: { en: 'Instagram URL', ar: 'رابط إنستغرام', ku: 'لینکی ئینستاگرام' },
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

            <div className="flex-1 overflow-y-auto p-10">
              {success ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center mb-8 shadow-inner">
                    <CheckCircle2 className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-3xl font-black text-bg-dark mb-4 poppins-bold tracking-tighter uppercase">{translations.success[language]}</h3>
                  <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto">Your business has been added to our directory and is now live for millions to see.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-10">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 text-red-600 text-[11px] font-black uppercase tracking-widest"
                    >
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Section: Basic Info */}
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-4 bg-primary rounded-full" />
                        <h3 className="text-[10px] font-black text-bg-dark uppercase tracking-[0.3em]">Basic Information</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">{translations.nameEn[language]}</label>
                          <input 
                            required
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full px-6 py-4.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all text-sm font-bold placeholder:text-slate-300"
                            placeholder="e.g. Al-Mansour Restaurant"
                          />
                        </div>
                        <div className="space-y-2.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">{translations.nameAr[language]}</label>
                          <input 
                            required
                            type="text"
                            value={formData.nameAr}
                            onChange={e => setFormData({...formData, nameAr: e.target.value})}
                            className="w-full px-6 py-4.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all text-sm font-bold placeholder:text-slate-300"
                            placeholder="مثلاً: مطعم المنصور"
                            dir="rtl"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section: Location */}
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-4 bg-secondary rounded-full" />
                        <h3 className="text-[10px] font-black text-bg-dark uppercase tracking-[0.3em]">Location & Category</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">{translations.category[language]}</label>
                          <div className="relative">
                            <select 
                              required
                              value={formData.category}
                              onChange={e => setFormData({...formData, category: e.target.value})}
                              className="w-full px-6 py-4.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all text-sm font-bold appearance-none cursor-pointer"
                            >
                              {CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name[language]}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">{translations.governorate[language]}</label>
                          <div className="relative">
                            <select 
                              required
                              value={formData.governorate}
                              onChange={e => setFormData({...formData, governorate: e.target.value, city: ''})}
                              className="w-full px-6 py-4.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all text-sm font-bold appearance-none cursor-pointer"
                            >
                              {GOVERNORATES.map(gov => (
                                <option key={gov.id} value={gov.name.en}>{language === 'ar' ? gov.name.ar : language === 'ku' ? gov.name.ku : gov.name.en}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">{translations.city[language]}</label>
                          <input 
                            required
                            type="text"
                            list="cities-list"
                            value={formData.city}
                            onChange={e => setFormData({...formData, city: e.target.value})}
                            className="w-full px-6 py-4.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all text-sm font-bold placeholder:text-slate-300"
                            placeholder="e.g. Mansour"
                          />
                          <datalist id="cities-list">
                            {availableCities.map(city => (
                              <option key={city.id} value={city.name.en} />
                            ))}
                          </datalist>
                        </div>

                        <div className="space-y-2.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">{translations.neighborhood[language]}</label>
                          <input 
                            type="text"
                            value={formData.neighborhood}
                            onChange={e => setFormData({...formData, neighborhood: e.target.value})}
                            className="w-full px-6 py-4.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all text-sm font-bold placeholder:text-slate-300"
                            placeholder="e.g. Al-Mansour Street"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section: Contact */}
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-4 bg-accent rounded-full" />
                        <h3 className="text-[10px] font-black text-bg-dark uppercase tracking-[0.3em]">Contact Details</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">{translations.phone[language]}</label>
                          <div className="relative">
                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                            <input 
                              required
                              type="tel"
                              value={formData.phone}
                              onChange={e => setFormData({...formData, phone: e.target.value})}
                              className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all text-sm font-bold placeholder:text-slate-300"
                              placeholder="+964 7XX XXX XXXX"
                            />
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">{translations.whatsapp[language]}</label>
                          <div className="relative">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 bg-green-500 rounded-lg flex items-center justify-center text-white font-black text-[8px]">WA</div>
                            <input 
                              type="tel"
                              value={formData.whatsapp}
                              onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                              className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all text-sm font-bold placeholder:text-slate-300"
                              placeholder="+964 7XX XXX XXXX"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section: Media */}
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-4 bg-bg-dark rounded-full" />
                        <h3 className="text-[10px] font-black text-bg-dark uppercase tracking-[0.3em]">Media & Description</h3>
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-2.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">{translations.image[language]}</label>
                          <div className="relative">
                            <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                            <input 
                              type="url"
                              value={formData.image}
                              onChange={e => setFormData({...formData, image: e.target.value})}
                              className="w-full pl-14 pr-6 py-4.5 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all text-sm font-bold placeholder:text-slate-300"
                              placeholder="Paste a high-quality image URL"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">{translations.descriptionEn[language]}</label>
                            <textarea 
                              required
                              value={formData.description}
                              onChange={e => setFormData({...formData, description: e.target.value})}
                              className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-3xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all text-sm font-bold min-h-[120px] placeholder:text-slate-300 resize-none"
                              placeholder="Tell us about your brand story..."
                            />
                          </div>
                          <div className="space-y-2.5">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">{translations.descriptionAr[language]}</label>
                            <textarea 
                              required
                              value={formData.descriptionAr}
                              onChange={e => setFormData({...formData, descriptionAr: e.target.value})}
                              className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-3xl focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all text-sm font-bold min-h-[120px] placeholder:text-slate-300 resize-none"
                              placeholder="أخبرنا عن قصة علامتك التجارية..."
                              dir="rtl"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full py-6 bg-bg-dark text-white font-black rounded-[28px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:bg-primary hover:text-bg-dark transition-all duration-700 flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-[11px] disabled:opacity-50 group active:scale-95"
                    >
                      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                        <>
                          <span>{translations.submit[language]}</span>
                          <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
