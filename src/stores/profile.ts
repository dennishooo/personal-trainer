import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile, Goal, ActivityKey } from '@/lib/nutrition'
import type { WeightEntry } from '@/lib/adjust'

export interface CheckedState {
  /** Supplement ids the user has opted into. */
  supplements: string[]
  /** Recipe ids saved as favourites. */
  favourites: string[]
}

interface PlanState extends CheckedState {
  profile: Profile
  weights: WeightEntry[]
  /** Manual calorie offset the user has accepted from the adjustment engine. */
  calorieOverride: number
  setProfile: (patch: Partial<Profile>) => void
  addWeight: (entry: WeightEntry) => void
  removeWeight: (date: string) => void
  toggleSupplement: (id: string) => void
  toggleFavourite: (id: string) => void
  applyCalorieDelta: (delta: number) => void
  resetOverride: () => void
  setGoal: (goal: Goal) => void
  setActivity: (a: ActivityKey) => void
}

const DEFAULT_PROFILE: Profile = {
  birthDate: '1993-07-02',
  sex: 'male',
  heightCm: 178,
  weightKg: 78.8,
  goal: 'recomp',
  activity: 'moderate',
  liftDaysPerWeek: 4,
  cardioDaysPerWeek: 2,
}

const DEFAULT_SUPPLEMENTS = ['whey', 'creatine', 'vitamin-d', 'omega3']

export const usePlan = create<PlanState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      weights: [{ date: new Date().toISOString().slice(0, 10), weightKg: 78.8 }],
      supplements: DEFAULT_SUPPLEMENTS,
      favourites: [],
      calorieOverride: 0,

      setProfile: (patch) =>
        set((s) => {
          const profile = { ...s.profile, ...patch }
          // Logging a new bodyweight through the profile should also land in the
          // history, otherwise the trend chart silently disagrees with the header.
          if (patch.weightKg && patch.weightKg !== s.profile.weightKg) {
            const today = new Date().toISOString().slice(0, 10)
            const weights = [
              ...s.weights.filter((w) => w.date !== today),
              { date: today, weightKg: patch.weightKg },
            ].sort((a, b) => a.date.localeCompare(b.date))
            return { profile, weights }
          }
          return { profile }
        }),

      addWeight: (entry) =>
        set((s) => {
          const weights = [...s.weights.filter((w) => w.date !== entry.date), entry].sort((a, b) =>
            a.date.localeCompare(b.date),
          )
          // The profile always reflects the most recent weigh-in.
          const latest = weights[weights.length - 1]
          return { weights, profile: { ...s.profile, weightKg: latest.weightKg } }
        }),

      removeWeight: (date) =>
        set((s) => {
          const weights = s.weights.filter((w) => w.date !== date)
          if (weights.length === 0) return { weights }
          const latest = weights[weights.length - 1]
          return { weights, profile: { ...s.profile, weightKg: latest.weightKg } }
        }),

      toggleSupplement: (id) =>
        set((s) => ({
          supplements: s.supplements.includes(id)
            ? s.supplements.filter((x) => x !== id)
            : [...s.supplements, id],
        })),

      toggleFavourite: (id) =>
        set((s) => ({
          favourites: s.favourites.includes(id)
            ? s.favourites.filter((x) => x !== id)
            : [...s.favourites, id],
        })),

      applyCalorieDelta: (delta) => set((s) => ({ calorieOverride: s.calorieOverride + delta })),
      resetOverride: () => set({ calorieOverride: 0 }),
      setGoal: (goal) => set((s) => ({ profile: { ...s.profile, goal }, calorieOverride: 0 })),
      setActivity: (activity) => set((s) => ({ profile: { ...s.profile, activity } })),
    }),
    { name: 'personal-plan-v1' },
  ),
)
