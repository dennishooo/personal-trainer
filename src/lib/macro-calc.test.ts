import { describe, expect, it } from 'vitest'
import type { NutritionItem } from '@/data/nutrition-reference'
import type { MacroTargets } from '@/lib/nutrition'
import { deltasFrom, scalePick, totalsFor } from './macro-calc'

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
