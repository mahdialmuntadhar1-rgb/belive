import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Sparkles, TrendingUp, Users, ShieldCheck, LayoutDashboard, ArrowRight, Download, Briefcase, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Business } from '@/lib/supabase';
import { useHomeStore } from '@/stores/homeStore';
import { heroContent } from '@/data/heroContent';

interface HeroSectionProps {
  businesses: Business[];
  onBusinessClick?: (business: Business) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function HeroSection({ businesses, onBusinessClick, searchQuery, setSearchQuery }: HeroSectionProps) {
  const { language } = useHomeStore();
  const content = heroContent[language] || heroContent['ar'];
  const isRTL = language === 'ar' || language === 'ku';

  return (
    <div className="w-full px-4 mb-12 sm:mb-20">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden rounded-[48px] aspect-square bg-gradient-to-br from-[#0F7B6C] to-[#0d6857]">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 sm:p-16">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-6 poppins-bold tracking-tighter">
              {content.title}
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl">
              {content.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <input
                type="text"
                placeholder={content.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-6 py-4 rounded-full bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button className="px-8 py-4 bg-[#C8A96A] text-[#0F7B6C] rounded-full font-black hover:bg-[#b89a5a] transition-colors">
                {content.searchButton}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
