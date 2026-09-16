import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Dish } from '@/data/dishes'
import { CUSTOM_ID_PREFIX, dishFromDraft, type DishDraft } from '@/lib/custom-dish'

/**
 * Dishes the user added themselves. The shipped set in src/data/dishes.ts is a
 * read-only reference; this is the editable layer merged on top of it.
 *
 * Whole Dish rows are stored here, unlike the log which stores only ids — there
 * is no upstream dataset to re-resolve a custom dish against.
 */
interface CustomDishesState {
  dishes: Dish[]
  addDish: (draft: DishDraft) => string
  updateDish: (id: string, draft: DishDraft) => void
  deleteDish: (id: string) => void
}

export const useCustomDishes = create<CustomDishesState>()(
  persist(
    (set) => ({
      dishes: [],
      addDish: (draft) => {
        const id = `${CUSTOM_ID_PREFIX}${crypto.randomUUID()}`
        set((s) => ({ dishes: [dishFromDraft(draft, id), ...s.dishes] }))
        return id
      },
      // Editing keeps the id, so days that already logged this dish pick up the
      // corrected figures instead of losing the entry.
      updateDish: (id, draft) =>
        set((s) => ({ dishes: s.dishes.map((d) => (d.id === id ? dishFromDraft(draft, id) : d)) })),
      deleteDish: (id) => set((s) => ({ dishes: s.dishes.filter((d) => d.id !== id) })),
    }),
    { name: 'custom-dishes-v1' },
  ),
)
