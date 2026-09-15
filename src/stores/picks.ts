import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addStoredPick, moveItem, upsertSavedMeal, type SavedMeal, type StoredPick } from '@/lib/macro-calc'

/**
 * Meal-calculator selection, persisted so a half-built meal survives a reload.
 * Everything is keyed by ingredient name (unique per pick, deduped on add) —
 * indices would drift whenever a stale stored pick gets dropped on rehydrate.
 * Saved meals are named snapshots of the picks, loadable back at any time.
 */
interface PicksState {
  picks: StoredPick[]
  savedMeals: SavedMeal[]
  addPick: (name: string) => void
  setGrams: (name: string, grams: number) => void
  removePick: (name: string) => void
  movePick: (fromName: string, toName: string) => void
  clearPicks: () => void
  saveMeal: (name: string) => void
  loadMeal: (id: string) => void
  deleteMeal: (id: string) => void
}

export const usePicks = create<PicksState>()(
  persist(
    (set) => ({
      picks: [],
      savedMeals: [],
      addPick: (name) => set((s) => ({ picks: addStoredPick(s.picks, name) })),
      saveMeal: (name) =>
        set((s) => ({ savedMeals: upsertSavedMeal(s.savedMeals, name, s.picks, () => crypto.randomUUID()) })),
      loadMeal: (id) =>
        set((s) => {
          const meal = s.savedMeals.find((m) => m.id === id)
          return meal ? { picks: meal.picks.map((p) => ({ ...p })) } : {}
        }),
      deleteMeal: (id) => set((s) => ({ savedMeals: s.savedMeals.filter((m) => m.id !== id) })),
      setGrams: (name, grams) =>
        set((s) => ({ picks: s.picks.map((p) => (p.name === name ? { ...p, grams } : p)) })),
      removePick: (name) => set((s) => ({ picks: s.picks.filter((p) => p.name !== name) })),
      movePick: (fromName, toName) =>
        set((s) => ({
          picks: moveItem(
            s.picks,
            s.picks.findIndex((p) => p.name === fromName),
            s.picks.findIndex((p) => p.name === toName),
          ),
        })),
      clearPicks: () => set({ picks: [] }),
    }),
    { name: 'meal-calc-v1' },
  ),
)
