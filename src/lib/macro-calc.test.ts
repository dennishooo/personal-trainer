import { describe, expect, it } from 'vitest'
import { NUTRITION_GROUPS, type NutritionItem } from '@/data/nutrition-reference'
import type { MacroTargets } from '@/lib/nutrition'
import { addStoredPick, deltasFrom, moveItem, resolvePicks, scalePick, totalsFor, upsertSavedMeal } from './macro-calc'

const breast: NutritionItem = { name: 'Chicken breast', icon: 'meat', kcal: 120, proteinG: 22.5, carbG: 0, fatG: 2.6, portion: '170 g' }
const rice: NutritionItem = { name: 'White rice, cooked', icon: 'bowl-chopsticks', kcal: 130, proteinG: 2.7, carbG: 28.2, fatG: 0.3, portion: '180 g' }

const targets: MacroTargets = {
  calories: 2000, proteinG: 160, fatG: 65, carbG: 194,
  proteinKcal: 640, fatKcal: 585, carbKcal: 776, fibreG: 28, waterMl: 2800,
}

describe('scalePick', () => {
  it('scales the per-100g reference values by weight', () => {
    expect(scalePick({ item: breast, grams: 170 })).toEqual({ kcal: 204, proteinG: 38.3, carbG: 0, fatG: 4.4 })
  })

  it('handles zero grams', () => {
    expect(scalePick({ item: breast, grams: 0 })).toEqual({ kcal: 0, proteinG: 0, carbG: 0, fatG: 0 })
  })
})

describe('totalsFor', () => {
  it('sums picks without floating-point drift', () => {
    const totals = totalsFor([
      { item: breast, grams: 170 },
      { item: rice, grams: 180 },
    ])
    expect(totals).toEqual({ kcal: 438, proteinG: 43.2, carbG: 50.8, fatG: 4.9 })
  })

  it('returns zeros for an empty meal', () => {
    expect(totalsFor([])).toEqual({ kcal: 0, proteinG: 0, carbG: 0, fatG: 0 })
  })
})

describe('deltasFrom', () => {
  it('reports eaten minus target, signed', () => {
    const deltas = deltasFrom({ kcal: 2100, proteinG: 150.5, carbG: 194, fatG: 70 }, targets)
    expect(deltas).toEqual({ kcal: 100, proteinG: -9.5, carbG: 0, fatG: 5 })
  })
})

describe('addStoredPick', () => {
  it('adds a new ingredient at 100 g', () => {
    expect(addStoredPick([], 'Firm tofu')).toEqual([{ name: 'Firm tofu', grams: 100 }])
  })

  it('bumps the weight of an existing pick instead of duplicating it', () => {
    const once = addStoredPick([], 'Firm tofu')
    expect(addStoredPick(once, 'Firm tofu')).toEqual([{ name: 'Firm tofu', grams: 200 }])
  })
})

describe('upsertSavedMeal', () => {
  const picks = [{ name: 'Firm tofu', grams: 200 }]
  const newId = () => 'id-1'

  it('saves the current picks under a new name with a fresh snapshot', () => {
    const meals = upsertSavedMeal([], ' Lunch prep ', picks, newId)
    expect(meals).toEqual([{ id: 'id-1', name: 'Lunch prep', picks }])
    expect(meals[0].picks).not.toBe(picks)
  })

  it('overwrites a meal saved under the same name, keeping its id', () => {
    const first = upsertSavedMeal([], 'Lunch', picks, () => 'id-1')
    const updated = upsertSavedMeal(first, 'Lunch', [{ name: 'Banana', grams: 118 }], () => 'id-2')
    expect(updated).toEqual([{ id: 'id-1', name: 'Lunch', picks: [{ name: 'Banana', grams: 118 }] }])
  })

  it('refuses empty names and empty selections', () => {
    expect(upsertSavedMeal([], '   ', picks, newId)).toEqual([])
    expect(upsertSavedMeal([], 'Lunch', [], newId)).toEqual([])
  })
})

describe('moveItem', () => {
  it('moves an element to a new position immutably', () => {
    const arr = ['a', 'b', 'c']
    expect(moveItem(arr, 0, 2)).toEqual(['b', 'c', 'a'])
    expect(moveItem(arr, 2, 0)).toEqual(['c', 'a', 'b'])
    expect(arr).toEqual(['a', 'b', 'c'])
  })

  it('returns the array unchanged for same-place or out-of-range moves', () => {
    const arr = ['a', 'b']
    expect(moveItem(arr, 1, 1)).toBe(arr)
    expect(moveItem(arr, -1, 0)).toBe(arr)
    expect(moveItem(arr, 0, 5)).toBe(arr)
  })
})

describe('resolvePicks', () => {
  it('resolves stored names against the live dataset', () => {
    const picks = resolvePicks([{ name: 'Firm tofu', grams: 200 }], NUTRITION_GROUPS)
    expect(picks).toHaveLength(1)
    expect(picks[0].item.proteinG).toBe(15.8)
    expect(picks[0].grams).toBe(200)
  })

  it('drops picks whose ingredient no longer exists, preserving order', () => {
    const picks = resolvePicks(
      [
        { name: 'Firm tofu', grams: 200 },
        { name: 'Dodo fillet', grams: 100 },
        { name: 'Banana', grams: 118 },
      ],
      NUTRITION_GROUPS,
    )
    expect(picks.map((p) => p.item.name)).toEqual(['Firm tofu', 'Banana'])
  })
})
