/**
 * Core calculation engine.
 *
 * Everything the app shows is derived from these functions, so when weight or
 * age changes the whole plan (calories, macros, portions, supplement doses,
 * training loads) recalculates rather than staying pinned to day-one numbers.
 */

export type Sex = 'male' | 'female'
export type Goal = 'recomp' | 'cut' | 'lean-bulk' | 'maintain'
export type ActivityKey = 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active'

export interface Profile {
  birthDate: string // ISO yyyy-mm-dd
  sex: Sex
  heightCm: number
  weightKg: number
  goal: Goal
  activity: ActivityKey
  liftDaysPerWeek: number
  cardioDaysPerWeek: number
}

export const ACTIVITY_FACTORS: Record<ActivityKey, { factor: number; label: string; hint: string }> = {
  sedentary: { factor: 1.2, label: 'Sedentary', hint: 'Desk job, no training' },
  light: { factor: 1.375, label: 'Light', hint: 'Training 1–3 days/week' },
  moderate: { factor: 1.55, label: 'Moderate', hint: 'Training 3–5 days/week' },
  active: { factor: 1.725, label: 'Active', hint: 'Training 6–7 days/week' },
  'very-active': { factor: 1.9, label: 'Very active', hint: 'Physical job + daily training' },
}

/** Exact age in years from a birth date. Drives the age-adjustment logic. */
export function ageFrom(birthDate: string, now = new Date()): number {
  const b = new Date(birthDate)
  if (Number.isNaN(b.getTime())) return 0
  let age = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--
  return Math.max(0, age)
}

/** Mifflin–St Jeor: the best-validated BMR equation for non-obese adults. */
export function bmr({ sex, weightKg, heightCm, age }: { sex: Sex; weightKg: number; heightCm: number; age: number }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return Math.round(sex === 'male' ? base + 5 : base - 161)
}

export function tdee(bmrValue: number, activity: ActivityKey) {
  return Math.round(bmrValue * ACTIVITY_FACTORS[activity].factor)
}

export function bmi(weightKg: number, heightCm: number) {
  const m = heightCm / 100
  return +(weightKg / (m * m)).toFixed(1)
}

/**
 * BMI bands here are the Asian-Pacific WHO cut-offs (overweight ≥23, obese ≥25),
 * which are lower than the European ones because cardiometabolic risk rises at a
 * lower BMI in Asian populations.
 */
export function bmiBand(value: number) {
  if (value < 18.5) return { label: 'Underweight', tone: 'warning' as const }
  if (value < 23) return { label: 'Healthy', tone: 'success' as const }
  if (value < 25) return { label: 'Overweight', tone: 'warning' as const }
  if (value < 30) return { label: 'Obese I', tone: 'destructive' as const }
  return { label: 'Obese II', tone: 'destructive' as const }
}

/** Deficit/surplus as a fraction of TDEE, by goal. */
export const GOAL_ADJUSTMENT: Record<Goal, { pct: number; label: string; blurb: string }> = {
  recomp: { pct: -0.12, label: 'Body recomposition', blurb: 'Small deficit — lose fat and build muscle together' },
  cut: { pct: -0.2, label: 'Fat loss', blurb: 'Larger deficit — faster fat loss, harder to add muscle' },
  'lean-bulk': { pct: 0.1, label: 'Lean bulk', blurb: 'Small surplus — prioritise muscle, accept some fat' },
  maintain: { pct: 0, label: 'Maintain', blurb: 'Hold weight, keep training' },
}

export interface MacroTargets {
  calories: number
  proteinG: number
  fatG: number
  carbG: number
  proteinKcal: number
  fatKcal: number
  carbKcal: number
  fibreG: number
  waterMl: number
}

/**
 * Protein scales with age: from ~40 the muscle-protein-synthesis response to a
 * given dose blunts (anabolic resistance), so the target per kg rises.
 */
export function proteinPerKg(goal: Goal, age: number) {
  let base = goal === 'cut' ? 2.2 : goal === 'recomp' ? 2.0 : 1.8
  if (age >= 40) base += 0.1
  if (age >= 50) base += 0.1
  if (age >= 60) base += 0.1
  return +base.toFixed(2)
}

export function macroTargets(profile: Profile, age: number): MacroTargets {
  const b = bmr({ sex: profile.sex, weightKg: profile.weightKg, heightCm: profile.heightCm, age })
  const maintenance = tdee(b, profile.activity)
  const calories = Math.round(maintenance * (1 + GOAL_ADJUSTMENT[profile.goal].pct))

  const proteinG = Math.round(profile.weightKg * proteinPerKg(profile.goal, age))
  // Fat floored at 0.8 g/kg — below that, testosterone and fat-soluble vitamin
  // absorption suffer, which matters more on a deficit.
  const fatG = Math.max(Math.round(profile.weightKg * 0.8), Math.round((calories * 0.25) / 9))
  const proteinKcal = proteinG * 4
  const fatKcal = fatG * 9
  const carbG = Math.max(0, Math.round((calories - proteinKcal - fatKcal) / 4))

  return {
    calories,
    proteinG,
    fatG,
    carbG,
    proteinKcal,
    fatKcal,
    carbKcal: carbG * 4,
    fibreG: Math.round((calories / 1000) * 14),
    waterMl: Math.round(profile.weightKg * 35 + profile.cardioDaysPerWeek * 60),
  }
}

/** Maintenance calories, for showing the deficit size alongside the target. */
export function maintenanceCalories(profile: Profile, age: number) {
  return tdee(bmr({ sex: profile.sex, weightKg: profile.weightKg, heightCm: profile.heightCm, age }), profile.activity)
}

/**
 * Split the day's macros across meals. Breakfast and dinner are cooked at home;
 * lunch is eaten out with colleagues so it gets the largest, least-controlled
 * share and a slightly lower protein weighting (restaurant food skews carb/fat).
 */
export const MEAL_SPLIT = [
  { slot: 'breakfast' as const, label: 'Breakfast', kcalShare: 0.25, proteinShare: 0.28 },
  { slot: 'lunch' as const, label: 'Lunch (eating out)', kcalShare: 0.4, proteinShare: 0.34 },
  { slot: 'dinner' as const, label: 'Dinner', kcalShare: 0.3, proteinShare: 0.32 },
  { slot: 'snack' as const, label: 'Snack / drink', kcalShare: 0.05, proteinShare: 0.06 },
]

export function mealTargets(m: MacroTargets) {
  return MEAL_SPLIT.map((s) => ({
    ...s,
    calories: Math.round(m.calories * s.kcalShare),
    proteinG: Math.round(m.proteinG * s.proteinShare),
  }))
}

/** Healthy weekly rate of change, expressed in kg, from bodyweight. */
export function weeklyRateTarget(profile: Profile) {
  const pct = profile.goal === 'cut' ? 0.0075 : profile.goal === 'recomp' ? 0.004 : profile.goal === 'lean-bulk' ? 0.0025 : 0
  return +(profile.weightKg * pct).toFixed(2)
}

/** Bodyweight at the top of the healthy Asian-BMI band — the natural goal weight. */
export function targetWeightRange(heightCm: number) {
  const m = heightCm / 100
  return { min: +(18.5 * m * m).toFixed(1), max: +(22.9 * m * m).toFixed(1) }
}
