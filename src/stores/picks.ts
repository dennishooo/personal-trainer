import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addStoredPick, moveItem, type StoredPick } from '@/lib/macro-calc'

/**
 * Meal-calculator selection, persisted so a half-built meal survives a reload.
 * Everything is keyed by ingredient name (unique per pick, deduped on add) —
 * indices would drift whenever a stale stored pick gets dropped on rehydrate.
 */
interface PicksState {
  picks: StoredPick[]
  addPick: (name: string) => void
  setGrams: (name: string, grams: number) => void
  removePick: (name: string) => void
  movePick: (fromName: string, toName: string) => void
  clearPicks: () => void
}

export const usePicks = create<PicksState>()(
  persist(
    (set) => ({
      picks: [],
      addPick: (name) => set((s) => ({ picks: addStoredPick(s.picks, name) })),
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
