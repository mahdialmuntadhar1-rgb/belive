import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  MapPin, 
  Sparkles, 
  Smartphone, 
  Search, 
  TrendingUp, 
  Users, 
  Download,
  Plus,
  Loader2
} from 'lucide-react';
import { useHomeStore } from '@/stores/homeStore';
import { useBuildModeContext } from '@/contexts/BuildModeContext';
import { useAdminDB } from '@/hooks/useAdminDB';
import { supabase } from '@/lib/supabaseClient';
import EditableWrapper from '../BuildModeEditor/EditableWrapper';
import { EditorField } from '../BuildModeEditor/InlineEditor';

interface Feature {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  icon_name: string;
  display_order: number;
  is_active: boolean;
}

const ICON_MAP: Record<string, any> = {
  ShieldCheck,
  MapPin,
  Sparkles,
  Smartphone,
  Search,
  TrendingUp,
  Users,
  Download
};

const HARDCODED_FEATURES: Feature[] = [
  {
    id: 'f1',
    title_ar: 'بحث ذكي',
    title_en: 'Smart Search',
    description_ar: 'ابحث عن أفضل الأماكن بسهولة بلمسة واحدة.',
    description_en: 'Find the best places easily with just one touch.',
    icon_name: 'Search',
    display_order: 0,
    is_active: true
  },
  {
    id: 'f2',
    title_ar: 'أماكن موثقة',
    title_en: 'Verified Places',
    description_ar: 'نحن نتحقق من كل نشاط تجاري لضمان الجودة.',
    description_en: 'We verify every business to ensure high quality.',
    icon_name: 'ShieldCheck',
    display_order: 1,
    is_active: true
  },
  {
    id: 'f3',
    title_ar: 'دعم محلي',
    title_en: 'Local Support',
    description_ar: 'دعم مباشر للشركات المحلية لتمكين المجتمع.',
    description_en: 'Direct support for local businesses to empower the community.',
    icon_name: 'Users',
    display_order: 2,
    is_active: true
  },
  {
    id: 'f4',
    title_ar: 'آراء حقيقية',
    title_en: 'Real Reviews',
    description_ar: 'آراء صادقة من مستخدمين جربوا الخدمة بأنفسهم.',
    description_en: 'Honest reviews from users who tried the service themselves.',
    icon_name: 'Sparkles',
    display_order: 3,
    is_active: true
  }
];

export default function FeaturesSection() {
  const { language } = useHomeStore();
  const { isAdmin } = useBuildModeContext();
  const { updateFeature, createFeature, deleteFeature } = useAdminDB();
  const [features, setFeatures] = useState<Feature[]>(HARDCODED_FEATURES);
  const [loading, setLoading] = useState(false);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('features')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) {
        // If error (like table missing), we already have HARDCODED_FEATURES as initial state
        return;
      }
      
      if (data && data.length > 0) {
        const formattedData = data.map((feat: any) => ({
          ...feat,
          icon_name: feat.icon_name || feat.icon || 'Sparkles'
        }));
        setFeatures(formattedData);
      }
    } catch (err) {
      // Quietly fail as we have fallbacks
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleAddFeature = async () => {
    const newFeature: Partial<Feature> = {
      title_ar: 'مميزة جديدة',
      title_en: 'New Feature',
      description_ar: 'وصف قصير لهذه المميزة الرائعة',
      description_en: 'Short description for this amazing feature',
      icon_name: 'Sparkles',
      display_order: features.length,
      is_active: true
    };
    const { success } = await createFeature(newFeature);
    if (success) fetchFeatures();
  };

  const featureFields: EditorField[] = [
    { name: 'title_ar', label: 'العنوان (عربي)', type: 'text' },
    { name: 'title_en', label: 'Title (EN)', type: 'text' },
    { name: 'description_ar', label: 'الوصف (عربي)', type: 'textarea' },
    { name: 'description_en', label: 'Description (EN)', type: 'textarea' },
    { 
      name: 'icon_name', 
      label: 'الأيقونة', 
      type: 'select', 
      options: Object.keys(ICON_MAP).map(k => ({ label: k, value: k })) 
    },
    { name: 'display_order', label: 'الترتيب', type: 'number' },
    { name: 'is_active', label: 'نشط', type: 'checkbox' }
  ];

  if (loading && features.length === 0) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full mb-24 sm:mb-32">
      <div className="max-w-full mx-auto">
        <div className="text-center mb-16 px-4">
          <h2 className="text-4xl sm:text-6xl font-black text-slate-900 poppins-bold uppercase tracking-tighter mb-6 leading-none">
            {language === 'ar' ? 'مميزات شكو ماكو' : language === 'ku' ? 'تایبەتمەندییەکان' : 'Our Features'}
          </h2>
          <div className="w-24 h-2 bg-primary mx-auto rounded-full mb-8" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.filter(f => isAdmin || f.is_active).map((feature) => {
            const Icon = ICON_MAP[feature.icon_name] || Sparkles;
            return (
              <EditableWrapper
                key={feature.id}
                title="تعديل المميزة"
                fields={featureFields}
                initialData={feature}
                onSave={async (data) => {
                  const { success } = await updateFeature(feature.id, data);
                  if (success) fetchFeatures();
                }}
                onDelete={async () => {
                  const { success } = await deleteFeature(feature.id);
                  if (success) fetchFeatures();
                }}
                className={`h-full ${!feature.is_active ? 'opacity-50' : ''}`}
              >
                <div className="h-full p-10 bg-white rounded-[48px] border border-slate-100 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 group">
                  <div className="w-16 h-16 bg-primary/5 rounded-[24px] flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-primary/20">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-4 poppins-bold uppercase tracking-tight">
                    {language === 'ar' ? feature.title_ar : feature.title_en}
                  </h3>
                  <p className="text-slate-500 font-medium leading-relaxed text-sm">
                    {language === 'ar' ? feature.description_ar : feature.description_en}
                  </p>
                </div>
              </EditableWrapper>
            );
          })}

          {isAdmin && (
            <button
              onClick={handleAddFeature}
              className="p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[48px] flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-500 transition-all group"
            >
              <Plus className="w-12 h-12 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest text-[#111827]">
                إضافة مميزة جديدة
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
