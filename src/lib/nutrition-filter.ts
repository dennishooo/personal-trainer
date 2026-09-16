/**
 * Filtering and sorting for the ingredient reference table.
 *
 * Kept separate from the page so the predicates stay unit-testable: the
 * component only decides which keys are active, never what they mean.
 */
import { REFERENCE_KG } from '@/data/meals'
import type { Leanness, NutritionGroup, NutritionItem } from '@/data/nutrition-reference'

export type SortKey = 'name' | 'protein' | 'kcal' | 'carb' | 'fat' | 'density' | 'cost'
export type MacroKey = 'high-protein' | 'low-cal' | 'low-carb' | 'low-fat' | 'efficient' | 'in-plan'

/** Fat thresholds that define the leanness bands, in grams per 100 g. */
export const LEAN_MAX_FAT = 8
export const MEDIUM_MAX_FAT = 17

export const MACRO_LABELS: Record<MacroKey, string> = {
  'high-protein': 'Protein ≥ 15 g',
  'low-cal': 'Under 100 kcal',
  'low-carb': 'Carbs ≤ 5 g',
  'low-fat': 'Fat ≤ 3 g',
  efficient: '1 g protein / ≤ 5 kcal',
  'in-plan': 'In my meal plan',
}

export const LEANNESS_LABELS: Record<Leanness, string> = {
  lean: `Lean — under ${LEAN_MAX_FAT} g fat / 100 g`,
  medium: `Medium — ${LEAN_MAX_FAT}–${MEDIUM_MAX_FAT} g fat / 100 g`,
  fatty: `Fatty — over ${MEDIUM_MAX_FAT} g fat / 100 g`,
}

const MACRO_TESTS: Record<MacroKey, (it: NutritionItem) => boolean> = {
  'high-protein': (it) => it.proteinG >= 15,
  'low-cal': (it) => it.kcal < 100,
  'low-carb': (it) => it.carbG <= 5,
  'low-fat': (it) => it.fatG <= 3,
  // Guard zero-protein items (oils, sugars) so they never divide by zero.
  efficient: (it) => it.proteinG > 0 && it.kcal / it.proteinG <= 5,
  'in-plan': (it) => it.inPlan === true,
}

/**
 * Portion text for an item at a given bodyweight.
 *
 * Bulk foods (`portionG`) scale linearly from the REFERENCE_KG serving, so a
 * heavier user sees a bigger plate. Seasonings and countable units keep their
 * fixed text — scaling a clove of garlic or a tablespoon of oil with bodyweight
 * would be arithmetic without meaning.
 *
 * Rounded to 5 g because nobody weighs chicken to the gram, and unrounded
 * output would imply a precision the underlying reference data doesn't have.
 */
export function scalePortion(it: NutritionItem, weightKg: number): string {
  if (it.portionG === undefined) return it.portion ?? ''
  const grams = Math.max(5, Math.round((it.portionG * weightKg) / REFERENCE_KG / 5) * 5)
  return it.portionNote ? `${grams} g ${it.portionNote}` : `${grams} g`
}

/** True when this item's portion responds to bodyweight. */
export function portionScales(it: NutritionItem): boolean {
  return it.portionG !== undefined
}

/**
 * Macros for the actual serving, not per 100 g — what you'd log after eating it.
 * Only meaningful for gram-based portions, so returns null for fixed servings.
 */
export function portionMacros(
  it: NutritionItem,
  weightKg: number,
): { kcal: number; proteinG: number; carbG: number; fatG: number } | null {
  if (it.portionG === undefined) return null
  const grams = (it.portionG * weightKg) / REFERENCE_KG
  const f = grams / 100
  return {
    kcal: Math.round(it.kcal * f),
    proteinG: Math.round(it.proteinG * f),
    carbG: Math.round(it.carbG * f),
    fatG: Math.round(it.fatG * f),
  }
}

/** Grams of protein bought per 100 kcal — the "is this worth the calories" number. */
export function proteinPerKcal(it: NutritionItem): number {
  return it.kcal === 0 ? 0 : it.proteinG / it.kcal
}

