import { useMemo, useState } from 'react'
import { Clock, Star, ChefHat, Search, Utensils } from 'lucide-react'
import { usePlan } from '@/stores/profile'
import {
  RECIPES, CUISINE_LABELS, SLOT_LABELS, scaleAmount, scaleMacros,
  type Recipe, type Slot, type Cuisine,
} from '@/data/meals'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PlateModel } from '@/components/illustrations/PlateModel'
import { HandPortion } from '@/components/illustrations/HandPortion'
import { cn } from '@/lib/utils'

const SLOTS: Slot[] = ['breakfast', 'lunch-out', 'dinner', 'snack']

export function Meals() {
  const { profile, favourites, toggleFavourite } = usePlan()
  const [slot, setSlot] = useState<Slot>('breakfast')
  const [cuisine, setCuisine] = useState<Cuisine | 'all'>('all')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<string | null>(null)

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return RECIPES.filter(
      (r) =>
        r.slot === slot &&
        (cuisine === 'all' || r.cuisine === cuisine) &&
        (!q ||
          r.name.toLowerCase().includes(q) ||
          r.chinese?.includes(query.trim()) ||
          r.tags.some((t) => t.includes(q))),
    )
  }, [slot, cuisine, query])

  const cuisines = useMemo(
    () => Array.from(new Set(RECIPES.filter((r) => r.slot === slot).map((r) => r.cuisine))),
    [slot],
  )

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Meals</h1>
        <p className="text-sm text-muted-foreground">
          Portions scale to your current {profile.weightKg.toFixed(1)} kg. Cook breakfast and dinner;
          lunch is a guide to ordering well.
        </p>
      </header>

      {/* ── Portioning reference ── */}
      <Card>
        <CardHeader>
          <CardTitle>Portioning without a scale</CardTitle>
          <CardDescription>
            For lunches out, where weighing food is not an option. Your hand scales with your body,
            so it travels with you.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
          <PlateModel size={190} />
          <div className="w-full flex-1">
            <HandPortion />
            <p className="mt-3 text-xs text-muted-foreground">
              At a cha chaan teng: one palm of protein, one cupped hand of rice (say 少飯), and fill
              the rest with greens. That lands close enough to your targets without any counting.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Filters ── */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {SLOTS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setSlot(s)
                setCuisine('all')
              }}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                slot === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent',
              )}
            >
              {SLOT_LABELS[s]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search meals…"
              className="h-8 w-48 rounded-lg border border-input bg-background pr-3 pl-8 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>
          <button
            onClick={() => setCuisine('all')}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              cuisine === 'all' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-secondary',
            )}
          >
            All
          </button>
          {cuisines.map((c) => (
            <button
              key={c}
              onClick={() => setCuisine(c)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                cuisine === c ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-secondary',
              )}
            >
              {CUISINE_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Recipe grid ── */}
      <div className="grid gap-4 md:grid-cols-2">
        {shown.map((r) => (
          <RecipeCard
            key={r.id}
            recipe={r}
            weightKg={profile.weightKg}
            expanded={open === r.id}
            onToggle={() => setOpen(open === r.id ? null : r.id)}
            starred={favourites.includes(r.id)}
            onStar={() => toggleFavourite(r.id)}
          />
        ))}
      </div>

      {shown.length === 0 && (
        <p className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          Nothing matches that filter.
        </p>
      )}
    </div>
  )
}

function RecipeCard({
  recipe, weightKg, expanded, onToggle, starred, onStar,
}: {
  recipe: Recipe
  weightKg: number
  expanded: boolean
  onToggle: () => void
  starred: boolean
  onStar: () => void
}) {
  const m = scaleMacros(recipe, weightKg)
  const isOut = recipe.slot === 'lunch-out'

  return (
    <Card className={cn('overflow-hidden transition-shadow', expanded && 'ring-1 ring-primary/30')}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="flex flex-wrap items-center gap-2">
              {recipe.name}
              {recipe.chinese && <span className="text-sm font-normal text-muted-foreground">{recipe.chinese}</span>}
            </CardTitle>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge tone="outline">{CUISINE_LABELS[recipe.cuisine]}</Badge>
              {!isOut && (
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {recipe.prepMin + recipe.cookMin} min
                </span>
              )}
              {recipe.batch && <Badge tone="primary">batch</Badge>}
            </div>
          </div>
          <button
            onClick={onStar}
            aria-label={starred ? 'Remove from favourites' : 'Save to favourites'}
            className={cn('shrink-0 transition-colors', starred ? 'text-[var(--warning)]' : 'text-muted-foreground hover:text-foreground')}
          >
            <Star size={17} fill={starred ? 'currentColor' : 'none'} />
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-4 gap-2 text-center">
          <MacroChip label="kcal" value={m.kcal} />
          <MacroChip label="protein" value={`${m.proteinG}g`} color="var(--protein)" />
          <MacroChip label="carbs" value={`${m.carbG}g`} color="var(--carb)" />
          <MacroChip label="fat" value={`${m.fatG}g`} color="var(--fat)" />
        </div>

        <Button variant="outline" size="sm" className="w-full" onClick={onToggle}>
          {expanded ? 'Hide' : isOut ? 'Ordering guide' : 'Ingredients & steps'}
        </Button>

        {expanded && (
          <div className="space-y-4 border-t border-border pt-3">
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
                <Utensils size={13} /> {isOut ? 'What to order' : 'Ingredients'}
              </h4>
              <ul className="space-y-1.5 text-sm">
                {recipe.ingredients.map((ing) => (
                  <li key={ing.name} className="flex justify-between gap-3 border-b border-border/50 pb-1 last:border-0">
                    <span>
                      {ing.name}
                      {ing.chinese && <span className="ml-1.5 text-xs text-muted-foreground">{ing.chinese}</span>}
                      {ing.note && <span className="block text-xs text-muted-foreground italic">{ing.note}</span>}
                    </span>
                    <span className="shrink-0 text-right text-sm font-medium tabular-nums">
                      {scaleAmount(ing, weightKg)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
                <ChefHat size={13} /> {isOut ? 'How to order' : 'Steps'}
              </h4>
              <ol className="space-y-2 text-sm">
                {recipe.steps.map((s, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{s}</span>
                  </li>
                ))}
              </ol>
            </div>

            {recipe.tip && (
              <div className="rounded-lg border-l-2 border-primary bg-accent/40 px-3 py-2 text-sm">
                <strong className="text-xs tracking-wide uppercase">Tip</strong>
                <p className="mt-0.5 leading-relaxed">{recipe.tip}</p>
              </div>
            )}
            {recipe.batch && (
              <p className="text-xs text-muted-foreground">
                <strong>Batching:</strong> {recipe.batch}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MacroChip({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="rounded-lg bg-secondary px-2 py-1.5">
      <div className="text-sm font-bold tabular-nums" style={color ? { color } : undefined}>
        {value}
      </div>
      <div className="text-[10px] tracking-wide text-muted-foreground uppercase">{label}</div>
    </div>
  )
}
