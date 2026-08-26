/**
 * Plan-adjustment engine.
 *
 * Scale weight is noisy — glycogen, sodium and gut contents swing it by a kilo
 * or more day to day. So every decision here is made on a smoothed trend, never
 * on the latest reading, and only after enough days have passed to see a signal.
 */
import type { Goal, Profile } from './nutrition'
import { GOAL_ADJUSTMENT, weeklyRateTarget } from './nutrition'

export interface WeightEntry {
  date: string // ISO yyyy-mm-dd
  weightKg: number
}

/** Exponentially-weighted moving average — the standard fix for scale noise. */
export function ewma(entries: WeightEntry[], alpha = 0.25): { date: string; value: number }[] {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  let acc: number | null = null
  return sorted.map((e) => {
    acc = acc === null ? e.weightKg : alpha * e.weightKg + (1 - alpha) * acc
    return { date: e.date, value: +acc.toFixed(2) }
  })
}

const DAY = 86_400_000

/**
 * Least-squares slope of the smoothed trend over a window, converted to kg/week.
 * Regression rather than first-vs-last so a single odd reading at either end
 * can't dominate the result.
 */
export function trendKgPerWeek(entries: WeightEntry[], windowDays = 21): number | null {
  const smoothed = ewma(entries)
  if (smoothed.length < 2) return null

  const last = new Date(smoothed[smoothed.length - 1].date).getTime()
  const pts = smoothed
    .map((s) => ({ t: (new Date(s.date).getTime() - last) / DAY, v: s.value }))
    .filter((p) => p.t >= -windowDays)

  if (pts.length < 2) return null
  const n = pts.length
  const sumT = pts.reduce((a, p) => a + p.t, 0)
  const sumV = pts.reduce((a, p) => a + p.v, 0)
  const sumTT = pts.reduce((a, p) => a + p.t * p.t, 0)
  const sumTV = pts.reduce((a, p) => a + p.t * p.v, 0)
  const denom = n * sumTT - sumT * sumT
  if (Math.abs(denom) < 1e-9) return null

  return +(((n * sumTV - sumT * sumV) / denom) * 7).toFixed(3)
}

export function spanDays(entries: WeightEntry[]) {
  if (entries.length < 2) return 0
  const ts = entries.map((e) => new Date(e.date).getTime()).sort((a, b) => a - b)
  return Math.round((ts[ts.length - 1] - ts[0]) / DAY)
}

export type VerdictKind = 'on-track' | 'too-fast' | 'too-slow' | 'wrong-way' | 'insufficient-data'

export interface Adjustment {
  kind: VerdictKind
  headline: string
  detail: string
  calorieDelta: number
  trendKgPerWeek: number | null
  targetKgPerWeek: number
}

/**
 * Compare the actual trend against the goal's target rate and suggest a calorie
 * nudge. Deltas are capped at ±250 kcal so the plan drifts rather than lurches.
 */
