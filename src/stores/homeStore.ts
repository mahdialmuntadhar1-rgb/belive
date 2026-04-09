import { create } from "zustand";
import { persist } from "zustand/middleware";

interface HomeState {
  selectedGovernorate: string;
  selectedCity: string | null;
  selectedCategory: string | null;
  searchQuery: string;
  sortBy: "trending" | "recent" | "rating";
  language: "en" | "ar" | "ku";
  activeTab: "mycity" | "shakumaku";
  categoryDisplayCounts: Record<string, number>; // Per-category display count (incremental: 3,6,9...)

  // Actions
  setGovernorate: (governorate: string) => void;
  setCity: (city: string | null) => void;
  setCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: "trending" | "recent" | "rating") => void;
  setLanguage: (lang: "en" | "ar" | "ku") => void;
  setActiveTab: (tab: "mycity" | "shakumaku") => void;
  incrementCategoryDisplay: (categoryId: string, totalCount: number) => void;
  resetCategoryDisplay: (categoryId: string) => void;
  reset: () => void;
}

const DEFAULT_GOVERNORATE = "baghdad"; // Must match lowercase IDs in constants.ts GOVERNORATES

export const useHomeStore = create<HomeState>()(
  persist(
    (set) => ({
      selectedGovernorate: DEFAULT_GOVERNORATE,
      selectedCity: null,
      selectedCategory: null,
      searchQuery: "",
      sortBy: "trending",
      language: "en",
      activeTab: "mycity",
      categoryDisplayCounts: {},

      setGovernorate: (governorate) =>
        set({ selectedGovernorate: governorate, selectedCity: null }),

      setCity: (city) =>
        set({ selectedCity: city }),

      setCategory: (category) =>
        set({ selectedCategory: category }),

      setSearchQuery: (query) =>
        set({ searchQuery: query }),

      setSortBy: (sort) =>
        set({ sortBy: sort }),

      setLanguage: (lang) =>
        set({ language: lang }),

      setActiveTab: (tab) =>
        set({ activeTab: tab }),

      // Increment display count by 3, capped at totalCount
      incrementCategoryDisplay: (categoryId, totalCount) =>
        set((state) => {
          const currentCount = state.categoryDisplayCounts[categoryId] || 3;
          const newCount = Math.min(currentCount + 3, totalCount);
          return {
            categoryDisplayCounts: {
              ...state.categoryDisplayCounts,
              [categoryId]: newCount
            }
          };
        }),

      // Reset to initial 3 items
      resetCategoryDisplay: (categoryId) =>
        set((state) => ({
          categoryDisplayCounts: {
            ...state.categoryDisplayCounts,
            [categoryId]: 3
          }
        })),

      reset: () =>
        set({
          selectedGovernorate: DEFAULT_GOVERNORATE,
          selectedCity: null,
          selectedCategory: null,
          searchQuery: "",
          sortBy: "trending",
          language: "en",
          activeTab: "mycity",
          categoryDisplayCounts: {},
        }),
    }),
    {
      name: "home-store",
    }
  )
);
