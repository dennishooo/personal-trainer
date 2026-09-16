import { describe, expect, it } from 'vitest'
import { customDishesSnapshot, dishLogSnapshot, picksSnapshot, planSnapshot, snapshotsEqual, SYNC_KEYS, workoutLogSnapshot, type PlanSnapshot } from './sync'

const plan: PlanSnapshot = {
  profile: {
    birthDate: '1993-07-02',
    sex: 'male',
    heightCm: 178,
    weightKg: 78.8,
    goal: 'recomp',
    activity: 'moderate',
    liftDaysPerWeek: 4,
    cardioDaysPerWeek: 2,
  },
  weights: [{ date: '2026-09-15', weightKg: 78.8 }],
  supplements: ['whey'],
  favourites: [],
  calorieOverride: -100,
}

describe('planSnapshot', () => {
  it('keeps exactly the persisted data fields, dropping store actions', () => {
    const state = { ...plan, setProfile: () => {}, addWeight: () => {} }
    expect(planSnapshot(state)).toEqual(plan)
    expect(Object.keys(planSnapshot(state)).sort()).toEqual([
      'calorieOverride', 'favourites', 'profile', 'supplements', 'weights',
    ])
  })
})

describe('picksSnapshot', () => {
  it('keeps picks and saved meals, dropping store actions', () => {
    const state = {
      picks: [{ name: 'Firm tofu', grams: 200 }],
      savedMeals: [{ id: 'a', name: 'Lunch', picks: [{ name: 'Banana', grams: 118 }] }],
      addPick: () => {},
    }
    expect(picksSnapshot(state)).toEqual({ picks: state.picks, savedMeals: state.savedMeals })
  })

  it('defaults saved meals for rows written before the field existed', () => {
    const legacy = { picks: [] } as unknown as Parameters<typeof picksSnapshot>[0]
    expect(picksSnapshot(legacy)).toEqual({ picks: [], savedMeals: [] })
  })
})

describe('snapshotsEqual', () => {
  it('compares structurally, so a no-op edit does not trigger a push', () => {
    expect(snapshotsEqual(planSnapshot(plan), planSnapshot({ ...plan }))).toBe(true)
    expect(snapshotsEqual(plan, { ...plan, calorieOverride: 0 })).toBe(false)
  })
})

describe('dishLogSnapshot', () => {
  it('keeps the entries, dropping store actions and the viewed date', () => {
    const entries = [{ entryId: 'e1', date: '2026-09-16', dishId: 'ccc-wonton-noodle', portions: 1 }]
    expect(dishLogSnapshot({ entries, viewDate: '2026-09-16', logDish: () => {} } as never)).toEqual({ entries })
  })

  it('defaults a row written before the log existed to empty, not undefined', () => {
    expect(dishLogSnapshot({} as never)).toEqual({ entries: [] })
  })
})

describe('SYNC_KEYS', () => {
  it('covers every store that persists user data', () => {
    expect([...SYNC_KEYS]).toEqual(['plan', 'picks', 'dishLog', 'customDishes', 'workoutLog'])
  })
})

describe('customDishesSnapshot', () => {
  it('keeps the dishes, dropping store actions', () => {
    const dishes = [{ id: 'custom-1', name: 'Mine' }]
    expect(customDishesSnapshot({ dishes, addDish: () => {} } as never)).toEqual({ dishes })
  })

  it('defaults a row written before custom dishes existed to empty', () => {
    expect(customDishesSnapshot({} as never)).toEqual({ dishes: [] })
  })
})

describe('workoutLogSnapshot', () => {
  it('keeps only the logged sets, never the store actions', () => {
    const sets = [{ setId: 's1', date: '2026-09-16', exerciseId: 'goblet-squat', weightKg: 24, reps: 12 }]
    expect(workoutLogSnapshot({ sets, addSet: () => {} } as never)).toEqual({ sets })
  })

  it('defaults a row written before the workout log existed', () => {
    // Without this, signing in on a device that has history would overwrite it
    // with undefined from an older remote row.
    expect(workoutLogSnapshot({} as never)).toEqual({ sets: [] })
  })
})
