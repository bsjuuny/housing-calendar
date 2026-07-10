import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (show: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
      favorites: [],
      toggleFavorite: (id) => set((state) => ({
        favorites: state.favorites.includes(id)
          ? state.favorites.filter((favId) => favId !== id)
          : [...state.favorites, id]
      })),
      showFavoritesOnly: false,
      setShowFavoritesOnly: (show) => set({ showFavoritesOnly: show }),
    }),
    {
      name: 'housing-calendar-storage',
    }
  )
);
