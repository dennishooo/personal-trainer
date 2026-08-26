import { useMemo } from 'react'
import { ShoppingBasket, CalendarDays } from 'lucide-react'
import { usePlan } from '@/stores/profile'
import { RECIPES, scaleAmount, scaleMacros, type Recipe } from '@/data/meals'
import { PROGRAM } from '@/data/training'
import { ageFrom, macroTargets } from '@/lib/nutrition'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/**
 * A deterministic week. Picking by index rather than at random means the plan is
 * stable across reloads — you can shop for it on Sunday and it still matches on
 * Wednesday.
 */
function buildWeek(favourites: string[]) {
  const pick = (slot: Recipe['slot']) => {
    const all = RECIPES.filter((r) => r.slot === slot)
    const starred = all.filter((r) => favourites.includes(r.id))
    // Favourites float to the front, but the rest still fill the week out.
    return [...starred, ...all.filter((r) => !favourites.includes(r.id))]
  }

  const breakfasts = pick('breakfast')
  const dinners = pick('dinner')
  const lunches = pick('lunch-out')

  return DAYS.map((day, i) => ({
    day,
    breakfast: breakfasts[i % breakfasts.length],
    lunch: lunches[i % lunches.length],
    dinner: dinners[i % dinners.length],
    training: PROGRAM[i],
  }))
}

export function Week() {
  const { profile, favourites } = usePlan()
  const age = ageFrom(profile.birthDate)
  const targets = macroTargets(profile, age)
  const week = useMemo(() => buildWeek(favourites), [favourites])

  /** Roll every cooked ingredient up into one shopping list. */
  const shopping = useMemo(() => {
    const map = new Map<string, { name: string; chinese?: string; amounts: string[] }>()
    for (const d of week) {
      for (const r of [d.breakfast, d.dinner]) {
        for (const ing of r.ingredients) {
          const key = ing.name.toLowerCase()
          const entry = map.get(key) ?? { name: ing.name, chinese: ing.chinese, amounts: [] }
          entry.amounts.push(scaleAmount(ing, profile.weightKg))
          map.set(key, entry)
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [week, profile.weightKg])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Your week</h1>
        <p className="text-sm text-muted-foreground">
          A full seven days of meals and training. Star meals on the Meals page and they move to the
          front of the rotation.
        </p>
      </header>

      <div className="grid gap-3 lg:grid-cols-2">
        {week.map((d) => {
          const b = scaleMacros(d.breakfast, profile.weightKg)
          const l = scaleMacros(d.lunch, profile.weightKg)
          const n = scaleMacros(d.dinner, profile.weightKg)
          const total = b.kcal + l.kcal + n.kcal
          const protein = b.proteinG + l.proteinG + n.proteinG
          const over = total > targets.calories * 1.08

          return (
            <Card key={d.day}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays size={15} /> {d.day}
                  </CardTitle>
                  <Badge tone={d.training.type === 'lift' ? 'primary' : d.training.type === 'cardio' ? 'default' : 'outline'}>
                    {d.training.name}
                  </Badge>
                </div>
                <CardDescription className={cn(over && 'text-[var(--warning)]')}>
                  ~{total} kcal · {protein} g protein · target {targets.calories} kcal / {targets.proteinG} g
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1.5 text-sm">
                <MealLine slot="Breakfast" r={d.breakfast} kcal={b.kcal} protein={b.proteinG} />
                <MealLine slot="Lunch" r={d.lunch} kcal={l.kcal} protein={l.proteinG} out />
                <MealLine slot="Dinner" r={d.dinner} kcal={n.kcal} protein={n.proteinG} />
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBasket size={16} /> Shopping list
          </CardTitle>
          <CardDescription>
            Everything for the week's breakfasts and dinners, scaled to {profile.weightKg.toFixed(1)} kg.
            Lunches are eaten out, so they are not here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            {shopping.map((s) => (
              <li key={s.name} className="flex justify-between gap-3 border-b border-border/50 pb-1">
                <span>
                  {s.name}
                  {s.chinese && <span className="ml-1.5 text-xs text-muted-foreground">{s.chinese}</span>}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">×{s.amounts.length}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Batch on Sunday: cook a pot of brown rice, blanch the vegetables for bibimbap, poach a
            double batch of white-cut chicken, and build three jars of overnight oats. That covers
            most of the week's prep in about an hour.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function MealLine({
  slot, r, kcal, protein, out,
}: {
  slot: string; r: Recipe; kcal: number; protein: number; out?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/50 pb-1.5 last:border-0">
      <span className="min-w-0">
        <span className="text-xs text-muted-foreground">{slot}</span>
        <span className="block truncate">
          {r.name}
          {out && <span className="ml-1.5 text-xs text-muted-foreground">(out)</span>}
        </span>
      </span>
      <span className="shrink-0 text-right text-xs tabular-nums text-muted-foreground">
        {kcal} kcal
        <span className="block" style={{ color: 'var(--protein)' }}>
          {protein} g P
        </span>
      </span>
    </div>
  )
}
