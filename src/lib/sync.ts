/**
 * Pure half of the sync layer: what gets synced and how snapshots compare.
 * The side-effectful engine (auth, subscriptions, upserts) lives in
 * src/stores/sync.ts; keeping the data shaping here keeps it unit-testable.
 *
 * Each store syncs as one JSONB row per user keyed by SyncKey — last write
 * wins. That's the right trade-off for a personal planner: no merge logic to
 * get wrong, and the schema never blocks adding a field to a store.
 */
import type { StoredPick } from '@/lib/macro-calc'
import type { Profile } from '@/lib/nutrition'
import type { WeightEntry } from '@/lib/adjust'

export const SYNC_KEYS = ['plan', 'picks'] as const
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
}

export function planSnapshot(s: PlanSnapshot): PlanSnapshot {
  const { profile, weights, supplements, favourites, calorieOverride } = s
  return { profile, weights, supplements, favourites, calorieOverride }
}

export function picksSnapshot(s: PicksSnapshot): PicksSnapshot {
  return { picks: s.picks }
}

/** Structural equality, to skip pushes that would write identical rows. */
export function snapshotsEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
