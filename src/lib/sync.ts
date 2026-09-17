/**
 * Pure half of the sync layer: what gets synced and how snapshots compare.
 * The side-effectful engine (auth, subscriptions, upserts) lives in
 * src/stores/sync.ts; keeping the data shaping here keeps it unit-testable.
 *
 * Each store syncs as one JSONB row per user keyed by SyncKey — last write
 * wins. That's the right trade-off for a personal planner: no merge logic to
 * get wrong, and the schema never blocks adding a field to a store.
 */
import type { Dish } from '@/data/dishes'
import type { LogEntry } from '@/lib/dish-log'
import type { SavedMeal, StoredPick } from '@/lib/macro-calc'
import type { Profile } from '@/lib/nutrition'
import type { WeightEntry } from '@/lib/adjust'
import type { SetEntry } from '@/lib/workout-log'

export const SYNC_KEYS = ['plan', 'picks', 'dishLog', 'customDishes', 'workoutLog'] as const
export type SyncKey = (typeof SYNC_KEYS)[number]

/** The persisted data fields of the plan store — no actions, ever. */
export interface PlanSnapshot {
  profile: Profile
  weights: WeightEntry[]
  supplements: string[]
  favourites: string[]
  calorieOverride: number
}

export interface PicksSnapshot {
  picks: StoredPick[]
  savedMeals: SavedMeal[]
}

export interface DishLogSnapshot {
  entries: LogEntry[]
}

export interface CustomDishesSnapshot {
  dishes: Dish[]
}

export interface WorkoutLogSnapshot {
  sets: SetEntry[]
  /** Per-exercise free-text remarks, keyed by exercise id. */
  remarks: Record<string, string>
}

export function planSnapshot(s: PlanSnapshot): PlanSnapshot {
  const { profile, weights, supplements, favourites, calorieOverride } = s
  return { profile, weights, supplements, favourites, calorieOverride }
}

export function picksSnapshot(s: PicksSnapshot): PicksSnapshot {
  // A remote row written before saved meals existed lacks the field; default
  // it so a sign-in never wipes this device's saved meals with undefined.
  return { picks: s.picks, savedMeals: s.savedMeals ?? [] }
}

export function dishLogSnapshot(s: DishLogSnapshot): DishLogSnapshot {
  // Same defensive default as picks: a row written before the eating-out log
  // existed has no entries field, and undefined must not wipe this device.
  return { entries: s.entries ?? [] }
}

export function customDishesSnapshot(s: CustomDishesSnapshot): CustomDishesSnapshot {
  return { dishes: s.dishes ?? [] }
}

export function workoutLogSnapshot(s: WorkoutLogSnapshot): WorkoutLogSnapshot {
  // Same defensive default as the dish log: a row written before the workout
  // log existed has no sets field — and one written before remarks existed has
  // no remarks field — and undefined must not wipe this device.
  return { sets: s.sets ?? [], remarks: s.remarks ?? {} }
}

/** Structural equality, to skip pushes that would write identical rows. */
export function snapshotsEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
