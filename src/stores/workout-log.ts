import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SetEntry } from '@/lib/workout-log'
import { todayISO } from '@/lib/workout-log'

/**
 * Sets performed, by date and exercise. Weight and reps are the user's own
 * measurements, so they are stored verbatim — unlike the dish log, there is no
 * reference dataset that could correct them later.
 */
interface WorkoutLogState {
  sets: SetEntry[]
  /** Date the training page logs against. Not always today — you can back-fill a missed session. */
  logDate: string
  addSet: (exerciseId: string, weightKg: number, reps: number, date?: string) => void
  updateSet: (setId: string, patch: { weightKg?: number; reps?: number }) => void
  removeSet: (setId: string) => void
  clearExercise: (exerciseId: string, date: string) => void
  clearDate: (date: string) => void
  setLogDate: (date: string) => void
}

export const useWorkoutLog = create<WorkoutLogState>()(
  persist(
    (set) => ({
      sets: [],
      logDate: todayISO(),
      addSet: (exerciseId, weightKg, reps, date) =>
        set((s) => ({
          sets: [
            ...s.sets,
            { setId: crypto.randomUUID(), date: date ?? s.logDate, exerciseId, weightKg, reps },
          ],
        })),
      updateSet: (setId, patch) =>
        set((s) => ({ sets: s.sets.map((x) => (x.setId === setId ? { ...x, ...patch } : x)) })),
      removeSet: (setId) => set((s) => ({ sets: s.sets.filter((x) => x.setId !== setId) })),
      clearExercise: (exerciseId, date) =>
        set((s) => ({
          sets: s.sets.filter((x) => !(x.exerciseId === exerciseId && x.date === date)),
        })),
      clearDate: (date) => set((s) => ({ sets: s.sets.filter((x) => x.date !== date) })),
      setLogDate: (logDate) => set({ logDate }),
    }),
    {
      name: 'workout-log-v1',
      // logDate is where you were looking, not what you lifted — opening the
      // app the next morning should land on today, not on last week's session.
      partialize: (s) => ({ sets: s.sets }) as WorkoutLogState,
    },
  ),
)
