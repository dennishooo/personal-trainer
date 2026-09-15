import { describe, expect, it } from 'vitest'
import { picksSnapshot, planSnapshot, snapshotsEqual, type PlanSnapshot } from './sync'

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
  it('keeps only the picks', () => {
    const state = { picks: [{ name: 'Firm tofu', grams: 200 }], addPick: () => {} }
    expect(picksSnapshot(state)).toEqual({ picks: [{ name: 'Firm tofu', grams: 200 }] })
  })
})

describe('snapshotsEqual', () => {
  it('compares structurally, so a no-op edit does not trigger a push', () => {
    expect(snapshotsEqual(planSnapshot(plan), planSnapshot({ ...plan }))).toBe(true)
    expect(snapshotsEqual(plan, { ...plan, calorieOverride: 0 })).toBe(false)
  })
})
