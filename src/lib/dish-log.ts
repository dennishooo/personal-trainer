/**
 * Eating-out log: what was eaten on a given date, and how that stacks up
 * against the day's macro targets.
 *
 * Pure arithmetic only — the store owns persistence and the page owns layout,
 * so all of this stays unit-testable without React or localStorage.
 */
import type { Dish, DishVerdict } from '@/data/dishes'
import type { MacroTargets } from '@/lib/nutrition'
import type { MacroTotals } from '@/lib/macro-calc'

/**
 * One logged dish. Stored by id and date, never by a copy of the macros, so
 * correcting a figure in the dataset retroactively fixes every past entry.
 */
export interface LogEntry {
  /** Unique per entry — the same dish can legitimately be logged twice. */
  entryId: string
  /** ISO yyyy-mm-dd. */
  date: string
  dishId: string
  /**
   * Multiplier on the dish's standard portion: 0.5 for sharing a plate,
   * 2 for ordering two. Kept as a number rather than grams because you can't
   * weigh a restaurant plate — halves and doubles are what you actually know.
   */
  portions: number
}

/** A log entry joined back to its dish row. */
export interface ResolvedEntry extends LogEntry {
  dish: Dish
}

export const LOG_PORTION_STEPS = [0.5, 1, 1.5, 2] as const

export function todayISO(now = new Date()): string {
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
}

/**
 * Joins stored entries to the live dish dataset for one date, dropping entries
 * whose dish has since been removed rather than crashing on stale storage.
 */
export function entriesForDate(entries: LogEntry[], dishes: Dish[], date: string): ResolvedEntry[] {
  const byId = new Map(dishes.map((d) => [d.id, d]))
  return entries.flatMap((e) => {
    if (e.date !== date) return []
    const dish = byId.get(e.dishId)
    return dish ? [{ ...e, dish }] : []
  })
}

/** Macros a single entry contributes, at its portion multiplier. */
export function scaleEntry({ dish, portions }: ResolvedEntry): MacroTotals & { sodiumMg: number } {
  return {
    kcal: Math.round(dish.kcal * portions),
    proteinG: +(dish.proteinG * portions).toFixed(1),
    carbG: +(dish.carbG * portions).toFixed(1),
    fatG: +(dish.fatG * portions).toFixed(1),
    sodiumMg: Math.round(dish.sodiumMg * portions),
  }
}

export interface DayTotals extends MacroTotals {
  sodiumMg: number
  costHKD: number
}

export function totalsForDay(entries: ResolvedEntry[]): DayTotals {
  return entries.reduce<DayTotals>(
    (sum, e) => {
      const t = scaleEntry(e)
      return {
        kcal: sum.kcal + t.kcal,
        proteinG: +(sum.proteinG + t.proteinG).toFixed(1),
        carbG: +(sum.carbG + t.carbG).toFixed(1),
        fatG: +(sum.fatG + t.fatG).toFixed(1),
        sodiumMg: sum.sodiumMg + t.sodiumMg,
        costHKD: +(sum.costHKD + (e.dish.priceHKD ?? 0) * e.portions).toFixed(1),
      }
    },
    { kcal: 0, proteinG: 0, carbG: 0, fatG: 0, sodiumMg: 0, costHKD: 0 },
  )
}

/** What's left of the day's targets. Negative means already over. */
export function remainingFrom(totals: DayTotals, targets: MacroTargets): MacroTotals {
  return {
    kcal: targets.calories - totals.kcal,
    proteinG: +(targets.proteinG - totals.proteinG).toFixed(1),
    carbG: +(targets.carbG - totals.carbG).toFixed(1),
    fatG: +(targets.fatG - totals.fatG).toFixed(1),
  }
}

/** WHO's daily sodium ceiling, the yardstick for the day's salt load. */
export const SODIUM_LIMIT_MG = 2000

/**
 * Protein per 100 kcal — the single most useful way to rank restaurant dishes,
 * because it says how much of a calorie budget a dish spends per gram of
 * protein bought. Above ~7 g is excellent, below ~3 g is mostly filler.
 */
export function proteinDensity(dish: Dish): number {
  if (dish.kcal === 0) return 0
  return +((dish.proteinG / dish.kcal) * 100).toFixed(1)
}

export const VERDICT_LABELS: Record<DishVerdict, string> = {
  green: 'Order freely',
  amber: 'Order with a tweak',
  red: 'Occasional',
}

/**
 * Ranks dishes against what's left of the day: the best next order is the one
 * with the most protein that still fits inside the remaining calories. Dishes
 * that overshoot aren't hidden, just sorted last — sometimes you're eating out
 * regardless and want the least-bad option on the menu.
 */
export function suggestDishes(dishes: Dish[], remainingKcal: number, limit = 3): Dish[] {
  return [...dishes]
    .sort((a, b) => {
      const aFits = a.kcal <= remainingKcal
      const bFits = b.kcal <= remainingKcal
      if (aFits !== bFits) return aFits ? -1 : 1
      return proteinDensity(b) - proteinDensity(a) || a.kcal - b.kcal
    })
    .slice(0, limit)
}

/** Dates that have at least one entry, newest first — drives the history list. */
export function loggedDates(entries: LogEntry[]): string[] {
  return Array.from(new Set(entries.map((e) => e.date))).sort((a, b) => b.localeCompare(a))
}

export interface DishFilters {
  query: string
  cuisine: string
  verdict: DishVerdict | 'all'
}

/** Free-text across name, Chinese name and tags, plus the two dropdowns. */
export function filterDishes(dishes: Dish[], { query, cuisine, verdict }: DishFilters): Dish[] {
  const q = query.trim().toLowerCase()
  return dishes.filter(
    (d) =>
      (cuisine === 'all' || d.cuisine === cuisine) &&
      (verdict === 'all' || d.verdict === verdict) &&
      (!q ||
        d.name.toLowerCase().includes(q) ||
        d.chinese?.includes(query.trim()) ||
        d.tags.some((t) => t.includes(q))),
  )
}
