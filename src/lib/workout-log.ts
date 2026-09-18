/**
 * Workout log: the sets you actually performed, and what they imply about
 * whether it is time to add weight.
 *
 * Pure arithmetic only — the store owns persistence and the page owns layout,
 * so all of this stays unit-testable without React or localStorage.
 *
 * Sets are stored per exercise per date, keyed by exercise id rather than by a
 * copy of the exercise row, so editing src/data/training.ts never orphans
 * history. Unlike the dish log, the numbers here ARE the user's own data —
 * weight and reps are what they lifted, not a reference figure — so they are
 * stored verbatim and never recomputed from the dataset.
 */
import type { Exercise } from '@/data/training'
import { DUMBBELL_STEP_KG } from '@/data/training'

/** One performed set. */
export interface SetEntry {
  /** Unique per set — the same exercise has several, and they are edited individually. */
  setId: string
  /** ISO yyyy-mm-dd, the day the session happened. */
  date: string
  exerciseId: string
  /**
   * Load in kg, as the user entered it. 0 means bodyweight — planks and
   * push-ups are logged for reps alone, and a null here would make every
   * comparison in this module need a branch.
   */
  weightKg: number
  /** Reps completed. For timed holds (planks) this is seconds — the exercise's own rep string says which. */
  reps: number
}

/** A session is every set logged for one exercise on one date, in entry order. */
export interface ExerciseSession {
  date: string
  exerciseId: string
  sets: SetEntry[]
}

export function todayISO(now = new Date()): string {
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
}

/** Shifts an ISO date by whole days, staying in local time. */
export function shiftISO(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  return todayISO(new Date(y, m - 1, d + days))
}

/**
 * An exercise measured in seconds rather than reps — planks and other holds.
 * The dataset writes these as `'30–60 sec'`, so the unit lives in that string
 * rather than in a separate field that could drift out of sync with it.
 */
export function isTimed(ex: Exercise): boolean {
  return /sec|min/i.test(ex.reps)
}

/**
 * The numeric rep range behind an exercise's rep string. Handles the en-dash
 * the dataset uses, the plain hyphen a future entry might use, and trailing
 * qualifiers like "per leg". Returns null when there is no range to parse,
 * which is what keeps the progression prompt silent rather than wrong.
 */
export function repRange(ex: Exercise): { min: number; max: number } | null {
  const m = ex.reps.match(/(\d+)\s*[–-]\s*(\d+)/)
  if (!m) return null
  const min = Number(m[1])
  const max = Number(m[2])
  return max >= min ? { min, max } : null
}

/** Every set for one exercise on one date, oldest entry first. */
export function setsFor(sets: SetEntry[], exerciseId: string, date: string): SetEntry[] {
  return sets.filter((s) => s.exerciseId === exerciseId && s.date === date)
}

/** Dates on which an exercise was trained, newest first. */
export function datesFor(sets: SetEntry[], exerciseId: string): string[] {
  return Array.from(new Set(sets.filter((s) => s.exerciseId === exerciseId).map((s) => s.date))).sort(
    (a, b) => b.localeCompare(a),
  )
}

/**
 * The most recent session for an exercise strictly before `date` — what the
 * card shows as "last time". Excluding `date` itself matters: while you are
 * part-way through today's session, last time must still mean last week, not
 * the two sets you just typed in.
 */
export function previousSession(
  sets: SetEntry[],
  exerciseId: string,
  date: string,
): ExerciseSession | null {
  const prior = datesFor(sets, exerciseId).filter((d) => d < date)
  if (prior.length === 0) return null
  const last = prior[0]
  return { date: last, exerciseId, sets: setsFor(sets, exerciseId, last) }
}

/** Every session for an exercise, newest first — drives the history list and the chart. */
export function sessionsFor(sets: SetEntry[], exerciseId: string): ExerciseSession[] {
  return datesFor(sets, exerciseId).map((date) => ({
    date,
    exerciseId,
    sets: setsFor(sets, exerciseId, date),
  }))
}

/**
 * Load volume — kg lifted × reps, summed over a session.
 *
 * Only loaded, rep-counted sets contribute. A bodyweight set has no kg to
 * multiply, and a timed hold's "reps" are seconds, so kg × sec would add a
 * meaningless number to a kg × reps total. Both are therefore skipped rather
 * than silently folded in, which is why a plank-only session reports 0 and
 * the UI labels this "load volume" rather than "work done".
 */
