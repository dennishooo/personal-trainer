import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import {
  picksSnapshot,
  planSnapshot,
  snapshotsEqual,
  type PicksSnapshot,
  type PlanSnapshot,
  type SyncKey,
} from '@/lib/sync'
import { usePlan } from '@/stores/profile'
import { usePicks } from '@/stores/picks'

/**
 * The side-effectful half of sync: watches auth, pulls the signed-in user's
 * rows, then write-through-syncs store changes (debounced, last write wins).
 * localStorage stays the source of truth for signed-out and offline use.
 */

export type SyncStatus = 'local-only' | 'signed-out' | 'syncing' | 'synced' | 'error'

interface SyncUiState {
  status: SyncStatus
  email: string | null
  error: string | null
}

export const useSync = create<SyncUiState>(() => ({
  status: supabase ? 'signed-out' : 'local-only',
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

function takeSnapshot(key: SyncKey): PlanSnapshot | PicksSnapshot {
  return key === 'plan' ? planSnapshot(usePlan.getState()) : picksSnapshot(usePicks.getState())
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
  applyingRemote = false

  for (const key of ['plan', 'picks'] as const) {
    const snap = takeSnapshot(key)
    lastPushed[key] = remote.get(key)
    if (!remote.has(key)) await push(userId, key, snap)
  }

  unsubscribes = [
    usePlan.subscribe(() => queuePush(userId, 'plan')),
    usePicks.subscribe(() => queuePush(userId, 'picks')),
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

async function push(userId: string, key: SyncKey, data: PlanSnapshot | PicksSnapshot) {
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

/** Signs out. Local data stays on this device, exactly as before sync. */
export async function signOut() {
  await supabase?.auth.signOut()
}
