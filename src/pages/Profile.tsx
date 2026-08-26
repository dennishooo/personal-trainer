import { usePlan } from '@/stores/profile'
import {
  ACTIVITY_FACTORS, GOAL_ADJUSTMENT, ageFrom, bmr, macroTargets, maintenanceCalories,
  proteinPerKg, type ActivityKey, type Goal,
} from '@/lib/nutrition'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const GOALS: Goal[] = ['recomp', 'cut', 'lean-bulk', 'maintain']
const ACTIVITIES: ActivityKey[] = ['sedentary', 'light', 'moderate', 'active', 'very-active']

export function ProfilePage() {
  const { profile, setProfile, setGoal, setActivity, weights, calorieOverride } = usePlan()
  const age = ageFrom(profile.birthDate)
  const basal = bmr({ sex: profile.sex, weightKg: profile.weightKg, heightCm: profile.heightCm, age })
  const maintenance = maintenanceCalories(profile, age)
  const targets = macroTargets(profile, age)

  function exportData() {
    const blob = new Blob([JSON.stringify({ profile, weights }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `personal-plan-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Profile & goal</h1>
        <p className="text-sm text-muted-foreground">
          Everything in the app derives from these. Change one and the whole plan recalculates.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>You</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Date of birth" hint={`Currently ${age} years old`}>
            <input
              type="date"
              value={profile.birthDate}
              onChange={(e) => setProfile({ birthDate: e.target.value })}
              className={inputCls}
            />
          </Field>

          <Field label="Height" hint="cm">
            <input
              type="number"
              min={120}
              max={230}
              value={profile.heightCm}
              onChange={(e) => setProfile({ heightCm: +e.target.value })}
              className={inputCls}
            />
          </Field>

          <Field label="Current weight" hint="kg — also logs to your trend">
            <input
              type="number"
              step="0.1"
              min={30}
              max={250}
              value={profile.weightKg}
              onChange={(e) => setProfile({ weightKg: +e.target.value })}
              className={inputCls}
            />
          </Field>

          <Field label="Sex" hint="Used by the BMR equation">
            <div className="flex gap-2">
              {(['male', 'female'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setProfile({ sex: s })}
                  className={cn(
                    'h-9 flex-1 rounded-lg border text-sm font-medium capitalize transition-colors',
                    profile.sex === s ? 'border-primary bg-accent text-accent-foreground' : 'border-border hover:bg-secondary',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Goal</CardTitle>
          <CardDescription>Changing this clears any calorie adjustment you have accepted.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {GOALS.map((g) => (
            <button
              key={g}
              onClick={() => setGoal(g)}
              className={cn(
                'rounded-lg border p-3 text-left transition-colors',
                profile.goal === g ? 'border-primary bg-accent' : 'border-border hover:bg-secondary',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{GOAL_ADJUSTMENT[g].label}</span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {GOAL_ADJUSTMENT[g].pct > 0 ? '+' : ''}
                  {Math.round(GOAL_ADJUSTMENT[g].pct * 100)}%
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{GOAL_ADJUSTMENT[g].blurb}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity level</CardTitle>
          <CardDescription>
            Be honest here — overstating it is the most common reason a plan stops working.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {ACTIVITIES.map((a) => (
            <button
              key={a}
              onClick={() => setActivity(a)}
              className={cn(
                'flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors',
                profile.activity === a ? 'border-primary bg-accent' : 'border-border hover:bg-secondary',
              )}
            >
              <span>
                <span className="text-sm font-medium">{ACTIVITY_FACTORS[a].label}</span>
                <span className="block text-xs text-muted-foreground">{ACTIVITY_FACTORS[a].hint}</span>
              </span>
              <span className="text-sm tabular-nums text-muted-foreground">×{ACTIVITY_FACTORS[a].factor}</span>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* ── Show the working ── */}
      <Card>
        <CardHeader>
          <CardTitle>How your numbers are calculated</CardTitle>
          <CardDescription>No black box — here is every step.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="BMR (Mifflin–St Jeor)" value={`${basal} kcal`} note={`10×${profile.weightKg} + 6.25×${profile.heightCm} − 5×${age} + 5`} />
          <Row label={`× activity (${ACTIVITY_FACTORS[profile.activity].label})`} value={`${maintenance} kcal`} note="Maintenance — what you burn on an average day" />
          <Row
            label={`${GOAL_ADJUSTMENT[profile.goal].pct > 0 ? '+' : ''}${Math.round(GOAL_ADJUSTMENT[profile.goal].pct * 100)}% for ${GOAL_ADJUSTMENT[profile.goal].label.toLowerCase()}`}
            value={`${targets.calories} kcal`}
            note="Your daily target"
          />
          {calorieOverride !== 0 && (
            <Row
              label="Trend adjustment you accepted"
              value={`${targets.calories + calorieOverride} kcal`}
              note={`${calorieOverride > 0 ? '+' : ''}${calorieOverride} kcal from your logged progress`}
            />
          )}
          <Row
            label={`Protein at ${proteinPerKg(profile.goal, age)} g/kg`}
            value={`${targets.proteinG} g`}
            note={age >= 40 ? 'Raised for age — protein needs rise after 40' : 'Standard for your age'}
          />
          <Row label="Fat" value={`${targets.fatG} g`} note="Higher of 25% of calories or 0.8 g/kg" />
          <Row label="Carbs" value={`${targets.carbG} g`} note="Whatever calories remain" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your data</CardTitle>
          <CardDescription>
            Everything is stored in this browser only — nothing is sent anywhere. Clearing site data
            wipes it, so export if you care about the history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" onClick={exportData}>
            Export as JSON
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

const inputCls =
  'h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  )
}

function Row({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border pb-2 last:border-0">
      <span>
        <span className="font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">{note}</span>
      </span>
      <span className="shrink-0 font-semibold tabular-nums">{value}</span>
    </div>
  )
}
