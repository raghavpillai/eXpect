import { create } from "zustand";

interface SearchQueryState {
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
}

export const useSearchQueryStore = create<SearchQueryState>((set) => ({
  searchQuery: "",
  setSearchQuery: (searchQuery: string) => {
    set({ searchQuery });
  },
}));