/** Protein serving the cost column prices: roughly one meal's protein target. */
export const PROTEIN_SERVING_G = 30

/**
 * HKD spent to buy PROTEIN_SERVING_G of protein — the "is this worth the money"
 * number. Null for unpriced items and for anything with too little protein for
 * the ratio to mean much (a sauce technically "has protein" but nobody buys
 * doubanjiang to hit a macro target).
 */
export function costPerProteinServing(it: NutritionItem): number | null {
  if (it.pricePer100gHKD === undefined || it.proteinG < 3) return null
  return (it.pricePer100gHKD / it.proteinG) * PROTEIN_SERVING_G
}

export function sortItems(items: NutritionItem[], key: SortKey): NutritionItem[] {
  const c = [...items]
  switch (key) {
    case 'name':
      return c.sort((a, b) => a.name.localeCompare(b.name))
    case 'protein':
      return c.sort((a, b) => b.proteinG - a.proteinG)
    case 'kcal':
      return c.sort((a, b) => b.kcal - a.kcal)
    case 'carb':
      return c.sort((a, b) => b.carbG - a.carbG)
    case 'fat':
      return c.sort((a, b) => b.fatG - a.fatG)
    case 'density':
      return c.sort((a, b) => proteinPerKcal(b) - proteinPerKcal(a))
    case 'cost':
      // Cheapest protein first; unpriced items sink to the bottom.
      return c.sort(
        (a, b) =>
          (costPerProteinServing(a) ?? Infinity) - (costPerProteinServing(b) ?? Infinity),
      )
  }
}

export interface FilterState {
  query: string
  categories: ReadonlySet<string>
  macros: ReadonlySet<MacroKey>
  leanness: ReadonlySet<Leanness>
  sort: SortKey
}

export const EMPTY_FILTERS: FilterState = {
  query: '',
  categories: new Set(),
  macros: new Set(),
  leanness: new Set(),
  sort: 'name',
}

/** FilterState with arrays instead of Sets, so it survives JSON persistence. */
export interface StoredFilters {
  query: string
  categories: string[]
  macros: MacroKey[]
  leanness: Leanness[]
  sort: SortKey
}

export const EMPTY_STORED_FILTERS: StoredFilters = {
  query: '',
  categories: [],
  macros: [],
  leanness: [],
  sort: 'name',
}

export function toFilterState(f: StoredFilters): FilterState {
  return {
    query: f.query,
    categories: new Set(f.categories),
    macros: new Set(f.macros),
    leanness: new Set(f.leanness),
    sort: f.sort,
  }
}

function matchesQuery(it: NutritionItem, groupName: string, q: string): boolean {
  if (!q) return true
  const needle = q.trim().toLowerCase()
  if (!needle) return true
  return (
    it.name.toLowerCase().includes(needle) ||
    (it.chinese ?? '').includes(needle) ||
    (it.cut ?? '').toLowerCase().includes(needle) ||
    groupName.toLowerCase().includes(needle)
  )
}

/**
 * Applies every active filter and returns only groups that still have rows.
 *
 * Macro chips stack as AND (each narrows further), while leanness chips are OR
 * within themselves — "lean or medium" is the question people actually ask.
 */
export function applyFilters(groups: NutritionGroup[], f: FilterState): NutritionGroup[] {
  return groups
    .filter((g) => f.categories.size === 0 || f.categories.has(g.name))
    .map((g) => ({
      ...g,
      items: sortItems(
        g.items.filter(
          (it) =>
            matchesQuery(it, g.name, f.query) &&
            [...f.macros].every((k) => MACRO_TESTS[k](it)) &&
            (f.leanness.size === 0 || (it.leanness !== undefined && f.leanness.has(it.leanness))),
        ),
        f.sort,
      ),
    }))
    .filter((g) => g.items.length > 0)
}

export function countItems(groups: NutritionGroup[]): number {
  return groups.reduce((sum, g) => sum + g.items.length, 0)
}

export function activeFilterCount(f: FilterState): number {
  return f.categories.size + f.macros.size + f.leanness.size
}
