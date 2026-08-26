import { describe, it, expect } from 'vitest'
import { ewma, trendKgPerWeek, spanDays, evaluatePlan, suggestGoalChange, type WeightEntry } from './adjust'
import type { Profile } from './nutrition'

const dennis: Profile = {
  birthDate: '1993-07-02',
  sex: 'male',
  heightCm: 178,
  weightKg: 78.8,
  goal: 'recomp',
  activity: 'moderate',
  liftDaysPerWeek: 4,
  cardioDaysPerWeek: 3,
}

/** Build a weigh-in series losing `perWeek` kg/week, with optional noise. */
function series(start: number, perWeek: number, days: number, noise: number[] = []): WeightEntry[] {
  const out: WeightEntry[] = []
  for (let d = 0; d <= days; d += 2) {
    const date = new Date(Date.UTC(2026, 0, 1 + d)).toISOString().slice(0, 10)
    out.push({ date, weightKg: +(start + (perWeek / 7) * d + (noise[out.length] ?? 0)).toFixed(2) })
  }
  return out
}

describe('ewma', () => {
  it('returns the first reading unchanged', () => {
    const s = ewma([{ date: '2026-01-01', weightKg: 80 }])
    expect(s[0].value).toBe(80)
  })
  it('smooths a spike toward the trend', () => {
    const raw: WeightEntry[] = [
      { date: '2026-01-01', weightKg: 79 },
      { date: '2026-01-02', weightKg: 79 },
      { date: '2026-01-03', weightKg: 83 }, // salty dinner
    ]
    const s = ewma(raw)
    expect(s[2].value).toBeLessThan(81)
    expect(s[2].value).toBeGreaterThan(79)
  })
  it('sorts unordered input by date', () => {
    const s = ewma([
      { date: '2026-01-03', weightKg: 78 },
      { date: '2026-01-01', weightKg: 80 },
    ])
    expect(s[0].date).toBe('2026-01-01')
  })
})

describe('trendKgPerWeek', () => {
  it('is null with fewer than two entries', () => {
    expect(trendKgPerWeek([])).toBeNull()
    expect(trendKgPerWeek([{ date: '2026-01-01', weightKg: 80 }])).toBeNull()
  })
  it('detects a downward trend', () => {
    expect(trendKgPerWeek(series(80, -0.3, 28))!).toBeLessThan(0)
  })
  it('detects an upward trend', () => {
    expect(trendKgPerWeek(series(70, 0.25, 28))!).toBeGreaterThan(0)
  })
  it('reads near zero for flat weight', () => {
    expect(Math.abs(trendKgPerWeek(series(78, 0, 28))!)).toBeLessThan(0.05)
  })
  it('is not derailed by one outlier', () => {
    const clean = series(80, -0.3, 28)
    const spiked = clean.map((e, i) => (i === 5 ? { ...e, weightKg: e.weightKg + 2.5 } : e))
    expect(Math.abs(trendKgPerWeek(spiked)! - trendKgPerWeek(clean)!)).toBeLessThan(0.25)
  })
})

describe('spanDays', () => {
  it('is 0 for a single entry', () => {
    expect(spanDays([{ date: '2026-01-01', weightKg: 80 }])).toBe(0)
  })
  it('measures first to last', () => {
    expect(spanDays(series(80, -0.3, 28))).toBe(28)
  })
})

describe('evaluatePlan', () => {
  it('asks for more data early on', () => {
    const v = evaluatePlan(dennis, series(80, -0.3, 6))
    expect(v.kind).toBe('insufficient-data')
    expect(v.calorieDelta).toBe(0)
  })
  it('confirms on-track at the target rate', () => {
    // recomp target for 78.8kg is 0.4% => ~0.32 kg/week loss
    const v = evaluatePlan(dennis, series(78.8, -0.32, 28))
    expect(v.kind).toBe('on-track')
    expect(v.calorieDelta).toBe(0)
  })
  it('flags losing too fast and suggests eating more', () => {
    const v = evaluatePlan(dennis, series(78.8, -1.0, 28))
    expect(v.kind).toBe('too-fast')
    expect(v.calorieDelta).toBeGreaterThan(0)
  })
  it('flags a stall and suggests eating less', () => {
    const v = evaluatePlan(dennis, series(78.8, -0.02, 28))
    expect(v.kind).toBe('too-slow')
    expect(v.calorieDelta).toBeLessThan(0)
  })
  it('flags gaining while trying to lose', () => {
    const v = evaluatePlan(dennis, series(78.8, 0.4, 28))
    expect(v.kind).toBe('wrong-way')
    expect(v.calorieDelta).toBeLessThan(0)
  })
  it('caps the calorie nudge at 250', () => {
    const v = evaluatePlan(dennis, series(78.8, -3, 28))
    expect(Math.abs(v.calorieDelta)).toBeLessThanOrEqual(250)
  })
  it('treats flat weight as success when maintaining', () => {
    const v = evaluatePlan({ ...dennis, goal: 'maintain' }, series(78.8, 0, 28))
    expect(v.kind).toBe('on-track')
    expect(v.calorieDelta).toBe(0)
  })
  it('catches drift away from maintenance', () => {
    const v = evaluatePlan({ ...dennis, goal: 'maintain' }, series(78.8, 0.5, 28))
    expect(v.calorieDelta).toBeLessThan(0)
  })
})

describe('suggestGoalChange', () => {
  it('moves a cut to recomp once lean', () => {
    expect(suggestGoalChange({ ...dennis, goal: 'cut' }, 20.5)?.goal).toBe('recomp')
  })
  it('moves recomp to lean-bulk at the lean end', () => {
    expect(suggestGoalChange(dennis, 19)?.goal).toBe('lean-bulk')
  })
  it('ends a bulk that has overshot', () => {
    expect(suggestGoalChange({ ...dennis, goal: 'lean-bulk' }, 25)?.goal).toBe('recomp')
  })
  it('stays silent when the goal still fits', () => {
    expect(suggestGoalChange(dennis, 24.9)).toBeNull()
  })
})
