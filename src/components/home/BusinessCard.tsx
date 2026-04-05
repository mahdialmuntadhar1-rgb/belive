import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Phone, Globe, Heart, CheckCircle } from 'lucide-react';
import type { Business } from '@/lib/supabase';

interface BusinessCardProps {
  business: Business;
  onClick?: (business: Business) => void;
  index?: number;
}

export default function BusinessCard({ business, onClick, index = 0 }: BusinessCardProps) {
  // Fallback values for null/undefined fields
  const name = business.name || 'Unnamed Business';
  const nameAr = business.nameAr || name;
  const nameKu = business.nameKu || name;
  const category = business.category || 'Uncategorized';
  const governorate = business.governorate || 'Unknown Location';
  const city = business.city || governorate;
  const rating = business.rating || 0;
  const reviewCount = business.reviewCount || 0;
  const isVerified = business.isVerified || false;
  const isFeatured = business.isFeatured || false;
  const image = business.image || `https://picsum.photos/seed/${business.id}/400/300`;
  const phone = business.phone || null;
  const website = business.website || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={() => onClick?.(business)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${business.id}/400/300`;
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {isFeatured && (
            <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg">
              Featured
            </span>
          )}
          {isVerified && (
            <span className="px-2 py-1 bg-teal-500 text-white text-xs font-bold rounded-lg flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implement favorite functionality
          }}
        >
          <Heart className="w-4 h-4 text-gray-600" />
        </button>

        {/* Category Badge */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium rounded-lg">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Names */}
        <div>
          <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-1">
            {name}
          </h3>
          {nameAr !== name && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1" dir="rtl">
              {nameAr}
            </p>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="line-clamp-1">
            {city}, {governorate}
          </span>
        </div>

        {/* Rating & Reviews */}
        {rating > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-gray-900 text-sm">
                {rating.toFixed(1)}
              </span>
            </div>
            {reviewCount > 0 && (
              <span className="text-sm text-gray-400">
                ({reviewCount} reviews)
              </span>
            )}
          </div>
        )}

        {/* Contact Actions */}
        <div className="flex items-center gap-2 pt-2">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-teal-50 text-teal-700 text-sm font-medium rounded-lg hover:bg-teal-100 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Phone className="w-4 h-4" />
              Call
            </a>
          )}
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Globe className="w-4 h-4" />
              Website
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
