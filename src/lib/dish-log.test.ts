import { describe, expect, it } from 'vitest'
import {
  entriesForDate, filterDishes, loggedDates, proteinDensity, remainingFrom,
  scaleEntry, suggestDishes, todayISO, totalsForDay,
  type LogEntry, type ResolvedEntry,
} from '@/lib/dish-log'
import { DISHES, type Dish } from '@/data/dishes'
import type { MacroTargets } from '@/lib/nutrition'

const dish = (over: Partial<Dish> = {}): Dish => ({
  id: 'd1',
  name: 'Test dish',
  icon: 'soup',
  cuisine: 'cantonese',
  servingNote: 'One bowl',
  kcal: 500,
  proteinG: 30,
  carbG: 50,
  fatG: 20,
  sodiumMg: 1000,
  priceHKD: 60,
  verdict: 'green',
  tags: ['test'],
  ...over,
})

const entry = (over: Partial<LogEntry> = {}): LogEntry => ({
  entryId: 'e1',
  date: '2026-09-16',
  dishId: 'd1',
  portions: 1,
  ...over,
})

const resolved = (d: Dish, over: Partial<LogEntry> = {}): ResolvedEntry => ({ ...entry(over), dish: d })

describe('todayISO', () => {
  it('formats the local date, not the UTC one', () => {
    // 00:30 local on the 16th is still the 15th in UTC for +08:00 — the log
    // must follow the user's day, not the server's.
    const local = new Date(2026, 8, 16, 0, 30)
    expect(todayISO(local)).toBe('2026-09-16')
  })
})

describe('entriesForDate', () => {
  it('returns only the requested date, joined to its dish', () => {
    const d = dish()
    const out = entriesForDate(
      [entry(), entry({ entryId: 'e2', date: '2026-09-15' })],
      [d],
      '2026-09-16',
    )
    expect(out).toHaveLength(1)
    expect(out[0].dish.name).toBe('Test dish')
  })

  it('drops entries whose dish no longer exists', () => {
    expect(entriesForDate([entry({ dishId: 'gone' })], [dish()], '2026-09-16')).toEqual([])
  })
})

describe('scaleEntry', () => {
  it('scales every macro by the portion multiplier', () => {
    expect(scaleEntry(resolved(dish(), { portions: 0.5 }))).toEqual({
      kcal: 250, proteinG: 15, carbG: 25, fatG: 10, sodiumMg: 500,
    })
  })
})

describe('totalsForDay', () => {
  it('sums macros, sodium and cost across entries', () => {
    const totals = totalsForDay([
      resolved(dish()),
      resolved(dish({ id: 'd2', kcal: 200, proteinG: 10, carbG: 5, fatG: 8, sodiumMg: 300, priceHKD: 20 }), { entryId: 'e2', dishId: 'd2', portions: 2 }),
    ])
    expect(totals).toEqual({ kcal: 900, proteinG: 50, carbG: 60, fatG: 36, sodiumMg: 1600, costHKD: 100 })
  })

  it('treats an unpriced dish as free rather than NaN', () => {
    expect(totalsForDay([resolved(dish({ priceHKD: undefined }))]).costHKD).toBe(0)
  })

  it('is zero for an empty day', () => {
    expect(totalsForDay([])).toEqual({ kcal: 0, proteinG: 0, carbG: 0, fatG: 0, sodiumMg: 0, costHKD: 0 })
  })
})

describe('remainingFrom', () => {
  const targets = { calories: 2400, proteinG: 160, carbG: 240, fatG: 70 } as MacroTargets

  it('reports what is left of the day', () => {
    const totals = totalsForDay([resolved(dish())])
    expect(remainingFrom(totals, targets)).toEqual({ kcal: 1900, proteinG: 130, carbG: 190, fatG: 50 })
  })

  it('goes negative once the day is over target', () => {
    const totals = totalsForDay([resolved(dish({ kcal: 3000 }))])
    expect(remainingFrom(totals, targets).kcal).toBe(-600)
  })
})

describe('proteinDensity', () => {
  it('is protein grams per 100 kcal', () => {
    expect(proteinDensity(dish({ kcal: 500, proteinG: 30 }))).toBe(6)
  })

  it('does not divide by zero', () => {
    expect(proteinDensity(dish({ kcal: 0 }))).toBe(0)
  })
})

describe('suggestDishes', () => {
  const lean = dish({ id: 'lean', kcal: 300, proteinG: 40 })
  const heavy = dish({ id: 'heavy', kcal: 900, proteinG: 60 })
  const filler = dish({ id: 'filler', kcal: 400, proteinG: 5 })

  it('prefers what fits the remaining calories', () => {
    expect(suggestDishes([heavy, lean, filler], 500, 3).map((d) => d.id)).toEqual(['lean', 'filler', 'heavy'])
  })

  it('ranks by protein density among dishes that fit', () => {
    expect(suggestDishes([filler, lean], 1000, 1)[0].id).toBe('lean')
  })

  it('still returns options when nothing fits', () => {
    expect(suggestDishes([heavy, filler], 100, 2)).toHaveLength(2)
  })
})

describe('loggedDates', () => {
  it('dedupes and sorts newest first', () => {
    expect(
      loggedDates([
        entry({ date: '2026-09-14' }),
        entry({ entryId: 'e2', date: '2026-09-16' }),
        entry({ entryId: 'e3', date: '2026-09-14' }),
      ]),
    ).toEqual(['2026-09-16', '2026-09-14'])
  })
})

describe('filterDishes', () => {
  const all = { query: '', cuisine: 'all', verdict: 'all' as const }

  it('matches the Chinese name', () => {
    const out = filterDishes(DISHES, { ...all, query: '乾炒牛河' })
    expect(out.map((d) => d.id)).toEqual(['ccc-beef-chow-fun'])
  })

  it('matches tags case-insensitively', () => {
    expect(filterDishes(DISHES, { ...all, query: 'DIM-SUM' }).length).toBeGreaterThan(3)
  })

  it('combines cuisine and verdict', () => {
    const out = filterDishes(DISHES, { ...all, cuisine: 'japanese', verdict: 'green' })
    expect(out.length).toBeGreaterThan(0)
    expect(out.every((d) => d.cuisine === 'japanese' && d.verdict === 'green')).toBe(true)
  })

  it('returns everything with no filters', () => {
    expect(filterDishes(DISHES, all)).toHaveLength(DISHES.length)
  })
})

describe('DISHES dataset', () => {
  // The README quotes this count; bump both together.
  it('has 300 dishes', () => {
    expect(DISHES).toHaveLength(300)
  })

  it('has unique ids', () => {
    expect(new Set(DISHES.map((d) => d.id)).size).toBe(DISHES.length)
  })

  it('quotes macros that roughly add up to the stated calories', () => {
    // 4/4/9 kcal per gram, ±20% to absorb alcohol-free rounding and fibre.
    for (const d of DISHES) {
      const fromMacros = d.proteinG * 4 + d.carbG * 4 + d.fatG * 9
      expect(Math.abs(fromMacros - d.kcal) / d.kcal, `${d.name}`).toBeLessThan(0.2)
    }
  })
})
