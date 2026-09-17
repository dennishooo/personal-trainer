import { describe, expect, it } from 'vitest'
import schemaSql from '../../supabase/schema.sql?raw'
import migrationSql from '../../supabase/migrations/0001_sync_keys.sql?raw'
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
  it('keeps the logged sets and exercise remarks, never the store actions', () => {
    const sets = [{ setId: 's1', date: '2026-09-16', exerciseId: 'goblet-squat', weightKg: 24, reps: 12 }]
    const remarks = { 'goblet-squat': 'heels on a plate' }
    expect(workoutLogSnapshot({ sets, remarks, addSet: () => {} } as never)).toEqual({ sets, remarks })
  })

  it('defaults a row written before the workout log or remarks existed', () => {
    // Without this, signing in on a device that has history would overwrite it
    // with undefined from an older remote row.
    expect(workoutLogSnapshot({} as never)).toEqual({ sets: [], remarks: {} })
  })
})

describe('the Supabase key whitelist', () => {
  // The constraint lives in SQL, so a new SYNC_KEYS entry does not fail the
  // build — it fails at write time in production with
  // "violates check constraint user_state_key_check". This is the only place
  // the two lists are compared, so it is what keeps them in step.
  const keysIn = (sql: string) =>
    sql.match(/check \(key in \(([^)]*)\)\)/)![1].match(/'([^']+)'/g)!.map((k) => k.replace(/'/g, ''))

  it('matches SYNC_KEYS in schema.sql, so a fresh database accepts every store', () => {
    expect(keysIn(schemaSql).sort()).toEqual([...SYNC_KEYS].sort())
  })

  it('matches SYNC_KEYS in the latest migration, so an existing database is widened too', () => {
    expect(keysIn(migrationSql.split('add constraint')[1]).sort()).toEqual([...SYNC_KEYS].sort())
  })
})
