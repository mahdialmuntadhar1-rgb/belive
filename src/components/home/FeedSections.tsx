/**
 * Feed Sections Component
 * Renders homepage feed sections from Supabase only
 * No local fallbacks - Supabase is the single source of truth
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useAdminDB, FeedSection } from '@/hooks/useAdminDB';
import { useHomeStore } from '@/stores/homeStore';

export default function FeedSections() {
  const { language } = useHomeStore();
  const { fetchFeedSections, loading } = useAdminDB();
  const [sections, setSections] = useState<FeedSection[]>([]);

  useEffect(() => {
    const loadSections = async () => {
      try {
        const data = await fetchFeedSections();
        setSections(data);
      } catch (err) {
        console.error('Failed to load feed sections:', err);
      }
    };
    loadSections();
  }, [fetchFeedSections]);

  if (loading && sections.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (sections.length === 0) {
    return null;
  }

  const isRTL = language === 'ar' || language === 'ku';

  return (
    <div className="space-y-16 py-12">
      {sections.map((section, index) => (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="max-w-7xl mx-auto px-4"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-black text-[#111827] poppins-bold uppercase tracking-tighter mb-4">
              {language === 'ar' ? section.title_ar : language === 'ku' ? section.title_ku : section.title_en}
            </h2>
            {section.description_en && (
              <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
                {language === 'ar' ? section.description_ar : language === 'ku' ? section.description_ku : section.description_en}
              </p>
            )}
          </div>

          {/* Section content based on type */}
          {section.section_type === 'featured' && (
            <div className="bg-gradient-to-br from-[#0F7B6C] to-[#0d6b5e] rounded-[48px] p-8 sm:p-12 text-white">
              <p className="text-center text-sm font-bold uppercase tracking-widest opacity-80">
                Featured Section Content
              </p>
            </div>
          )}

          {section.section_type === 'trending' && (
            <div className="bg-gradient-to-br from-[#C8A96A] to-[#b8944f] rounded-[48px] p-8 sm:p-12 text-white">
              <p className="text-center text-sm font-bold uppercase tracking-widest opacity-80">
                Trending Section Content
              </p>
            </div>
          )}

          {section.section_type === 'categories' && (
            <div className="bg-white rounded-[48px] p-8 sm:p-12 border border-slate-100 shadow-2xl">
              <p className="text-center text-sm font-bold uppercase tracking-widest text-slate-400">
                Categories Section Content
              </p>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
