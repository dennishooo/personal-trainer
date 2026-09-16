/**
 * User-created dishes: validation, defaulting and merging with the shipped set.
 *
 * The 71 rows in src/data/dishes.ts are a curated reference and stay read-only;
 * anything the user adds lives in its own store and is merged on read. Pure
 * functions only, so the rules are testable without React or localStorage.
 */
import { DISHES, type Dish, type DishCuisine, type DishVerdict } from '@/data/dishes'
import type { IconName } from '@/components/icons'
import { SODIUM_LIMIT_MG } from '@/lib/dish-log'

/** Prefix that marks an id as user-created, so the merge never has to guess. */
export const CUSTOM_ID_PREFIX = 'custom-'

export function isCustomDish(dish: Dish): boolean {
  return dish.id.startsWith(CUSTOM_ID_PREFIX)
}

/**
 * What the add/edit form collects. Numbers are strings because that's what an
 * <input> gives you, and an empty field has to stay distinguishable from a
 * typed zero until the moment it's parsed.
 */
export interface DishDraft {
  name: string
  chinese: string
  cuisine: DishCuisine
  servingNote: string
  kcal: string
  proteinG: string
  carbG: string
  fatG: string
  sodiumMg: string
  priceHKD: string
  icon: IconName
  tags: string
  swap: string
  /** 'auto' derives the verdict from the macros; anything else pins it. */
  verdict: DishVerdict | 'auto'
}

export const EMPTY_DRAFT: DishDraft = {
  name: '',
  chinese: '',
  cuisine: 'cha-chaan-teng',
  servingNote: '',
  kcal: '',
  proteinG: '',
  carbG: '',
  fatG: '',
  sodiumMg: '',
  priceHKD: '',
  icon: 'bowl-spoon',
  tags: '',
  swap: '',
  verdict: 'auto',
}

/** Loads an existing dish back into the form, for editing or duplicating. */
export function draftFromDish(dish: Dish): DishDraft {
  return {
    name: dish.name,
    chinese: dish.chinese ?? '',
    cuisine: dish.cuisine,
    servingNote: dish.servingNote,
    kcal: String(dish.kcal),
    proteinG: String(dish.proteinG),
    carbG: String(dish.carbG),
    fatG: String(dish.fatG),
    sodiumMg: String(dish.sodiumMg),
    priceHKD: dish.priceHKD === undefined ? '' : String(dish.priceHKD),
    icon: dish.icon,
    tags: dish.tags.join(', '),
    swap: dish.swap ?? '',
    verdict: dish.verdict,
  }
}

/**
 * Derives a verdict from the numbers, for users who don't want to judge their
 * own dish. Thresholds mirror how the shipped rows were graded: protein per
 * 100 kcal is the primary axis, and a dish that blows the whole day's sodium
 * can't be green however lean it is.
 */
export function deriveVerdict(kcal: number, proteinG: number, sodiumMg: number): DishVerdict {
  const density = kcal > 0 ? (proteinG / kcal) * 100 : 0
  if (sodiumMg >= SODIUM_LIMIT_MG) return density >= 5 ? 'amber' : 'red'
  if (density >= 6 && kcal <= 700) return 'green'
  if (density >= 3) return 'amber'
  return 'red'
}

export type DraftErrors = Partial<Record<keyof DishDraft, string>>

/** Parses a numeric field; blank is only allowed where the caller says so. */
function parseNumber(raw: string): number | null {
  const trimmed = raw.trim()
  if (trimmed === '') return null
  const n = Number(trimmed)
  return Number.isFinite(n) && n >= 0 ? n : null
}

/**
 * Field-level validation. Calories are checked against the macros rather than
 * trusted: a typo there quietly corrupts every day the dish is logged to, and
 * it's the one error the user can't see on the card.
 */
export function validateDraft(draft: DishDraft): DraftErrors {
  const errors: DraftErrors = {}

  if (!draft.name.trim()) errors.name = 'Give the dish a name'

  const required = ['kcal', 'proteinG', 'carbG', 'fatG'] as const
  for (const field of required) {
    if (parseNumber(draft[field]) === null) errors[field] = 'Enter a number, 0 or more'
  }

  for (const field of ['sodiumMg', 'priceHKD'] as const) {
    if (draft[field].trim() !== '' && parseNumber(draft[field]) === null) {
      errors[field] = 'Enter a number, 0 or more'
    }
  }

  const kcal = parseNumber(draft.kcal)
  const p = parseNumber(draft.proteinG)
  const c = parseNumber(draft.carbG)
  const f = parseNumber(draft.fatG)
  if (kcal !== null && p !== null && c !== null && f !== null) {
    if (kcal === 0 && p + c + f > 0) {
      errors.kcal = 'Calories cannot be zero when the macros are not'
    } else if (kcal > 0) {
      const fromMacros = p * 4 + c * 4 + f * 9
      // Same ±20% band the shipped dataset is held to in its test.
      if (Math.abs(fromMacros - kcal) / kcal > 0.2) {
        errors.kcal = `Macros work out to about ${Math.round(fromMacros)} kcal — check the numbers`
      }
    }
  }

  return errors
}

/** Splits the comma-separated tag field, lowercased and de-duplicated. */
export function parseTags(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    ),
  )
}

/**
 * Turns a validated draft into a Dish. Callers must validate first — this
 * assumes the numbers parse, and coerces anything odd to 0 rather than NaN.
 */
export function dishFromDraft(draft: DishDraft, id: string): Dish {
  const num = (raw: string) => parseNumber(raw) ?? 0
  const kcal = num(draft.kcal)
  const proteinG = num(draft.proteinG)
  const sodiumMg = num(draft.sodiumMg)
  const price = parseNumber(draft.priceHKD)

  return {
    id,
    name: draft.name.trim(),
    ...(draft.chinese.trim() ? { chinese: draft.chinese.trim() } : {}),
    icon: draft.icon,
    cuisine: draft.cuisine,
    servingNote: draft.servingNote.trim() || 'One portion',
    kcal,
    proteinG,
    carbG: num(draft.carbG),
    fatG: num(draft.fatG),
    sodiumMg,
    ...(price === null ? {} : { priceHKD: price }),
    verdict: draft.verdict === 'auto' ? deriveVerdict(kcal, proteinG, sodiumMg) : draft.verdict,
    tags: parseTags(draft.tags),
    ...(draft.swap.trim() ? { swap: draft.swap.trim() } : {}),
  }
}

/**
 * The full dish list the app reads from. Custom dishes come first so a newly
 * added one is visible without scrolling past 71 built-ins.
 */
export function allDishes(custom: Dish[], builtIn: Dish[] = DISHES): Dish[] {
  return [...custom, ...builtIn]
}

/**
 * Dates a dish has been logged to — what a delete would silently blank out of
 * the history. The page asks for confirmation using this, rather than deleting
 * and leaving past days quietly lighter than they were.
 */
export function datesUsingDish(entries: { date: string; dishId: string }[], dishId: string): string[] {
  return Array.from(new Set(entries.filter((e) => e.dishId === dishId).map((e) => e.date))).sort(
    (a, b) => b.localeCompare(a),
  )
}
