import { describe, expect, it } from 'vitest'
import { NUTRITION_GROUPS, type NutritionGroup } from '@/data/nutrition-reference'
import {
  activeFilterCount,
  applyFilters,
  costPerProteinServing,
  countItems,
  EMPTY_FILTERS,
  LEAN_MAX_FAT,
  MEDIUM_MAX_FAT,
  PROTEIN_SERVING_G,
  proteinPerKcal,
  sortItems,
  type FilterState,
} from './nutrition-filter'

const filters = (over: Partial<FilterState> = {}): FilterState => ({ ...EMPTY_FILTERS, ...over })

const fixture: NutritionGroup[] = [
  {
    name: 'Beef cuts',
    icon: 'steak',
    items: [
      { name: 'Beef sirloin', icon: 'steak', cut: 'Loin', leanness: 'lean', kcal: 130, proteinG: 22.5, carbG: 0, fatG: 4.1, pricePer100gHKD: 22, portion: '150 g' },
      { name: 'Beef short rib', icon: 'steak', cut: 'Rib', leanness: 'fatty', kcal: 380, proteinG: 15.1, carbG: 0, fatG: 35.7, portion: '120 g' },
      { name: 'Beef flank', icon: 'steak', cut: 'Flank', leanness: 'medium', kcal: 192, proteinG: 21.2, carbG: 0, fatG: 11.6, pricePer100gHKD: 15, portion: '150 g', inPlan: true },
    ],
  },
  {
    name: 'Fats',
    icon: 'oil',
    items: [{ name: 'Cooking oil', icon: 'oil', kcal: 884, proteinG: 0, carbG: 0, fatG: 100, portion: '1 tbsp' }],
  },
]

describe('proteinPerKcal', () => {
  it('ranks lean protein above fat', () => {
    expect(proteinPerKcal(fixture[0].items[0])).toBeGreaterThan(proteinPerKcal(fixture[0].items[1]))
  })

  it('returns 0 rather than dividing by zero for a zero-calorie item', () => {
    expect(proteinPerKcal({ name: 'Water', icon: 'broth', kcal: 0, proteinG: 0, carbG: 0, fatG: 0, portion: '1 cup' })).toBe(0)
  })
})

describe('costPerProteinServing', () => {
  it('prices one protein serving from the per-100g price', () => {
    // Sirloin: HK$22/100 g at 22.5 g protein → $22/22.5 × 30 g.
    expect(costPerProteinServing(fixture[0].items[0])).toBeCloseTo((22 / 22.5) * PROTEIN_SERVING_G)
  })

  it('returns null for unpriced items', () => {
    expect(costPerProteinServing(fixture[0].items[1])).toBeNull()
  })

  it('returns null when protein is too low for the ratio to be meaningful', () => {
    expect(
      costPerProteinServing({ name: 'Oyster sauce', icon: 'oil', kcal: 51, proteinG: 1.4, carbG: 10.9, fatG: 0.3, pricePer100gHKD: 5, portion: '1 tbsp' }),
    ).toBeNull()
  })
})

describe('sortItems', () => {
  it('sorts by name, protein, calories and fat', () => {
    const items = fixture[0].items
    expect(sortItems(items, 'name').map((i) => i.name)).toEqual(['Beef flank', 'Beef short rib', 'Beef sirloin'])
    expect(sortItems(items, 'protein')[0].name).toBe('Beef sirloin')
    expect(sortItems(items, 'kcal')[0].name).toBe('Beef short rib')
    expect(sortItems(items, 'fat')[0].name).toBe('Beef short rib')
    expect(sortItems(items, 'density')[0].name).toBe('Beef sirloin')
  })

  it('sorts by protein cost ascending with unpriced items last', () => {
    expect(sortItems(fixture[0].items, 'cost').map((i) => i.name)).toEqual([
      'Beef flank', // $15/100 g, cheapest per protein
      'Beef sirloin', // $22/100 g
      'Beef short rib', // unpriced → last
    ])
  })

  it('does not mutate the input', () => {
    const items = fixture[0].items
    const before = items.map((i) => i.name)
    sortItems(items, 'kcal')
    expect(items.map((i) => i.name)).toEqual(before)
  })
})

