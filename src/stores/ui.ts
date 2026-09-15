import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { EMPTY_STORED_FILTERS, type StoredFilters } from '@/lib/nutrition-filter'
import type { Cuisine, Slot } from '@/data/meals'

/**
 * Cross-page UI choices — active tab, filters, sorts — persisted so nothing
 * resets when the user switches pages or reloads. Kept separate from the plan
 * store because these are ephemeral preferences, not health data.
 */

export type TabId =
  | 'dashboard'
  | 'week'
  | 'meals'
  | 'nutrition'
  | 'training'
  | 'supplements'
  | 'profile'

export interface MealsFilters {
  slot: Slot
  cuisine: Cuisine | 'all'
  query: string
}

interface UiState {
  tab: TabId
  nutrition: StoredFilters
  nutritionFiltersOpen: boolean
  meals: MealsFilters
  setTab: (tab: TabId) => void
  setNutrition: (patch: Partial<StoredFilters>) => void
  setNutritionFiltersOpen: (open: boolean) => void
  setMeals: (patch: Partial<MealsFilters>) => void
}

export const useUi = create<UiState>()(
  persist(
    (set) => ({
      tab: 'dashboard',
      nutrition: EMPTY_STORED_FILTERS,
      nutritionFiltersOpen: false,
      meals: { slot: 'breakfast', cuisine: 'all', query: '' },
      setTab: (tab) => set({ tab }),
      setNutrition: (patch) => set((s) => ({ nutrition: { ...s.nutrition, ...patch } })),
      setNutritionFiltersOpen: (open) => set({ nutritionFiltersOpen: open }),
      setMeals: (patch) => set((s) => ({ meals: { ...s.meals, ...patch } })),
    }),
    { name: 'ui-prefs-v1' },
  ),
)
