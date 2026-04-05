import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Tag, X, ChevronDown } from 'lucide-react';

interface FilterOption {
  name: string;
  count: number;
}

interface FilterBarProps {
  governorates: FilterOption[];
  categories: FilterOption[];
  selectedGovernorate: string | null;
  selectedCategory: string | null;
  onGovernorateChange: (governorate: string | null) => void;
  onCategoryChange: (category: string | null) => void;
  onReset: () => void;
  totalBusinesses: number;
  filteredCount: number;
}

export default function FilterBar({
  governorates,
  categories,
  selectedGovernorate,
  selectedCategory,
  onGovernorateChange,
  onCategoryChange,
  onReset,
  totalBusinesses,
  filteredCount
}: FilterBarProps) {
  const hasFilters = selectedGovernorate || selectedCategory;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Filters</h2>
          <p className="text-sm text-gray-500">
            Showing {filteredCount.toLocaleString()} of {totalBusinesses.toLocaleString()} businesses
          </p>
        </div>
        {hasFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <X className="w-4 h-4" />
            Reset
          </motion.button>
        )}
      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Governorate Filter */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-500" />
              Governorate
            </span>
          </label>
          <div className="relative">
            <select
              value={selectedGovernorate || ''}
              onChange={(e) => onGovernorateChange(e.target.value || null)}
              className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            >
              <option value="">All Governorates</option>
              {governorates.map((gov) => (
                <option key={gov.name} value={gov.name}>
                  {gov.name} ({gov.count})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Category Filter */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-teal-500" />
              Category
            </span>
          </label>
          <div className="relative">
            <select
              value={selectedCategory || ''}
              onChange={(e) => onCategoryChange(e.target.value || null)}
              className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name} ({cat.count})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {hasFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100"
        >
          <span className="text-sm text-gray-500">Active filters:</span>
          {selectedGovernorate && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full">
              <MapPin className="w-3 h-3" />
              {selectedGovernorate}
              <button
                onClick={() => onGovernorateChange(null)}
                className="ml-1 hover:text-teal-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
              <Tag className="w-3 h-3" />
              {selectedCategory}
              <button
                onClick={() => onCategoryChange(null)}
                className="ml-1 hover:text-purple-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </motion.div>
      )}
    </div>
  );
}
