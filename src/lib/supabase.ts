import { createClient } from '@supabase/supabase-js'

/**
 * Null when Supabase isn't configured, and the app then runs exactly as before
 * — local-only, everything in localStorage. Sync is strictly additive.
 *
 * The anon key is a publishable key, safe to ship in the bundle; row-level
 * security on the tables is what protects each user's data.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase = url && anonKey ? createClient(url, anonKey) : null
