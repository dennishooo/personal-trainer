import { useMemo, useState } from 'react'
import { Search, Plus, X, ChevronLeft, ChevronRight, Lightbulb, Trash2, Pencil, Copy } from 'lucide-react'
import { Icon } from '@/components/icons'
import { usePlan } from '@/stores/profile'
import { useDishLog } from '@/stores/dish-log'
import { useCustomDishes } from '@/stores/custom-dishes'
import { useUi } from '@/stores/ui'
import { DISH_CUISINE_LABELS, type Dish, type DishCuisine, type DishVerdict } from '@/data/dishes'
import {
  entriesForDate, filterDishes, LOG_PORTION_STEPS, proteinDensity, remainingFrom,
  scaleEntry, SODIUM_LIMIT_MG, suggestDishes, todayISO, totalsForDay, VERDICT_LABELS,
} from '@/lib/dish-log'
import {
  allDishes, datesUsingDish, draftFromDish, EMPTY_DRAFT, isCustomDish, type DishDraft,
} from '@/lib/custom-dish'
import { adjustedTargets, ageFrom, macroTargets } from '@/lib/nutrition'
import { DishForm } from '@/components/DishForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

const CUISINES = Object.keys(DISH_CUISINE_LABELS) as DishCuisine[]
const VERDICTS: DishVerdict[] = ['green', 'amber', 'red']

const VERDICT_TONE: Record<DishVerdict, 'success' | 'warning' | 'destructive'> = {
  green: 'success',
  amber: 'warning',
  red: 'destructive',
}

const VERDICT_COLOR: Record<DishVerdict, string> = {
  green: 'var(--success)',
  amber: 'var(--warning)',
  red: 'var(--destructive)',
}

/** Shifts an ISO date by whole days without tripping over month ends. */
function shiftDate(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + days)
  return todayISO(d)
}