export function sessionVolume(session: ExerciseSession, timed = false): number {
  if (timed) return 0
  return session.sets.reduce((a, s) => (s.weightKg > 0 ? a + s.weightKg * s.reps : a), 0)
}

/** The heaviest set of a session, ties broken by reps. Null for an empty session. */
export function topSet(session: ExerciseSession): SetEntry | null {
  return session.sets.reduce<SetEntry | null>((best, s) => {
    if (!best) return s
    if (s.weightKg !== best.weightKg) return s.weightKg > best.weightKg ? s : best
    return s.reps > best.reps ? s : best
  }, null)
}

/**
 * Epley estimated one-rep max — the standard way to compare sets at different
 * weights and reps on one axis. Deliberately not shown as a lift to attempt:
 * it is a trend line, and the formula drifts badly above ~12 reps.
 */
export function estimated1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0
  return +(weightKg * (1 + reps / 30)).toFixed(1)
}

/** Best estimated 1RM across a session's sets — the chart's y value. */
export function sessionBest1RM(session: ExerciseSession): number {
  return session.sets.reduce((best, s) => Math.max(best, estimated1RM(s.weightKg, s.reps)), 0)
}

export interface ProgressPoint {
  date: string
  /** Best estimated 1RM that session. 0 for bodyweight-only work, where the chart falls back to reps. */
  est1RM: number
  /** Heaviest weight lifted that session. */
  topWeightKg: number
  /** Best single-set reps that session — the only meaningful axis for bodyweight work. */
  topReps: number
  volume: number
}

/** Oldest-first series for the per-exercise chart. Recharts wants ascending x. */
export function progressSeries(sets: SetEntry[], exerciseId: string): ProgressPoint[] {
  return sessionsFor(sets, exerciseId)
    .slice()
    .reverse()
    .map((session) => {
      const top = topSet(session)
      return {
        date: session.date,
        est1RM: sessionBest1RM(session),
        topWeightKg: top?.weightKg ?? 0,
        topReps: session.sets.reduce((a, s) => Math.max(a, s.reps), 0),
        volume: sessionVolume(session),
      }
    })
}

export type ProgressionVerdict = 'add-weight' | 'hold' | 'none'

export interface ProgressionAdvice {
  verdict: ProgressionVerdict
  message: string
  /** The load to move up to, when the verdict is 'add-weight'. */
  nextWeightKg?: number
}

/**
 * Double progression, the rule the Training page already documents: stay at a
 * weight until every working set reaches the top of the rep range, then add
 * one dumbbell step and drop back to the bottom.
 *
 * Judged on the session you just logged, and only once you have logged at
 * least the prescribed number of sets — clearing the top of the range on two
 * of four sets is not the same achievement, and prompting there would push
 * the user up in weight before they have earned it.
 */
export function progressionAdvice(
  session: ExerciseSession | null,
  ex: Exercise,
  targetSets: number,
  step = DUMBBELL_STEP_KG,
): ProgressionAdvice {
  if (!session || session.sets.length === 0) {
    return { verdict: 'none', message: 'Log a set to start tracking progress.' }
  }
  const range = repRange(ex)
  if (!range) return { verdict: 'none', message: 'No rep range on this exercise to progress against.' }

  const unit = isTimed(ex) ? 'sec' : 'reps'
  if (session.sets.length < targetSets) {
    const left = targetSets - session.sets.length
    return { verdict: 'hold', message: `${left} more set${left === 1 ? '' : 's'} to go this session.` }
  }

  const allAtTop = session.sets.every((s) => s.reps >= range.max)
  if (!allAtTop) {
    const weakest = Math.min(...session.sets.map((s) => s.reps))
    return {
      verdict: 'hold',
      message: `Stay at this weight until every set hits ${range.max} ${unit} — your lowest was ${weakest}.`,
    }
  }

  const heaviest = Math.max(...session.sets.map((s) => s.weightKg))
  // Bodyweight work has no load to add, so double progression has nothing to
  // move: the Training page's own advice is to change the variation instead.
  if (heaviest <= 0) {
    return {
      verdict: 'add-weight',
      message: `Every set hit ${range.max} ${unit}. Add load or move to a harder variation — this one is no longer hard enough.`,
    }
  }

  const nextWeightKg = heaviest + step
  return {
    verdict: 'add-weight',
    message: `Every set hit ${range.max} ${unit} at ${heaviest} kg. Go up to ${nextWeightKg} kg next session and drop back to ${range.min}.`,
    nextWeightKg,
  }
}

