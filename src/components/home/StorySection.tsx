import React from 'react';
import { Plus, Camera } from 'lucide-react';
import { CATEGORIES } from '@/constants';
import { useHomeStore } from '@/stores/homeStore';

export default function StorySection() {
  const { language, setCategory } = useHomeStore();

  const translations = {
    postStory: { en: 'Post Story', ar: 'نشر قصة', ku: 'پۆستکردنی چیرۆک' },
    yourStory: { en: 'Your Story', ar: 'قصتك', ku: 'چیرۆکی تۆ' }
  };

  return (
    <div className="w-full py-6 bg-white border-b border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {/* Post Story Button */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-50 flex items-center justify-center border-2 border-slate-100 group-hover:border-primary transition-all duration-300">
                <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300 group-hover:text-primary" />
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <Plus className="w-4 h-4 text-bg-dark" />
              </div>
            </div>
            <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter group-hover:text-primary transition-colors">
              {translations.postStory[language]}
            </span>
          </div>

          {/* Category Stories */}
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div 
                key={cat.id} 
                onClick={() => {
                  setCategory(cat.id);
                  const element = document.getElementById('business-grid');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group"
              >
                <div className="relative p-[3px] rounded-full bg-gradient-to-tr from-primary via-secondary to-accent group-hover:rotate-12 transition-transform duration-500">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-white overflow-hidden bg-slate-50">
                    <img 
                      src={cat.image} 
                      alt={cat.name[language]} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-lg" />
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-black text-text-main uppercase tracking-tighter line-clamp-1 max-w-[80px] text-center group-hover:text-primary transition-colors">
                  {cat.name[language]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
