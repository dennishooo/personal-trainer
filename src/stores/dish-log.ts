import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LogEntry } from '@/lib/dish-log'
import { todayISO } from '@/lib/dish-log'

/**
 * What was eaten out, by date. Entries store a dish id and a portion
 * multiplier rather than a copy of the macros, so a corrected figure in
 * src/data/dishes.ts fixes the history too.
 */
interface DishLogState {
  entries: LogEntry[]
  /** Date the log page is showing. Not the same as today — you can review back. */
  viewDate: string
  logDish: (dishId: string, portions?: number, date?: string) => void
  setPortions: (entryId: string, portions: number) => void
  removeEntry: (entryId: string) => void
  clearDate: (date: string) => void
  setViewDate: (date: string) => void
}

export const useDishLog = create<DishLogState>()(
  persist(
    (set) => ({
      entries: [],
      viewDate: todayISO(),
      logDish: (dishId, portions = 1, date) =>
        set((s) => ({
          entries: [
            ...s.entries,
            { entryId: crypto.randomUUID(), date: date ?? s.viewDate, dishId, portions },
          ],
        })),
      setPortions: (entryId, portions) =>
        set((s) => ({
          entries: s.entries.map((e) => (e.entryId === entryId ? { ...e, portions } : e)),
        })),
      removeEntry: (entryId) => set((s) => ({ entries: s.entries.filter((e) => e.entryId !== entryId) })),
      clearDate: (date) => set((s) => ({ entries: s.entries.filter((e) => e.date !== date) })),
      setViewDate: (viewDate) => set({ viewDate }),
    }),
    {
      name: 'dish-log-v1',
      // viewDate is where you were looking, not what you ate — a reload the
      // next morning should open on today, not on last week's review.
      partialize: (s) => ({ entries: s.entries }) as DishLogState,
    },
  ),
)
