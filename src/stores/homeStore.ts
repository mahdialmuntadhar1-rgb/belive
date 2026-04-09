import { create } from "zustand";
import { persist } from "zustand/middleware";

interface HomeState {
  selectedGovernorate: string;
  selectedCity: string | null;
  selectedCategory: string | null;
  searchQuery: string;
  sortBy: "trending" | "recent" | "rating";
  language: "en" | "ar" | "ku";

  // Actions
  setGovernorate: (governorate: string) => void;
  setCity: (city: string | null) => void;
  setCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: "trending" | "recent" | "rating") => void;
  setLanguage: (lang: "en" | "ar" | "ku") => void;
  reset: () => void;
}

const DEFAULT_GOVERNORATE = "Baghdad";

export const useHomeStore = create<HomeState>()(
  persist(
    (set) => ({
      selectedGovernorate: DEFAULT_GOVERNORATE,
      selectedCity: null,
      selectedCategory: null,
      searchQuery: "",
      sortBy: "trending",
      language: "en",

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

      reset: () =>
        set({
          selectedGovernorate: DEFAULT_GOVERNORATE,
          selectedCity: null,
          selectedCategory: null,
          searchQuery: "",
          sortBy: "trending",
          language: "en",
        }),
    }),
    {
      name: "home-store",
    }
  )
);