/**
 * The weight to pre-fill a new set with: what you used on the set before it,
 * else what you lifted last session, else nothing — the estimated starting
 * load already shown on the card covers a first-ever session, and guessing a
 * number into the input would silently become logged history.
 */
export function suggestedWeight(
  todaysSets: SetEntry[],
  previous: ExerciseSession | null,
): number | null {
  if (todaysSets.length > 0) return todaysSets[todaysSets.length - 1].weightKg
  const top = previous ? topSet(previous) : null
  return top ? top.weightKg : null
}

/** Compact "22 kg × 12, 12, 10" summary of a session, for the last-time line. */
export function describeSession(session: ExerciseSession, timed = false): string {
  if (session.sets.length === 0) return 'nothing logged'
  const unit = timed ? 's' : ''
  const weights = Array.from(new Set(session.sets.map((s) => s.weightKg)))
  const reps = session.sets.map((s) => `${s.reps}${unit}`).join(', ')
  if (weights.length === 1) {
    return weights[0] > 0 ? `${weights[0]} kg × ${reps}` : `bodyweight × ${reps}`
  }
  return session.sets.map((s) => (s.weightKg > 0 ? `${s.weightKg}×${s.reps}${unit}` : `${s.reps}${unit}`)).join(', ')
}

/** Dates with any logged set, newest first — drives the session history list. */
export function loggedDates(sets: SetEntry[]): string[] {
  return Array.from(new Set(sets.map((s) => s.date))).sort((a, b) => b.localeCompare(a))
}

export interface DaySummary {
  date: string
  exerciseCount: number
  setCount: number
  volume: number
}

/**
 * Per-day rollup for the history list. Volume follows the same rule as
 * sessionVolume — loaded sets only — but a day mixes exercises, so timed
 * holds are excluded by their zero weight rather than by an explicit flag.
 * A plank is logged at 0 kg, so it drops out either way.
 */
export function daySummary(sets: SetEntry[], date: string): DaySummary {
  const onDate = sets.filter((s) => s.date === date)
  return {
    date,
    exerciseCount: new Set(onDate.map((s) => s.exerciseId)).size,
    setCount: onDate.length,
    volume: onDate.reduce((a, s) => (s.weightKg > 0 ? a + s.weightKg * s.reps : a), 0),
  }
}

export interface PeriodSummary {
  /** Inclusive ISO bounds of the window, oldest first. */
  from: string
  to: string
  /** Distinct days trained — the honest count of sessions, however many exercises each held. */
  sessionCount: number
  setCount: number
  /** Loaded sets only, as everywhere else in this module. */
  volume: number
}

/**
 * Rollup over the `days` ending at `to` inclusive — the week-vs-week view.
 *
 * A window rather than a calendar week: comparing "the last 7 days" against
 * "the 7 before" is meaningful on any day you open the app, whereas a
 * Monday-anchored week spends most of its life half-finished and always
 * looks like a decline.
 */
export function periodSummary(sets: SetEntry[], to: string, days = 7): PeriodSummary {
  const from = shiftISO(to, -(days - 1))
  const within = sets.filter((s) => s.date >= from && s.date <= to)
  return {
    from,
    to,
    sessionCount: new Set(within.map((s) => s.date)).size,
    setCount: within.length,
    volume: within.reduce((a, s) => (s.weightKg > 0 ? a + s.weightKg * s.reps : a), 0),
  }
}

export interface PeriodComparison {
  current: PeriodSummary
  previous: PeriodSummary
  /**
   * Percent change in volume, or null when the previous window had none —
   * dividing by zero would render "∞%" on the first week of training, and
   * "no comparison yet" is the truthful thing to show there.
   */
  volumeChangePct: number | null
}

/** The last `days` against the `days` before them, for the weekly summary card. */
export function comparePeriods(sets: SetEntry[], to: string, days = 7): PeriodComparison {
  const current = periodSummary(sets, to, days)
  const previous = periodSummary(sets, shiftISO(to, -days), days)
  return {
    current,
    previous,
    volumeChangePct:
      previous.volume > 0
        ? Math.round(((current.volume - previous.volume) / previous.volume) * 100)
        : null,
  }
}

/**
 * Daily volume across every exercise for the `days` ending at `to`, oldest
 * first and including untrained days as zeros — a gap in the x-axis would
 * make a rest day look like missing data rather than a rest day.
 */
export function volumeSeries(sets: SetEntry[], to: string, days = 28): DaySummary[] {
  return Array.from({ length: days }, (_, i) => daySummary(sets, shiftISO(to, -(days - 1 - i))))
}
