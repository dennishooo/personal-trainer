import { describe, expect, it } from 'vitest'
import {
  allDishes, CUSTOM_ID_PREFIX, datesUsingDish, deriveVerdict, dishFromDraft, draftFromDish,
  EMPTY_DRAFT, isCustomDish, parseTags, validateDraft, type DishDraft,
} from '@/lib/custom-dish'
import { DISHES, type Dish } from '@/data/dishes'

const draft = (over: Partial<DishDraft> = {}): DishDraft => ({
  ...EMPTY_DRAFT,
  name: 'Tsui Wah curry brisket',
  kcal: '780',
  proteinG: '38',
  carbG: '82',
  fatG: '30',
  ...over,
})

describe('validateDraft', () => {
  it('accepts a coherent draft', () => {
    expect(validateDraft(draft())).toEqual({})
  })

  it('requires a name', () => {
    expect(validateDraft(draft({ name: '  ' })).name).toBeDefined()
  })

  it('requires the four core numbers', () => {
    const errors = validateDraft({ ...EMPTY_DRAFT, name: 'x' })
    expect(Object.keys(errors).sort()).toEqual(['carbG', 'fatG', 'kcal', 'proteinG'])
  })

  it('rejects negative and non-numeric values', () => {
    expect(validateDraft(draft({ proteinG: '-5' })).proteinG).toBeDefined()
    expect(validateDraft(draft({ carbG: 'abc' })).carbG).toBeDefined()
  })

  it('allows blank sodium and price, but not junk in them', () => {
    expect(validateDraft(draft({ sodiumMg: '', priceHKD: '' }))).toEqual({})
    expect(validateDraft(draft({ priceHKD: 'free' })).priceHKD).toBeDefined()
  })

  it('flags calories that disagree with the macros', () => {
    // 38p + 82c + 30f ≈ 750 kcal, so 200 is a typo the card would never reveal.
    expect(validateDraft(draft({ kcal: '200' })).kcal).toMatch(/750 kcal/)
  })

  it('accepts calories within the 20% band', () => {
    expect(validateDraft(draft({ kcal: '820' }))).toEqual({})
  })

  it('rejects zero calories alongside real macros', () => {
    expect(validateDraft(draft({ kcal: '0' })).kcal).toBeDefined()
  })

  it('accepts an all-zero row, for a zero-calorie drink', () => {
    expect(validateDraft(draft({ kcal: '0', proteinG: '0', carbG: '0', fatG: '0' }))).toEqual({})
  })
})

describe('deriveVerdict', () => {
  it('is green for lean, protein-dense, low-sodium dishes', () => {
    expect(deriveVerdict(300, 38, 800)).toBe('green')
  })

  it('is amber for middling protein density', () => {
    expect(deriveVerdict(700, 28, 900)).toBe('amber')
  })

  it('is red for a dish that is mostly filler', () => {
    expect(deriveVerdict(560, 10, 900)).toBe('red')
  })

  it('caps a protein-dense dish at amber once it blows the sodium limit', () => {
    expect(deriveVerdict(300, 38, 2400)).toBe('amber')
  })

  it('never returns green for a very large dish', () => {
    expect(deriveVerdict(1100, 70, 500)).toBe('amber')
  })

  it('does not divide by zero', () => {
    expect(deriveVerdict(0, 0, 0)).toBe('red')
  })
})

describe('parseTags', () => {
  it('splits, trims, lowercases and dedupes', () => {
    expect(parseTags(' Rice, curry ,RICE, ')).toEqual(['rice', 'curry'])
  })

  it('is empty for a blank field', () => {
    expect(parseTags('   ')).toEqual([])
  })
})

describe('dishFromDraft', () => {
  it('builds a dish with the given id', () => {
    const dish = dishFromDraft(draft(), 'custom-1')
    expect(dish).toMatchObject({
      id: 'custom-1',
      name: 'Tsui Wah curry brisket',
      kcal: 780,
      proteinG: 38,
      carbG: 82,
      fatG: 30,
      sodiumMg: 0,
    })
  })

  it('omits optional fields rather than storing empty strings', () => {
    const dish = dishFromDraft(draft(), 'custom-1')
    expect('chinese' in dish).toBe(false)
    expect('priceHKD' in dish).toBe(false)
    expect('swap' in dish).toBe(false)
  })

  it('keeps optional fields that were filled in', () => {
    const dish = dishFromDraft(
      draft({ chinese: '咖喱牛腩', priceHKD: '68', swap: 'Ask for less rice' }),
      'custom-1',
    )
    expect(dish.chinese).toBe('咖喱牛腩')
    expect(dish.priceHKD).toBe(68)
    expect(dish.swap).toBe('Ask for less rice')
  })

  it('defaults a blank serving note rather than leaving the card empty', () => {
    expect(dishFromDraft(draft({ servingNote: '' }), 'custom-1').servingNote).toBe('One portion')
  })

  it('derives the verdict when set to auto', () => {
    expect(dishFromDraft(draft({ verdict: 'auto' }), 'c').verdict).toBe('amber')
  })

  it('honours a pinned verdict', () => {
    expect(dishFromDraft(draft({ verdict: 'green' }), 'c').verdict).toBe('green')
  })
})

describe('draftFromDish', () => {
  it('round-trips a dish through the form without loss', () => {
    const original = DISHES.find((d) => d.id === 'ccc-beef-chow-fun')!
    const rebuilt = dishFromDraft(draftFromDish(original), original.id)
    expect(rebuilt).toEqual(original)
  })

  it('round-trips a dish that has no optional fields', () => {
    const original = DISHES.find((d) => d.chinese === undefined && d.swap === undefined)!
    expect(dishFromDraft(draftFromDish(original), original.id)).toEqual(original)
  })
})

describe('isCustomDish', () => {
  it('tells user rows apart from shipped ones', () => {
    expect(isCustomDish({ id: `${CUSTOM_ID_PREFIX}abc` } as Dish)).toBe(true)
    expect(isCustomDish(DISHES[0])).toBe(false)
  })

  it('is false for every shipped dish', () => {
    expect(DISHES.some(isCustomDish)).toBe(false)
  })
})

describe('allDishes', () => {
  it('puts custom dishes first so a new one is visible immediately', () => {
    const mine = { id: 'custom-1', name: 'Mine' } as Dish
    expect(allDishes([mine], DISHES)[0]).toBe(mine)
  })

  it('returns just the built-ins when nothing is custom', () => {
    expect(allDishes([], DISHES)).toHaveLength(DISHES.length)
  })
})

describe('datesUsingDish', () => {
  const entries = [
    { date: '2026-09-16', dishId: 'custom-1' },
    { date: '2026-09-14', dishId: 'custom-1' },
    { date: '2026-09-16', dishId: 'custom-1' },
    { date: '2026-09-15', dishId: 'other' },
  ]

  it('dedupes dates and sorts newest first', () => {
    expect(datesUsingDish(entries, 'custom-1')).toEqual(['2026-09-16', '2026-09-14'])
  })

  it('is empty for a dish that was never logged', () => {
    expect(datesUsingDish(entries, 'unused')).toEqual([])
  })
})
