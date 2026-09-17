import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { EMPTY_STORED_FILTERS, type StoredFilters } from '@/lib/nutrition-filter'
import type { Cuisine, Slot } from '@/data/meals'
import type { DishCuisine, DishVerdict } from '@/data/dishes'

/**
 * Cross-page UI choices — active tab, filters, sorts — persisted so nothing
 * resets when the user switches pages or reloads. Kept separate from the plan
 * store because these are ephemeral preferences, not health data.
 */

export type TabId =
  | 'dashboard'
  | 'week'
  | 'meals'
  | 'eating-out'
  | 'nutrition'
  | 'training'
  | 'supplements'
  | 'profile'

export interface MealsFilters {
  slot: Slot
  cuisine: Cuisine | 'all'
  query: string
}

export interface DishFiltersState {
  query: string
  cuisine: DishCuisine | 'all'
  verdict: DishVerdict | 'all'
}

interface UiState {
  tab: TabId
  nutrition: StoredFilters
  nutritionFiltersOpen: boolean
  meals: MealsFilters
  dishes: DishFiltersState
  /** Day selected on the Training page (`'Monday'`…), or null for the full library view. */
  trainingDay: string | null
  /** Travelling with no equipment — the Training page swaps to the bodyweight plan. */
  travelMode: boolean
  /** Travel workout selected on the Training page (`'travel-a'`…), or null for the overview. */
  travelWorkout: string | null
  setTab: (tab: TabId) => void
  setNutrition: (patch: Partial<StoredFilters>) => void
  setNutritionFiltersOpen: (open: boolean) => void
  setMeals: (patch: Partial<MealsFilters>) => void
  setDishes: (patch: Partial<DishFiltersState>) => void
  setTrainingDay: (day: string | null) => void
  setTravelMode: (on: boolean) => void
  setTravelWorkout: (id: string | null) => void
}

export const useUi = create<UiState>()(
  persist(
    (set) => ({
      tab: 'dashboard',
      nutrition: EMPTY_STORED_FILTERS,
      nutritionFiltersOpen: false,
      meals: { slot: 'breakfast', cuisine: 'all', query: '' },
      dishes: { query: '', cuisine: 'all', verdict: 'all' },
      trainingDay: null,
      travelMode: false,
      travelWorkout: null,
      setTab: (tab) => set({ tab }),
      setTrainingDay: (day) => set({ trainingDay: day }),
      setTravelMode: (on) => set({ travelMode: on }),
      setTravelWorkout: (id) => set({ travelWorkout: id }),
      setNutrition: (patch) => set((s) => ({ nutrition: { ...s.nutrition, ...patch } })),
      setNutritionFiltersOpen: (open) => set({ nutritionFiltersOpen: open }),
      setMeals: (patch) => set((s) => ({ meals: { ...s.meals, ...patch } })),
      setDishes: (patch) => set((s) => ({ dishes: { ...s.dishes, ...patch } })),
    }),
    { name: 'ui-prefs-v1' },
  ),
)
