import { describe, it, expect } from 'vitest'
import {
  ageFrom, bmr, tdee, bmi, bmiBand, macroTargets, proteinPerKg,
  mealTargets, targetWeightRange, maintenanceCalories, weeklyRateTarget,
  type Profile,
} from './nutrition'

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

describe('ageFrom', () => {
  it('computes age at a date after the birthday', () => {
    expect(ageFrom('1993-07-02', new Date('2026-08-26'))).toBe(33)
  })
  it('does not count the birthday before it arrives', () => {
    expect(ageFrom('1993-07-02', new Date('2026-07-01'))).toBe(32)
    expect(ageFrom('1993-07-02', new Date('2026-07-02'))).toBe(33)
  })
  it('returns 0 for an unparseable date', () => {
    expect(ageFrom('not-a-date')).toBe(0)
  })
})

describe('bmr', () => {
  it('matches Mifflin-St Jeor for the male formula', () => {
    // 10*78.8 + 6.25*178 - 5*33 + 5 = 788 + 1112.5 - 165 + 5
    expect(bmr({ sex: 'male', weightKg: 78.8, heightCm: 178, age: 33 })).toBe(1741)
  })
  it('applies the female constant', () => {
    const m = bmr({ sex: 'male', weightKg: 70, heightCm: 170, age: 30 })
    const f = bmr({ sex: 'female', weightKg: 70, heightCm: 170, age: 30 })
    expect(m - f).toBe(166)
  })
  it('falls as age rises', () => {
    const young = bmr({ sex: 'male', weightKg: 78.8, heightCm: 178, age: 33 })
    const older = bmr({ sex: 'male', weightKg: 78.8, heightCm: 178, age: 53 })
    expect(older).toBeLessThan(young)
    expect(young - older).toBe(100)
  })
})

describe('tdee', () => {
  it('scales BMR by the activity factor', () => {
    expect(tdee(1741, 'moderate')).toBe(Math.round(1741 * 1.55))
  })
})

describe('bmi and bands', () => {
  it('computes BMI', () => {
    expect(bmi(78.8, 178)).toBe(24.9)
  })
  it('uses Asian-Pacific cut-offs', () => {
    expect(bmiBand(22.9).label).toBe('Healthy')
    expect(bmiBand(23).label).toBe('Overweight')
    expect(bmiBand(24.9).label).toBe('Overweight')
    expect(bmiBand(25).label).toBe('Obese I')
    expect(bmiBand(18).label).toBe('Underweight')
    expect(bmiBand(31).label).toBe('Obese II')
  })
})

describe('proteinPerKg', () => {
  it('is highest when cutting', () => {
    expect(proteinPerKg('cut', 33)).toBeGreaterThan(proteinPerKg('recomp', 33))
    expect(proteinPerKg('recomp', 33)).toBeGreaterThan(proteinPerKg('lean-bulk', 33))
  })
  it('rises with age to offset anabolic resistance', () => {
    expect(proteinPerKg('recomp', 39)).toBe(2.0)
    expect(proteinPerKg('recomp', 40)).toBe(2.1)
    expect(proteinPerKg('recomp', 50)).toBe(2.2)
    expect(proteinPerKg('recomp', 60)).toBe(2.3)
  })
})

describe('macroTargets', () => {
  const m = macroTargets(dennis, 33)

  it('puts a recomp target below maintenance', () => {
    expect(m.calories).toBeLessThan(maintenanceCalories(dennis, 33))
  })
  it('sets protein from bodyweight', () => {
    expect(m.proteinG).toBe(Math.round(78.8 * 2.0))
  })
  it('has macros that sum to the calorie target', () => {
    expect(m.proteinKcal + m.fatKcal + m.carbKcal).toBeCloseTo(m.calories, -1)
  })
  it('never floors fat below 0.8 g/kg', () => {
    const lean = macroTargets({ ...dennis, goal: 'cut', weightKg: 60 }, 33)
    expect(lean.fatG).toBeGreaterThanOrEqual(Math.round(60 * 0.8))
  })
  it('never returns negative carbs', () => {
    const extreme = macroTargets({ ...dennis, weightKg: 140, goal: 'cut', activity: 'sedentary' }, 33)
    expect(extreme.carbG).toBeGreaterThanOrEqual(0)
  })
  it('recalculates when weight changes', () => {
    const lighter = macroTargets({ ...dennis, weightKg: 72 }, 33)
    expect(lighter.calories).toBeLessThan(m.calories)
    expect(lighter.proteinG).toBeLessThan(m.proteinG)
  })
  it('recalculates when age changes', () => {
    const older = macroTargets(dennis, 55)
    expect(older.calories).toBeLessThan(m.calories)
    expect(older.proteinG).toBeGreaterThan(m.proteinG)
  })
})

describe('mealTargets', () => {
  it('splits the day without losing more than rounding', () => {
    const m = macroTargets(dennis, 33)
    const meals = mealTargets(m)
    const sum = meals.reduce((a, x) => a + x.calories, 0)
    expect(Math.abs(sum - m.calories)).toBeLessThanOrEqual(4)
  })
  it('gives lunch the largest share', () => {
    const meals = mealTargets(macroTargets(dennis, 33))
    const lunch = meals.find((x) => x.slot === 'lunch')!
    expect(Math.max(...meals.map((x) => x.calories))).toBe(lunch.calories)
  })
})

describe('targetWeightRange', () => {
  it('brackets the healthy Asian BMI band', () => {
    const r = targetWeightRange(178)
    expect(r.min).toBeCloseTo(58.6, 0)
    expect(r.max).toBeCloseTo(72.5, 0)
  })
})

describe('weeklyRateTarget', () => {
  it('is more aggressive for a cut than a recomp', () => {
    expect(weeklyRateTarget({ ...dennis, goal: 'cut' })).toBeGreaterThan(weeklyRateTarget(dennis))
  })
  it('is zero when maintaining', () => {
    expect(weeklyRateTarget({ ...dennis, goal: 'maintain' })).toBe(0)
  })
})
