import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import {
  customDishesSnapshot,
  dishLogSnapshot,
  picksSnapshot,
  planSnapshot,
  snapshotsEqual,
  SYNC_KEYS,
  workoutLogSnapshot,
  type CustomDishesSnapshot,
  type DishLogSnapshot,
  type PicksSnapshot,
  type PlanSnapshot,
  type SyncKey,
  type WorkoutLogSnapshot,
} from '@/lib/sync'
import { usePlan } from '@/stores/profile'
import { usePicks } from '@/stores/picks'
import { useDishLog } from '@/stores/dish-log'
import { useCustomDishes } from '@/stores/custom-dishes'
import { useWorkoutLog } from '@/stores/workout-log'

/**
 * The side-effectful half of sync: watches auth, pulls the signed-in user's
 * rows, then write-through-syncs store changes (debounced, last write wins).
 * localStorage stays the source of truth for signed-out and offline use.
 */

// 'restoring' is the moment between page load and Supabase resolving whether a
// session exists — the auth gate shows a splash instead of flashing the sign-in.
export type SyncStatus = 'local-only' | 'restoring' | 'signed-out' | 'syncing' | 'synced' | 'error'

interface SyncUiState {
  status: SyncStatus
  email: string | null
  error: string | null
}

export const useSync = create<SyncUiState>(() => ({
  status: supabase ? 'restoring' : 'local-only',
  email: null,
  error: null,
}))

// One active connection per signed-in user; module-level because the engine
// outlives any component.
let connectedUserId: string | null = null
let applyingRemote = false
let lastPushed: Partial<Record<SyncKey, unknown>> = {}
const timers: Partial<Record<SyncKey, ReturnType<typeof setTimeout>>> = {}
let unsubscribes: (() => void)[] = []

type Snapshot = PlanSnapshot | PicksSnapshot | DishLogSnapshot | CustomDishesSnapshot | WorkoutLogSnapshot

function takeSnapshot(key: SyncKey): Snapshot {
  if (key === 'plan') return planSnapshot(usePlan.getState())
  if (key === 'picks') return picksSnapshot(usePicks.getState())
  if (key === 'dishLog') return dishLogSnapshot(useDishLog.getState())
  if (key === 'workoutLog') return workoutLogSnapshot(useWorkoutLog.getState())
  return customDishesSnapshot(useCustomDishes.getState())
}

/** Call once at app start. A no-op when Supabase isn't configured. */
export function startSync() {
  if (!supabase) return
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      // Token refreshes re-fire this for the same user; only connect once.
      if (session.user.id !== connectedUserId) void connect(session.user.id, session.user.email ?? null)
    } else {
      disconnect()
    }
  })
}

async function connect(userId: string, email: string | null) {
  if (!supabase) return
  connectedUserId = userId
  useSync.setState({ status: 'syncing', email, error: null })

  const { data, error } = await supabase.from('user_state').select('key,data').eq('user_id', userId)
  if (error) {
    useSync.setState({ status: 'error', error: error.message })
    return
  }
  const remote = new Map(data.map((r) => [r.key as SyncKey, r.data]))

  // Remote wins when it exists — it's the cross-device truth. A first sign-in
  // has no rows yet, so this browser's local data seeds the account instead.
  applyingRemote = true
  if (remote.has('plan')) usePlan.setState(remote.get('plan') as PlanSnapshot)
  if (remote.has('picks')) usePicks.setState(remote.get('picks') as PicksSnapshot)
  if (remote.has('dishLog')) useDishLog.setState(remote.get('dishLog') as DishLogSnapshot)
  if (remote.has('customDishes')) useCustomDishes.setState(remote.get('customDishes') as CustomDishesSnapshot)
  if (remote.has('workoutLog')) useWorkoutLog.setState(remote.get('workoutLog') as WorkoutLogSnapshot)
  applyingRemote = false

  for (const key of SYNC_KEYS) {
    const snap = takeSnapshot(key)
    lastPushed[key] = remote.get(key)
    if (!remote.has(key)) await push(userId, key, snap)
  }

  unsubscribes = [
    usePlan.subscribe(() => queuePush(userId, 'plan')),
    usePicks.subscribe(() => queuePush(userId, 'picks')),
    useDishLog.subscribe(() => queuePush(userId, 'dishLog')),
    useCustomDishes.subscribe(() => queuePush(userId, 'customDishes')),
    useWorkoutLog.subscribe(() => queuePush(userId, 'workoutLog')),
  ]
  useSync.setState({ status: 'synced' })
}

function queuePush(userId: string, key: SyncKey) {
  if (applyingRemote || userId !== connectedUserId) return
  clearTimeout(timers[key])
  timers[key] = setTimeout(() => {
    const snap = takeSnapshot(key)
    if (snapshotsEqual(snap, lastPushed[key])) return
    void push(userId, key, snap)
  }, 800)
}

async function push(userId: string, key: SyncKey, data: Snapshot) {
  if (!supabase) return
  const { error } = await supabase
    .from('user_state')
    .upsert({ user_id: userId, key, data, updated_at: new Date().toISOString() })
  if (error) {
    useSync.setState({ status: 'error', error: error.message })
  } else {
    lastPushed[key] = data
    useSync.setState({ status: 'synced', error: null })
  }
}

function disconnect() {
  unsubscribes.forEach((u) => u())
  unsubscribes = []
  connectedUserId = null
  lastPushed = {}
  useSync.setState({ status: supabase ? 'signed-out' : 'local-only', email: null, error: null })
}

/** Sends a magic sign-in link. The link lands back on this page. */
export async function signInWithEmail(email: string): Promise<string | null> {
  if (!supabase) return 'Sync is not configured'
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.href },
  })
  return error ? error.message : null
}

/**
 * Google OAuth sign-in. Needs the Google provider enabled in Supabase
 * (Auth → Sign In/Providers) with a Google Cloud OAuth client behind it.
 */
export async function signInWithGoogle(): Promise<string | null> {
  if (!supabase) return 'Sync is not configured'
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.href },
  })
  return error ? error.message : null
}

/** Signs out. Local data stays on this device, exactly as before sync. */
export async function signOut() {
  await supabase?.auth.signOut()
}
