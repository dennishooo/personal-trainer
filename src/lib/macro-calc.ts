/**
 * Meal calculator: totals up what a set of picked ingredients actually delivers
 * and compares it against the day's macro targets.
 *
 * Kept separate from the page so the arithmetic stays unit-testable; the
 * component only owns which items are picked and at what weight.
 */
import type { NutritionGroup, NutritionItem } from '@/data/nutrition-reference'
import type { MacroTargets } from '@/lib/nutrition'

export interface Pick {
  item: NutritionItem
  /** Edible raw weight, grams — same basis as the per-100 g reference values. */
  grams: number
}

/** What localStorage keeps: names only, so macros always come from the live dataset. */
export interface StoredPick {
  name: string
  grams: number
}

/** Adds 100 g of an ingredient, bumping the weight if it's already picked. */
export function addStoredPick(picks: StoredPick[], name: string): StoredPick[] {
  const i = picks.findIndex((p) => p.name === name)
  if (i === -1) return [...picks, { name, grams: 100 }]
  return picks.map((p, j) => (j === i ? { ...p, grams: p.grams + 100 } : p))
}

/** Immutable reorder; out-of-range or same-place moves return the array as is. */
export function moveItem<T>(arr: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return arr
  const next = [...arr]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

/**
 * Rehydrates stored picks against the current dataset. Items that were renamed
 * or removed since the pick was saved are silently dropped rather than crashing
 * the calculator on stale localStorage.
 */
export function resolvePicks(stored: StoredPick[], groups: NutritionGroup[]): Pick[] {
  const byName = new Map(groups.flatMap((g) => g.items).map((it) => [it.name, it]))
  return stored.flatMap(({ name, grams }) => {
    const item = byName.get(name)
    return item ? [{ item, grams }] : []
  })
}

export interface MacroTotals {
  kcal: number
  proteinG: number
  carbG: number
  fatG: number
}

/** Macros contributed by one pick, scaled from the per-100 g reference row. */
export function scalePick({ item, grams }: Pick): MacroTotals {
  const f = grams / 100
  return {
    kcal: Math.round(item.kcal * f),
    proteinG: +(item.proteinG * f).toFixed(1),
    carbG: +(item.carbG * f).toFixed(1),
    fatG: +(item.fatG * f).toFixed(1),
  }
}

export function totalsFor(picks: Pick[]): MacroTotals {
  return picks.map(scalePick).reduce(
    (sum, t) => ({
      kcal: sum.kcal + t.kcal,
      proteinG: +(sum.proteinG + t.proteinG).toFixed(1),
      carbG: +(sum.carbG + t.carbG).toFixed(1),
      fatG: +(sum.fatG + t.fatG).toFixed(1),
    }),
    { kcal: 0, proteinG: 0, carbG: 0, fatG: 0 },
  )
}

/** Eaten minus target: positive means over the day's target, negative under. */
export function deltasFrom(totals: MacroTotals, targets: MacroTargets): MacroTotals {
  return {
    kcal: totals.kcal - targets.calories,
    proteinG: +(totals.proteinG - targets.proteinG).toFixed(1),
    carbG: +(totals.carbG - targets.carbG).toFixed(1),
    fatG: +(totals.fatG - targets.fatG).toFixed(1),
  }
}