describe('applyFilters', () => {
  it('returns everything when no filter is active', () => {
    expect(countItems(applyFilters(fixture, filters()))).toBe(4)
  })

  it('matches the query against name, cut and category', () => {
    expect(countItems(applyFilters(fixture, filters({ query: 'sirloin' })))).toBe(1)
    expect(countItems(applyFilters(fixture, filters({ query: 'rib' })))).toBe(1)
    expect(countItems(applyFilters(fixture, filters({ query: 'beef cuts' })))).toBe(3)
  })

  it('ignores whitespace-only queries', () => {
    expect(countItems(applyFilters(fixture, filters({ query: '   ' })))).toBe(4)
  })

  it('drops groups that end up empty', () => {
    const out = applyFilters(fixture, filters({ query: 'sirloin' }))
    expect(out.map((g) => g.name)).toEqual(['Beef cuts'])
  })

  it('stacks macro filters as AND', () => {
    const protein = applyFilters(fixture, filters({ macros: new Set(['high-protein']) }))
    expect(countItems(protein)).toBe(3)

    // Adding a second chip can empty the result: nothing here is both
    // high-protein and under 3 g fat (sirloin, the leanest, has 4.1 g).
    const both = applyFilters(fixture, filters({ macros: new Set(['high-protein', 'low-fat']) }))
    expect(countItems(both)).toBe(0)

    const leanIsh = applyFilters(fixture, filters({ macros: new Set(['high-protein', 'low-carb']) }))
    expect(leanIsh.flatMap((g) => g.items).map((i) => i.name)).toEqual(['Beef flank', 'Beef short rib', 'Beef sirloin'])
  })

  it('treats leanness chips as OR', () => {
    const out = applyFilters(fixture, filters({ leanness: new Set(['lean', 'medium']) }))
    expect(out.flatMap((g) => g.items).map((i) => i.name).sort()).toEqual(['Beef flank', 'Beef sirloin'])
  })

  it('excludes items with no leanness when a leanness filter is on', () => {
    const out = applyFilters(fixture, filters({ leanness: new Set(['lean']) }))
    expect(out.flatMap((g) => g.items).every((i) => i.name !== 'Cooking oil')).toBe(true)
  })

  it('filters to meal-plan items only', () => {
    const out = applyFilters(fixture, filters({ macros: new Set(['in-plan']) }))
    expect(out.flatMap((g) => g.items).map((i) => i.name)).toEqual(['Beef flank'])
  })

  it('never matches a zero-protein item on protein efficiency', () => {
    const out = applyFilters(fixture, filters({ macros: new Set(['efficient']) }))
    expect(out.flatMap((g) => g.items).every((i) => i.name !== 'Cooking oil')).toBe(true)
  })

  it('restricts to selected categories', () => {
    const out = applyFilters(fixture, filters({ categories: new Set(['Fats']) }))
    expect(out.map((g) => g.name)).toEqual(['Fats'])
  })

  it('combines category, macro and query filters', () => {
    const out = applyFilters(
      fixture,
      filters({ categories: new Set(['Beef cuts']), macros: new Set(['high-protein']), query: 'sir' }),
    )
    expect(out.flatMap((g) => g.items).map((i) => i.name)).toEqual(['Beef sirloin'])
  })
})

describe('activeFilterCount', () => {
  it('counts every dimension but the free-text query', () => {
    expect(activeFilterCount(filters())).toBe(0)
    expect(
      activeFilterCount(filters({ categories: new Set(['Fats']), macros: new Set(['low-cal']), leanness: new Set(['lean']), query: 'x' })),
    ).toBe(3)
  })
})

describe('the shipped dataset', () => {
  it('has unique ingredient names within each group', () => {
    for (const g of NUTRITION_GROUPS) {
      const names = g.items.map((i) => i.name)
      expect(new Set(names).size, `duplicate in ${g.name}`).toBe(names.length)
    }
  })

  it('labels leanness consistently with the item fat content', () => {
    for (const item of NUTRITION_GROUPS.flatMap((g) => g.items)) {
      if (!item.leanness) continue
      const expected = item.fatG < LEAN_MAX_FAT ? 'lean' : item.fatG <= MEDIUM_MAX_FAT ? 'medium' : 'fatty'
      expect(item.leanness, `${item.name} (${item.fatG} g fat)`).toBe(expected)
    }
  })

  it('keeps macros roughly consistent with the stated calories', () => {
    // Atwater 4/4/9, with slack for fibre and rounding. Alcoholic seasonings are
    // excluded: ethanol carries 7 kcal/g that no macro column accounts for, so
    // their calories legitimately exceed what protein/carb/fat can explain.
    const ALCOHOLIC = new Set(['Mirin', 'Shaoxing wine'])
    for (const item of NUTRITION_GROUPS.flatMap((g) => g.items)) {
      if (ALCOHOLIC.has(item.name)) continue
      const derived = item.proteinG * 4 + item.carbG * 4 + item.fatG * 9
      const slack = Math.max(25, item.kcal * 0.25)
      expect(Math.abs(derived - item.kcal), `${item.name}: ${derived} vs ${item.kcal}`).toBeLessThanOrEqual(slack)
    }
  })

  it('flags the alcoholic seasonings so their calorie gap is intentional', () => {
    // Guards the exemption above: if these ever stop being alcohol-bearing,
    // the note should change and the exemption should be revisited.
    for (const name of ['Mirin', 'Shaoxing wine']) {
      const item = NUTRITION_GROUPS.flatMap((g) => g.items).find((i) => i.name === name)
      expect(item, name).toBeDefined()
      expect(item!.note?.toLowerCase(), name).toContain('alcohol')
    }
  })

  it('only prices items where cost-per-protein is meaningful', () => {
    for (const item of NUTRITION_GROUPS.flatMap((g) => g.items)) {
      if (item.pricePer100gHKD === undefined) continue
      expect(item.pricePer100gHKD, item.name).toBeGreaterThan(0)
      expect(costPerProteinServing(item), `${item.name} is priced but yields no cost`).not.toBeNull()
    }
  })

  it('prices every protein-group item that a shopper can actually buy', () => {
    // Yolks aren't sold alone and stock is priced as a dish, not a protein buy.
    const UNPRICEABLE = new Set(['Egg yolk only', 'Anchovy stock'])
    const PROTEIN_GROUPS = ['Chicken & poultry cuts', 'Eggs', 'Beef cuts', 'Pork cuts', 'Fish', 'Shellfish & seafood', 'Soy & plant protein', 'Dairy']
    for (const g of NUTRITION_GROUPS.filter((g) => PROTEIN_GROUPS.includes(g.name))) {
      for (const item of g.items) {
        if (UNPRICEABLE.has(item.name)) continue
        expect(item.pricePer100gHKD, `${item.name} has no price`).toBeDefined()
      }
    }
  })

  it('gives every item a non-negative macro profile and a portion', () => {
    for (const item of NUTRITION_GROUPS.flatMap((g) => g.items)) {
      expect(item.kcal, item.name).toBeGreaterThanOrEqual(0)
      expect(Math.min(item.proteinG, item.carbG, item.fatG), item.name).toBeGreaterThanOrEqual(0)
      expect(item.portion.length, item.name).toBeGreaterThan(0)
    }
  })
})