function formatDate(iso: string): string {
  if (iso === todayISO()) return 'Today'
  if (iso === shiftDate(todayISO(), -1)) return 'Yesterday'
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

export function EatingOut() {
  const { profile, calorieOverride } = usePlan()
  const { entries, viewDate, logDish, setPortions, removeEntry, clearDate, setViewDate } = useDishLog()
  const { dishes: customDishes, addDish, updateDish, deleteDish } = useCustomDishes()
  const { query, cuisine, verdict } = useUi((s) => s.dishes)
  const setDishes = useUi((s) => s.setDishes)

  // null = closed. An editor keyed by dish id edits it in place; 'new' adds one.
  const [editor, setEditor] = useState<{ id: string | 'new'; draft: DishDraft } | null>(null)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)

  const dishes = useMemo(() => allDishes(customDishes), [customDishes])

  const targets = useMemo(
    () => adjustedTargets(macroTargets(profile, ageFrom(profile.birthDate)), calorieOverride),
    [profile, calorieOverride],
  )

  const logged = useMemo(() => entriesForDate(entries, dishes, viewDate), [entries, dishes, viewDate])
  const totals = useMemo(() => totalsForDay(logged), [logged])
  const left = useMemo(() => remainingFrom(totals, targets), [totals, targets])

  const shown = useMemo(() => filterDishes(dishes, { query, cuisine, verdict }), [dishes, query, cuisine, verdict])
  const suggestions = useMemo(
    () => (logged.length > 0 ? suggestDishes(dishes, left.kcal) : []),
    [dishes, logged.length, left.kcal],
  )

  const isToday = viewDate === todayISO()

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Eating out</h1>
          <p className="text-sm text-muted-foreground">
            What a plate actually costs you, as it lands on the table — oil, sauce and sugar included.
            Tap a dish to add it to the day.
          </p>
        </div>
        <Button
          className="shrink-0"
          onClick={() => setEditor({ id: 'new', draft: EMPTY_DRAFT })}
        >
          <Plus size={15} /> Add dish
        </Button>
      </header>

      {editor && (
        <Card>
          <CardHeader>
            <CardTitle>{editor.id === 'new' ? 'Add a dish' : 'Edit dish'}</CardTitle>
            <CardDescription>
              Quote one ordered portion as it reaches the table — the oil and sauce included, not
              the raw ingredients.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DishForm
              initial={editor.draft}
              submitLabel={editor.id === 'new' ? 'Add dish' : 'Save changes'}
              onCancel={() => setEditor(null)}
              onSubmit={(draft) => {
                if (editor.id === 'new') addDish(draft)
                else updateDish(editor.id, draft)
                setEditor(null)
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* ── The day ── */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle>{formatDate(viewDate)}</CardTitle>
              <CardDescription>
                {logged.length === 0
                  ? 'Nothing logged yet.'
                  : `${logged.length} ${logged.length === 1 ? 'dish' : 'dishes'} · HK$${Math.round(totals.costHKD)}`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost" size="icon" aria-label="Previous day"
                onClick={() => setViewDate(shiftDate(viewDate, -1))}
              >
                <ChevronLeft size={16} />
              </Button>
              {!isToday && (
                <Button variant="outline" size="sm" onClick={() => setViewDate(todayISO())}>
                  Today
                </Button>
              )}
              <Button
                variant="ghost" size="icon" aria-label="Next day"
                disabled={isToday}
                onClick={() => setViewDate(shiftDate(viewDate, 1))}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <DayBar label="Calories" eaten={totals.kcal} target={targets.calories} unit="" />
            <DayBar label="Protein" eaten={totals.proteinG} target={targets.proteinG} unit="g" color="var(--protein)" />
            <DayBar label="Carbs" eaten={totals.carbG} target={targets.carbG} unit="g" color="var(--carb)" />
            <DayBar label="Fat" eaten={totals.fatG} target={targets.fatG} unit="g" color="var(--fat)" />
          </div>

          {logged.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge tone={left.kcal < 0 ? 'destructive' : 'success'}>
                {left.kcal < 0 ? `${Math.abs(left.kcal)} kcal over` : `${left.kcal} kcal left`}
              </Badge>
              <Badge tone={left.proteinG > 0 ? 'warning' : 'success'}>
                {left.proteinG > 0 ? `${left.proteinG} g protein short` : 'protein met'}
              </Badge>
              <Badge tone={totals.sodiumMg > SODIUM_LIMIT_MG ? 'destructive' : 'outline'}>
                sodium {(totals.sodiumMg / 1000).toFixed(1)} g / {SODIUM_LIMIT_MG / 1000} g
              </Badge>
            </div>
          )}

          {logged.length > 0 && (
            <ul className="space-y-2">
              {logged.map((e) => {
                const m = scaleEntry(e)
                return (
                  <li key={e.entryId} className="flex items-center gap-3 rounded-lg bg-secondary/60 px-3 py-2">
                    <Icon name={e.dish.icon} size={18} className="shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">
                        {e.dish.name}
                        {e.dish.chinese && <span className="ml-1.5 text-xs text-muted-foreground">{e.dish.chinese}</span>}
                      </div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        {m.kcal} kcal · P {m.proteinG} · C {m.carbG} · F {m.fatG}
                      </div>
                    </div>
                    <select
                      aria-label={`Portions of ${e.dish.name}`}
                      value={e.portions}
                      onChange={(ev) => setPortions(e.entryId, Number(ev.target.value))}
                      className="h-7 rounded-md border border-input bg-background px-1.5 text-xs tabular-nums focus:ring-2 focus:ring-ring focus:outline-none"
                    >
                      {LOG_PORTION_STEPS.map((p) => (
                        <option key={p} value={p}>{p}×</option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeEntry(e.entryId)}
                      aria-label={`Remove ${e.dish.name}`}
                      className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <X size={15} />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {logged.length > 0 && (
            <button
              onClick={() => clearDate(viewDate)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 size={13} /> Clear this day
            </button>
          )}
        </CardContent>
      </Card>

      {/* ── What to order next ── */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Lightbulb size={15} /> Best next order
            </CardTitle>
            <CardDescription>
              Most protein that still fits your remaining {Math.max(0, left.kcal)} kcal.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-3">
            {suggestions.map((d) => (
              <button
                key={d.id}
                onClick={() => logDish(d.id)}
                className="rounded-lg border border-border px-3 py-2 text-left transition-colors hover:bg-secondary"
              >
                <div className="truncate text-sm font-medium">{d.name}</div>
                <div className="text-xs text-muted-foreground tabular-nums">
                  {d.kcal} kcal · {d.proteinG} g protein
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Filters ── */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setDishes({ query: e.target.value })}
              placeholder="Search dishes… 乾炒牛河"
              className="h-8 w-56 rounded-lg border border-input bg-background pr-3 pl-8 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>
          {VERDICTS.map((v) => (
            <button
              key={v}
              onClick={() => setDishes({ verdict: verdict === v ? 'all' : v })}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                verdict === v ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-secondary',
              )}
            >
              <span
                className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle"
                style={{ background: VERDICT_COLOR[v] }}
              />
              {VERDICT_LABELS[v]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDishes({ cuisine: 'all' })}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              cuisine === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent',
            )}
          >
            All
          </button>
          {CUISINES.map((c) => (
            <button
              key={c}
              onClick={() => setDishes({ cuisine: c })}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                cuisine === c ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent',
              )}
            >
              {DISH_CUISINE_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Dish grid ── */}
      <div className="grid gap-3 md:grid-cols-2">
        {shown.map((d) => (
          <DishCard
            key={d.id}
            dish={d}
            onLog={() => logDish(d.id)}
            onEdit={isCustomDish(d) ? () => setEditor({ id: d.id, draft: draftFromDish(d) }) : undefined}
            onDuplicate={() => setEditor({ id: 'new', draft: { ...draftFromDish(d), name: `${d.name} (copy)` } })}
            onDelete={isCustomDish(d) ? () => setPendingDelete(d.id) : undefined}
            deleting={pendingDelete === d.id}
            usedOn={pendingDelete === d.id ? datesUsingDish(entries, d.id) : []}
            onCancelDelete={() => setPendingDelete(null)}
            onConfirmDelete={() => {
              deleteDish(d.id)
              setPendingDelete(null)
            }}
          />
        ))}
      </div>

      {shown.length === 0 && (
        <p className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          No dish matches that filter.
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Figures are typical restaurant portions from HK Centre for Food Safety data and published
        menus — treat them as ±15%. Two branches of the same shop vary more than that.
      </p>
    </div>
  )
}

function DayBar({
  label, eaten, target, unit, color,
}: {
  label: string
  eaten: number
  target: number
  unit: string
  color?: string
}) {
  return (
    <div className="rounded-lg bg-secondary/60 px-3 py-2">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] tracking-wide text-muted-foreground uppercase">{label}</span>
        <span className="text-xs text-muted-foreground tabular-nums">{target}{unit}</span>
      </div>
      <div className="text-lg font-bold tabular-nums" style={color ? { color } : undefined}>
        {eaten}{unit}
      </div>
      <Progress
        value={eaten}
        max={target || 1}
        className="mt-1 h-1.5 bg-background"
        barClassName={eaten > target ? 'bg-destructive' : undefined}
      />
    </div>
  )
}

function DishCard({
  dish, onLog, onEdit, onDuplicate, onDelete, deleting, usedOn, onCancelDelete, onConfirmDelete,
}: {
  dish: Dish
  onLog: () => void
  onEdit?: () => void
  onDuplicate: () => void
  onDelete?: () => void
  deleting: boolean
  usedOn: string[]
  onCancelDelete: () => void
  onConfirmDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const density = proteinDensity(dish)
  const mine = isCustomDish(dish)

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-2.5 p-4">
        <div className="flex items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
            style={{ background: `color-mix(in oklch, ${VERDICT_COLOR[dish.verdict]} 15%, transparent)`, color: VERDICT_COLOR[dish.verdict] }}
          >
            <Icon name={dish.icon} size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="text-sm font-semibold">{dish.name}</span>
              {dish.chinese && <span className="text-xs text-muted-foreground">{dish.chinese}</span>}
              {mine && <Badge tone="outline">yours</Badge>}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {dish.servingNote}
              {dish.priceHKD !== undefined && ` · ~HK$${dish.priceHKD}`}
            </div>
          </div>
          <Button size="sm" className="shrink-0" onClick={onLog}>
            <Plus size={14} /> Log
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-center">
          <Stat value={dish.kcal} label="kcal" />
          <Stat value={`${dish.proteinG}g`} label="protein" color="var(--protein)" />
          <Stat value={`${dish.carbG}g`} label="carbs" color="var(--carb)" />
          <Stat value={`${dish.fatG}g`} label="fat" color="var(--fat)" />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone={VERDICT_TONE[dish.verdict]}>{VERDICT_LABELS[dish.verdict]}</Badge>
          <Badge tone="outline">{density} g protein / 100 kcal</Badge>
          {dish.sodiumMg > SODIUM_LIMIT_MG && (
            <Badge tone="destructive">{(dish.sodiumMg / 1000).toFixed(1)} g sodium</Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {onEdit && (
            <button onClick={onEdit} className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground">
              <Pencil size={12} /> Edit
            </button>
          )}
          <button onClick={onDuplicate} className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground">
            <Copy size={12} /> Duplicate
          </button>
          {onDelete && (
            <button onClick={onDelete} className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-destructive">
              <Trash2 size={12} /> Delete
            </button>
          )}
        </div>

        {deleting && (
          <div className="space-y-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2">
            <p className="text-sm leading-relaxed">
              Delete <strong>{dish.name}</strong>?
              {usedOn.length > 0 && (
                <> It is logged on {usedOn.length} {usedOn.length === 1 ? 'day' : 'days'}, and those
                days will lose it from their totals.</>
              )}
            </p>
            <div className="flex gap-2">
              <Button variant="destructive" size="sm" onClick={onConfirmDelete}>Delete</Button>
              <Button variant="outline" size="sm" onClick={onCancelDelete}>Keep</Button>
            </div>
          </div>
        )}

        {dish.swap && (
          <>
            <button
              onClick={() => setOpen(!open)}
              className="text-xs font-medium text-primary transition-opacity hover:opacity-75"
            >
              {open ? 'Hide tip' : 'How to order it better'}
            </button>
            {open && (
              <p className="rounded-lg border-l-2 border-primary bg-accent/40 px-3 py-2 text-sm leading-relaxed">
                {dish.swap}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

function Stat({ value, label, color }: { value: string | number; label: string; color?: string }) {
  return (
    <div className="rounded-md bg-secondary px-1.5 py-1">
      <div className="text-sm font-bold tabular-nums" style={color ? { color } : undefined}>{value}</div>
      <div className="text-[9px] tracking-wide text-muted-foreground uppercase">{label}</div>
    </div>
  )
}
