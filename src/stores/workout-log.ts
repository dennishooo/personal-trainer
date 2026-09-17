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
  /**
   * One free-text remark per exercise, keyed by exercise id like the sets —
   * "left shoulder clicks, keep elbows tucked" is about the movement, not any
   * one session, so it lives alongside the exercise rather than on a set.
   */
  remarks: Record<string, string>
  /** Date the training page logs against. Not always today — you can back-fill a missed session. */
  logDate: string
  addSet: (exerciseId: string, weightKg: number, reps: number, date?: string) => void
  updateSet: (setId: string, patch: { weightKg?: number; reps?: number }) => void
  removeSet: (setId: string) => void
  clearExercise: (exerciseId: string, date: string) => void
  clearDate: (date: string) => void
  setLogDate: (date: string) => void
  /** An empty or whitespace-only text removes the remark rather than storing a blank. */
  setRemark: (exerciseId: string, text: string) => void
}

export const useWorkoutLog = create<WorkoutLogState>()(
  persist(
    (set) => ({
      sets: [],
      remarks: {},
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
      setRemark: (exerciseId, text) =>
        set((s) => {
          const trimmed = text.trim()
          if (trimmed === '') {
            const { [exerciseId]: _, ...rest } = s.remarks
            return { remarks: rest }
          }
          return { remarks: { ...s.remarks, [exerciseId]: trimmed } }
        }),
    }),
    {
      name: 'workout-log-v1',
      // logDate is where you were looking, not what you lifted — opening the
      // app the next morning should land on today, not on last week's session.
      partialize: (s) => ({ sets: s.sets, remarks: s.remarks }) as WorkoutLogState,
    },
  ),
)
