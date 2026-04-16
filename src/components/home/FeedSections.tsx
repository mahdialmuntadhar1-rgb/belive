import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from '@/lib/supabaseClient';
import { useHomeStore } from '@/stores/homeStore';

interface LiveFeedSection {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  image_url: string;
}

export default function FeedSections() {
  const [sections, setSections] = useState<LiveFeedSection[]>([]);
  const { language } = useHomeStore();

  useEffect(() => {
    async function loadSections() {
      const { data, error } = await supabase
        .from('feed_sections')
        .select('*')
        .eq('visibility', true)
        .order('sort_order', { ascending: true });

      if (!error && data) {
        setSections(data);
      }
    }
    loadSections();
  }, []);

  if (sections.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 mb-20 space-y-16">
      {sections.map((section, index) => {
        const isReversed = index % 2 !== 0;
        return (
          <motion.div 
            key={section.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className={`flex flex-col md:flex-row gap-8 lg:gap-16 items-center ${isReversed ? 'md:flex-row-reverse' : ''}`}
          >
            <div className="w-full md:w-1/2">
              <div className="relative aspect-video sm:aspect-square md:aspect-[4/3] rounded-[40px] overflow-hidden shadow-2xl group">
                <img 
                  src={section.image_url} 
                  alt={section.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/10 transition-opacity duration-300 group-hover:opacity-0" />
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-4 lg:space-y-6">
              {section.subtitle && (
                <div className="inline-block px-4 py-1.5 bg-[#C8A96A]/10 text-[#C8A96A] rounded-full text-xs font-black uppercase tracking-widest">
                  {section.subtitle}
                </div>
              )}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#111827] poppins-bold uppercase tracking-tight leading-tight">
                {section.title}
              </h2>
              {section.content && (
                <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed">
                  {section.content}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
