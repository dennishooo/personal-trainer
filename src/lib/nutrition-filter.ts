/**
 * Filtering and sorting for the ingredient reference table.
 *
 * Kept separate from the page so the predicates stay unit-testable: the
 * component only decides which keys are active, never what they mean.
 */
import type { Leanness, NutritionGroup, NutritionItem } from '@/data/nutrition-reference'

export type SortKey = 'name' | 'protein' | 'kcal' | 'carb' | 'fat' | 'density'
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

/** Grams of protein bought per 100 kcal — the "is this worth the calories" number. */
export function proteinPerKcal(it: NutritionItem): number {
  return it.kcal === 0 ? 0 : it.proteinG / it.kcal
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
