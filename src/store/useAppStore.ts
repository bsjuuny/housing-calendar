import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** 간이 자격 체크리스트 항목 키. 판정이 아니라 사용자가 스스로 확인하는 용도. */
export type EligibilityKey = 'noHouse' | 'subscriptionAccount' | 'residentInArea';

interface AppState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (show: boolean) => void;
  eligibilityAnswers: Partial<Record<EligibilityKey, boolean>>;
  setEligibilityAnswer: (key: EligibilityKey, value: boolean) => void;
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
      eligibilityAnswers: {},
      setEligibilityAnswer: (key, value) => set((state) => ({
        eligibilityAnswers: { ...state.eligibilityAnswers, [key]: value }
      })),
    }),
    {
      name: 'housing-calendar-storage',
    }
  )
);
