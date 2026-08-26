import { useMemo } from 'react'
import { Activity, Flame, Scale, TrendingDown, Droplets, Wheat } from 'lucide-react'
import { usePlan } from '@/stores/profile'
import {
  ageFrom, bmi, bmiBand, macroTargets, maintenanceCalories, mealTargets,
  targetWeightRange, GOAL_ADJUSTMENT,
} from '@/lib/nutrition'
import { evaluatePlan, suggestGoalChange, ewma } from '@/lib/adjust'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { StatTile } from '@/components/StatTile'
import { MacroRing } from '@/components/illustrations/MacroRing'
import { BodyFigure } from '@/components/illustrations/BodyFigure'
import { WeightChart } from '@/components/WeightChart'

const VERDICT_TONE = {
  'on-track': 'success',
  'too-fast': 'warning',
  'too-slow': 'warning',
  'wrong-way': 'destructive',
  'insufficient-data': 'outline',
} as const

export function Dashboard() {
  const { profile, weights, calorieOverride, applyCalorieDelta, resetOverride, setGoal } = usePlan()

  const age = ageFrom(profile.birthDate)
  const bmiValue = bmi(profile.weightKg, profile.heightCm)
  const band = bmiBand(bmiValue)
  const base = useMemo(() => macroTargets(profile, age), [profile, age])
  const maintenance = maintenanceCalories(profile, age)
  const range = targetWeightRange(profile.heightCm)

  // The override folds the accepted adjustment into every derived number.
  const targets = useMemo(() => {
    if (!calorieOverride) return base
    const calories = base.calories + calorieOverride
    const carbG = Math.max(0, Math.round((calories - base.proteinKcal - base.fatKcal) / 4))
    return { ...base, calories, carbG, carbKcal: carbG * 4 }
  }, [base, calorieOverride])

  const verdict = useMemo(() => evaluatePlan(profile, weights), [profile, weights])
  const goalHint = suggestGoalChange(profile, bmiValue)
  const smoothed = useMemo(() => ewma(weights), [weights])
  const trendWeight = smoothed.length ? smoothed[smoothed.length - 1].value : profile.weightKg
  const meals = mealTargets(targets)

  const startWeight = weights.length ? weights[0].weightKg : profile.weightKg
  const lost = +(startWeight - profile.weightKg).toFixed(1)
  const toGoal = +(profile.weightKg - range.max).toFixed(1)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Today</h1>
        <p className="text-sm text-muted-foreground">
          {age} years old · {profile.heightCm} cm · {GOAL_ADJUSTMENT[profile.goal].label}
        </p>
      </header>

      {/* ── The verdict from the adjustment engine ── */}
      <Card className={verdict.kind === 'on-track' ? 'border-[var(--success)]/40' : verdict.kind === 'wrong-way' ? 'border-destructive/40' : ''}>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{verdict.headline}</CardTitle>
            <Badge tone={VERDICT_TONE[verdict.kind]}>
              {verdict.trendKgPerWeek === null
                ? 'no trend yet'
                : `${verdict.trendKgPerWeek >= 0 ? '+' : ''}${verdict.trendKgPerWeek.toFixed(2)} kg/week`}
            </Badge>
          </div>
          <CardDescription>{verdict.detail}</CardDescription>
        </CardHeader>
        {(verdict.calorieDelta !== 0 || calorieOverride !== 0) && (
          <CardContent className="flex flex-wrap items-center gap-2">
            {verdict.calorieDelta !== 0 && (
              <Button size="sm" onClick={() => applyCalorieDelta(verdict.calorieDelta)}>
                Apply {verdict.calorieDelta > 0 ? '+' : ''}
                {verdict.calorieDelta} kcal
              </Button>
            )}
            {calorieOverride !== 0 && (
              <>
                <Badge tone="primary">
                  Adjustment in effect: {calorieOverride > 0 ? '+' : ''}
                  {calorieOverride} kcal
                </Badge>
                <Button size="sm" variant="ghost" onClick={resetOverride}>
                  Reset
                </Button>
              </>
            )}
          </CardContent>
        )}
      </Card>

      {goalHint && (
        <Card className="border-primary/40 bg-accent/40">
          <CardHeader>
            <CardTitle className="text-sm">Time to change goal</CardTitle>
            <CardDescription>{goalHint.reason}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="sm" variant="outline" onClick={() => setGoal(goalHint.goal)}>
              Switch to {GOAL_ADJUSTMENT[goalHint.goal].label}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Headline numbers ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Weight"
          value={profile.weightKg.toFixed(1)}
          unit="kg"
          icon={<Scale size={15} />}
          sub={`Trend ${trendWeight.toFixed(1)} kg${lost > 0 ? ` · down ${lost} kg` : ''}`}
        />
        <StatTile
          label="BMI"
          value={bmiValue}
          icon={<Activity size={15} />}
          tone={band.tone}
          sub={`${band.label} · Asian cut-offs`}
        />
        <StatTile
          label="Daily target"
          value={targets.calories}
          unit="kcal"
          icon={<Flame size={15} />}
          sub={`${maintenance - targets.calories > 0 ? '−' : '+'}${Math.abs(maintenance - targets.calories)} vs maintenance`}
        />
        <StatTile
          label="To goal weight"
          value={toGoal > 0 ? toGoal.toFixed(1) : 'Reached'}
          unit={toGoal > 0 ? 'kg' : undefined}
          icon={<TrendingDown size={15} />}
          sub={`Healthy range ${range.min}–${range.max} kg`}
        />
      </div>

      {/* ── Macros and body ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daily macros</CardTitle>
            <CardDescription>
              Recalculated from your weight, age and goal every time any of them changes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 sm:flex-row">
            <MacroRing
              protein={targets.proteinKcal}
              carb={targets.carbKcal}
              fat={targets.fatKcal}
              calories={targets.calories}
            />
            <div className="w-full space-y-4">
              <MacroRow label="Protein" grams={targets.proteinG} kcal={targets.proteinKcal} total={targets.calories} color="var(--protein)" note={`${(targets.proteinG / profile.weightKg).toFixed(1)} g per kg`} />
              <MacroRow label="Carbs" grams={targets.carbG} kcal={targets.carbKcal} total={targets.calories} color="var(--carb)" note="Fuel for training" />
              <MacroRow label="Fat" grams={targets.fatG} kcal={targets.fatKcal} total={targets.calories} color="var(--fat)" note="Floored at 0.8 g/kg" />
              <div className="flex gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Wheat size={13} /> Fibre {targets.fibreG} g
                </span>
                <span className="flex items-center gap-1">
                  <Droplets size={13} /> Water {(targets.waterMl / 1000).toFixed(1)} L
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Where you are</CardTitle>
            <CardDescription>{band.label} · BMI {bmiValue}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <BodyFigure bmi={bmiValue} size={130} />
            <div className="mt-3 w-full">
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>{range.min} kg</span>
                <span>Healthy band</span>
                <span>{range.max} kg</span>
              </div>
              <div className="relative h-2 rounded-full bg-gradient-to-r from-[var(--warning)] via-[var(--success)] to-[var(--destructive)] opacity-60">
                <div
                  className="absolute -top-1 h-4 w-1 rounded-full bg-foreground transition-[left] duration-500"
                  style={{ left: `${Math.max(0, Math.min(100, ((bmiValue - 17) / 15) * 100))}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Meal split ── */}
      <Card>
        <CardHeader>
          <CardTitle>How the day splits</CardTitle>
          <CardDescription>
            Lunch takes the biggest share because it is the meal you eat out and control least.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {meals.map((m) => (
            <div key={m.slot} className="rounded-lg border border-border p-3">
              <div className="text-sm font-medium">{m.label}</div>
              <div className="mt-1 text-xl font-bold tabular-nums">{m.calories}</div>
              <div className="text-xs text-muted-foreground">kcal · {m.proteinG} g protein</div>
              <Progress value={m.kcalShare * 100} className="mt-2 h-1.5" />
            </div>
          ))}
        </CardContent>
      </Card>

      <WeightChart />
    </div>
  )
}

function MacroRow({
  label, grams, kcal, total, color, note,
}: {
  label: string; grams: number; kcal: number; total: number; color: string; note: string
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="flex items-center gap-2 font-medium">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
          {label}
        </span>
        <span className="tabular-nums">
          <strong>{grams} g</strong>{' '}
          <span className="text-muted-foreground">· {Math.round((kcal / total) * 100)}%</span>
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${(kcal / total) * 100}%`, background: color }}
        />
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{note}</div>
    </div>
  )
}
