import { describe, it, expect, beforeEach } from 'vitest'
import { usePlan } from './profile'

const initial = usePlan.getState()

describe('usePlan', () => {
  beforeEach(() => {
    usePlan.setState({
      ...initial,
      profile: { ...initial.profile, weightKg: 78.8 },
      weights: [{ date: '2026-01-01', weightKg: 78.8 }],
      supplements: ['whey'],
      favourites: [],
      calorieOverride: 0,
    })
  })

  it('keeps profile weight in step with the newest weigh-in', () => {
    usePlan.getState().addWeight({ date: '2026-02-01', weightKg: 76.4 })
    expect(usePlan.getState().profile.weightKg).toBe(76.4)
  })

  it('replaces rather than duplicates an entry for the same date', () => {
    usePlan.getState().addWeight({ date: '2026-01-01', weightKg: 79.5 })
    const { weights } = usePlan.getState()
    expect(weights.filter((w) => w.date === '2026-01-01')).toHaveLength(1)
    expect(weights[0].weightKg).toBe(79.5)
  })

  it('sorts entries by date regardless of insertion order', () => {
    usePlan.getState().addWeight({ date: '2026-03-01', weightKg: 75 })
    usePlan.getState().addWeight({ date: '2026-02-01', weightKg: 77 })
    expect(usePlan.getState().weights.map((w) => w.date)).toEqual(['2026-01-01', '2026-02-01', '2026-03-01'])
  })

  it('falls back to the previous weigh-in when one is removed', () => {
    usePlan.getState().addWeight({ date: '2026-02-01', weightKg: 76 })
    usePlan.getState().removeWeight('2026-02-01')
    expect(usePlan.getState().profile.weightKg).toBe(78.8)
  })

  it('does not crash when every entry is removed', () => {
    usePlan.getState().removeWeight('2026-01-01')
    expect(usePlan.getState().weights).toHaveLength(0)
  })

  it('records a profile weight edit into the history too', () => {
    usePlan.getState().setProfile({ weightKg: 77 })
    const { weights } = usePlan.getState()
    expect(weights[weights.length - 1].weightKg).toBe(77)
  })

  it('toggles supplements on and off', () => {
    usePlan.getState().toggleSupplement('creatine')
    expect(usePlan.getState().supplements).toContain('creatine')
    usePlan.getState().toggleSupplement('creatine')
    expect(usePlan.getState().supplements).not.toContain('creatine')
  })

  it('toggles favourites', () => {
    usePlan.getState().toggleFavourite('d-steamed-fish')
    expect(usePlan.getState().favourites).toEqual(['d-steamed-fish'])
    usePlan.getState().toggleFavourite('d-steamed-fish')
    expect(usePlan.getState().favourites).toEqual([])
  })

  it('accumulates calorie adjustments', () => {
    usePlan.getState().applyCalorieDelta(-150)
    usePlan.getState().applyCalorieDelta(-100)
    expect(usePlan.getState().calorieOverride).toBe(-250)
  })

  it('clears the override when the goal changes', () => {
    usePlan.getState().applyCalorieDelta(-200)
    usePlan.getState().setGoal('cut')
    expect(usePlan.getState().calorieOverride).toBe(0)
    expect(usePlan.getState().profile.goal).toBe('cut')
  })
})