export function evaluatePlan(profile: Profile, entries: WeightEntry[]): Adjustment {
  const target = weeklyRateTarget(profile) * (GOAL_ADJUSTMENT[profile.goal].pct < 0 ? -1 : 1)
  const days = spanDays(entries)
  const trend = trendKgPerWeek(entries)

  if (trend === null || entries.length < 4 || days < 14) {
    return {
      kind: 'insufficient-data',
      headline: 'Keep logging',
      detail: `Need about 2 weeks and 4+ weigh-ins before the trend means anything. You have ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} over ${days} day${days === 1 ? '' : 's'}.`,
      calorieDelta: 0,
      trendKgPerWeek: trend,
      targetKgPerWeek: target,
    }
  }

  if (profile.goal === 'maintain') {
    const drifting = Math.abs(trend) > 0.25
    return {
      kind: drifting ? (trend > 0 ? 'too-fast' : 'wrong-way') : 'on-track',
      headline: drifting ? 'Drifting off maintenance' : 'Holding steady',
      detail: drifting
        ? `Trending ${trend > 0 ? 'up' : 'down'} ${Math.abs(trend).toFixed(2)} kg/week. Nudge calories ${trend > 0 ? 'down' : 'up'}.`
        : `Trend is ${trend >= 0 ? '+' : ''}${trend.toFixed(2)} kg/week — that is flat.`,
      calorieDelta: drifting ? (trend > 0 ? -150 : 150) : 0,
      trendKgPerWeek: trend,
      targetKgPerWeek: target,
    }
  }

  const losing = target < 0
  const ratio = target === 0 ? 1 : trend / target

  // ~7,700 kcal per kg of body mass; convert the shortfall to a daily nudge.
  const rawDelta = ((target - trend) * 7700) / 7
  const delta = Math.max(-250, Math.min(250, Math.round(rawDelta / 25) * 25))

  // Moving the wrong way entirely.
  if ((losing && trend > 0.1) || (!losing && trend < -0.1)) {
    return {
      kind: 'wrong-way',
      headline: losing ? 'Gaining, not losing' : 'Losing, not gaining',
      detail: `Trend is ${trend >= 0 ? '+' : ''}${trend.toFixed(2)} kg/week against a target of ${target.toFixed(2)}. Tighten portion accuracy and bubble tea before changing the number — most of the gap is usually unlogged liquid calories.`,
      calorieDelta: delta,
      trendKgPerWeek: trend,
      targetKgPerWeek: target,
    }
  }

  if (ratio > 1.5) {
    return {
      kind: 'too-fast',
      headline: losing ? 'Losing too fast' : 'Gaining too fast',
      detail: losing
        ? `${Math.abs(trend).toFixed(2)} kg/week is past the ${Math.abs(target).toFixed(2)} target. Faster is not better — beyond roughly 0.7% of bodyweight per week you start shedding muscle alongside fat.`
        : `${trend.toFixed(2)} kg/week is mostly fat at this point. Pull calories back.`,
      calorieDelta: delta,
      trendKgPerWeek: trend,
      targetKgPerWeek: target,
    }
  }

  if (ratio < 0.4) {
    return {
      kind: 'too-slow',
      headline: 'Progress has stalled',
      detail: `Trend is ${trend >= 0 ? '+' : ''}${trend.toFixed(2)} kg/week against ${target.toFixed(2)}. A ${Math.abs(delta)} kcal ${delta < 0 ? 'reduction' : 'increase'} should restart it.`,
      calorieDelta: delta,
      trendKgPerWeek: trend,
      targetKgPerWeek: target,
    }
  }

  return {
    kind: 'on-track',
    headline: 'On track',
    detail: `Trending ${trend >= 0 ? '+' : ''}${trend.toFixed(2)} kg/week against a ${target.toFixed(2)} target. Change nothing.`,
    calorieDelta: 0,
    trendKgPerWeek: trend,
    targetKgPerWeek: target,
  }
}

/**
 * Goals are not forever. Once bodyweight reaches the healthy band, sitting in a
 * deficit stops being useful — this flags the handover point.
 */
export function suggestGoalChange(profile: Profile, bmiValue: number): { goal: Goal; reason: string } | null {
  if (profile.goal === 'cut' && bmiValue < 21) {
    return { goal: 'recomp', reason: 'You are inside the healthy BMI band. A hard deficit now costs muscle — switch to recomposition.' }
  }
  if (profile.goal === 'recomp' && bmiValue < 19.5) {
    return { goal: 'lean-bulk', reason: 'You are at the lean end of healthy. A small surplus will build muscle faster than a deficit can.' }
  }
  if (profile.goal === 'lean-bulk' && bmiValue > 24.5) {
    return { goal: 'recomp', reason: 'The bulk has run its course — fat is outpacing muscle. Drop back to recomposition.' }
  }
  if (profile.goal === 'maintain' && bmiValue >= 25) {
    return { goal: 'recomp', reason: 'BMI has climbed into the obese band for Asian cut-offs. Time for a small deficit.' }
  }
  return null
}
