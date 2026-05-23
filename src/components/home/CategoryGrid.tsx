import { useState } from 'react';
import { useHomeStore } from '@/stores/homeStore';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, TrendingUp, Plus, Loader2 } from 'lucide-react';
import { ICON_MAP } from '@/constants';
import { useCategories, Category } from '@/hooks/useCategories';
import { useAdminDB } from '@/hooks/useAdminDB';
import { useBuildModeContext } from '@/contexts/BuildModeContext';
import EditableWrapper from '../BuildModeEditor/EditableWrapper';
import { EditorField } from '../BuildModeEditor/InlineEditor';

export default function CategoryGrid() {
  const { selectedCategory, setCategory, language } = useHomeStore();
  const { isAdmin } = useBuildModeContext();
  const { categories, loading, refresh } = useCategories();
  const { updateCategory, createCategory, deleteCategory } = useAdminDB();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const initialItems = 9;
  const activeCategories = categories.filter(c => isAdmin || c.is_active);
  const categoriesToDisplay = isExpanded ? activeCategories : activeCategories.slice(0, initialItems);

  const handleCategoryClick = (catId: string) => {
    const isActive = selectedCategory === catId;
    setCategory(isActive ? null : catId);
    const section = document.getElementById(`category-section-${catId}`);
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleAddCategory = async () => {
    const newCat: Partial<Category> = {
      name_ar: 'تصنيف جديد',
      name_ku: 'پۆلێکی نوێ',
      name_en: 'New Category',
      icon_name: 'TrendingUp',
      image_url: 'https://picsum.photos/seed/newcat/800/1000',
      display_order: categories.length,
      is_active: true
    };
    const { success } = await createCategory(newCat);
    if (success) refresh();
  };

  const categoryFields: EditorField[] = [
    { name: 'name_ar', label: 'الاسم (عربي)', type: 'text' },
    { name: 'name_ku', label: 'الاسم (كردي)', type: 'text' },
    { name: 'name_en', label: 'Name (EN)', type: 'text' },
    { name: 'icon_name', label: 'اسم الأيقونة', type: 'text' },
    { name: 'image_url', label: 'رابط الصورة', type: 'url' },
    { name: 'display_order', label: 'الترتيب', type: 'number' },
    { name: 'is_active', label: 'نشط', type: 'checkbox' }
  ];

  if (loading && categories.length === 0) {
    return (
      <div className="w-full flex justify-center py-10">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full mb-16">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        <AnimatePresence mode="popLayout">
          {categoriesToDisplay.map((cat, idx) => {
            const isActive = selectedCategory === cat.id;
            const Icon = (ICON_MAP as any)[cat.icon_name] || TrendingUp;
            const isHighlighted = idx % 4 === 0;
            const catName = language === 'ar' ? cat.name_ar : language === 'ku' ? cat.name_ku : cat.name_en;

            return (
              <EditableWrapper
                key={cat.id}
                title="تعديل التصنيف"
                fields={categoryFields}
                initialData={cat}
                onSave={async (data) => {
                  const { success } = await updateCategory(cat.id, data);
                  if (success) refresh();
                }}
                onDelete={async () => {
                  const { success } = await deleteCategory(cat.id);
                  if (success) refresh();
                }}
                className={cat.is_active ? '' : 'opacity-40'}
              >
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.03, type: "spring", stiffness: 260, damping: 20 }}
                  whileHover={{ y: -10, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`group relative flex flex-col items-center justify-center aspect-[4/5] rounded-[2.5rem] overflow-hidden transition-all duration-500 border w-full h-full ${
                    isActive ? 'border-primary bg-primary shadow-[0_25px_60px_rgba(15,123,108,0.4)]' : 'border-white/10 bg-white shadow-xl'
                  }`}
                >
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={cat.image_url || `https://picsum.photos/seed/${cat.id}/600/800`}
                      alt={catName}
                      className={`w-full h-full object-cover transition-all duration-1000 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                      referrerPolicy="no-referrer"
                    />
                    <div className={`absolute inset-0 transition-opacity duration-700 ${isActive ? 'bg-primary/20 opacity-100' : 'bg-black/40 opacity-60 group-hover:opacity-40'}`} />
                  </div>

                  <div className="relative z-20 flex flex-col items-center justify-end p-4 sm:p-6 text-center h-full w-full">
                    <motion.div 
                      animate={isActive ? { y: [0, -4, 0] } : {}}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className={`w-12 h-12 sm:w-16 sm:h-16 rounded-[1.5rem] flex items-center justify-center mb-4 transition-all duration-500 ${
                        isActive ? 'bg-accent text-white shadow-lg' : 'bg-white/10 backdrop-blur-md text-white border border-white/10 group-hover:bg-accent'
                      }`}
                    >
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={1.5} />
                    </motion.div>

                    <div className="space-y-1">
                      <h3 className="text-xs sm:text-sm font-black tracking-tight text-white drop-shadow-lg transition-all duration-300 group-hover:scale-105">
                        {catName}
                      </h3>
                      <div className={`h-1 mx-auto rounded-full transition-all duration-500 ${isActive ? 'bg-accent w-12' : 'bg-white/30 group-hover:bg-accent group-hover:w-12 w-8'}`} />
                    </div>
                  </div>
                </motion.button>
              </EditableWrapper>
            );
          })}

          {isAdmin && (
            <button
              onClick={handleAddCategory}
              className="group relative flex flex-col items-center justify-center aspect-[4/5] rounded-[2.5rem] overflow-hidden transition-all duration-500 border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-500"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-[1.5rem] bg-white border border-slate-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400 group-hover:text-emerald-500" />
              </div>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#111827]">
                إضافة تصنيف
              </span>
            </button>
          )}
        </AnimatePresence>
      </div>
      
      {activeCategories.length > initialItems && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 group"
          >
            {isExpanded 
              ? <><RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" /> {language === 'ar' ? 'عرض أقل' : 'Show Less'}</>
              : <><TrendingUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" /> {language === 'ar' ? 'عرض المزيد' : 'Load More Categories'}</>
            }
          </button>
        </div>
      )}
    </div>
  );
}
