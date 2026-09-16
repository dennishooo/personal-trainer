import { lazy, Suspense, useMemo, useState } from 'react'
import { Check, ChevronDown, History, LineChart, Plus, Trash2, TrendingUp } from 'lucide-react'
import type { Exercise } from '@/data/training'
import { useWorkoutLog } from '@/stores/workout-log'
import {
  describeSession, isTimed, previousSession, progressionAdvice, progressSeries, sessionsFor,
  setsFor, suggestedWeight,
} from '@/lib/workout-log'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ExerciseProgressChart = lazy(() =>
  import('./ExerciseProgressChart').then((m) => ({ default: m.ExerciseProgressChart })),
)

/**
 * Per-exercise set logging: what you actually lifted, against what the
 * programme prescribed. Lives on the exercise card in the day view, because
 * that is where you are standing when you finish a set.
 */
export function SetLogger({ ex, targetSets }: { ex: Exercise; targetSets: number }) {
  const { sets, logDate, addSet, updateSet, removeSet } = useWorkoutLog()
  const [showHistory, setShowHistory] = useState(false)

  const timed = isTimed(ex)
  const today = useMemo(() => setsFor(sets, ex.id, logDate), [sets, ex.id, logDate])
  const previous = useMemo(() => previousSession(sets, ex.id, logDate), [sets, ex.id, logDate])
  const advice = useMemo(
    () => progressionAdvice({ date: logDate, exerciseId: ex.id, sets: today }, ex, targetSets),
    [today, ex, targetSets, logDate],
  )
  const history = useMemo(() => sessionsFor(sets, ex.id), [sets, ex.id])
  const series = useMemo(() => progressSeries(sets, ex.id), [sets, ex.id])

  // Bodyweight exercises have no load to plot, and no weight input worth
  // showing until the user actually straps something on.
  const bodyweightOnly = series.length > 0 && series.every((p) => p.topWeightKg === 0)

  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')

  const placeholderWeight = suggestedWeight(today, previous)
  const done = today.length >= targetSets

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const r = Number(reps)
    if (!Number.isFinite(r) || r <= 0) return
    // Blank weight means bodyweight, which is a real answer for push-ups and
    // planks — only a typed non-number is rejected.
    const w = weight.trim() === '' ? (placeholderWeight ?? 0) : Number(weight)
    if (!Number.isFinite(w) || w < 0) return
    addSet(ex.id, w, r)
    setReps('')
    setWeight(weight.trim() === '' && placeholderWeight != null ? String(placeholderWeight) : weight)
  }

  return (
    <div className="mt-3 rounded-lg border border-border bg-secondary/30 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Check size={14} className={cn(done ? 'text-[var(--success)]' : 'text-muted-foreground')} />
          Log your sets
          <span className="text-xs font-normal text-muted-foreground tabular-nums">
            {today.length} / {targetSets}
          </span>
        </div>
        {previous && (
          <span className="text-xs text-muted-foreground">
            Last time ({previous.date.slice(5)}): {describeSession(previous, timed)}
          </span>
        )}
      </div>

      {today.length > 0 && (
        <ul className="mt-2.5 space-y-1.5">
          {today.map((s, i) => (
            <li key={s.setId} className="flex items-center gap-2">
              <span className="w-10 shrink-0 text-xs text-muted-foreground tabular-nums">Set {i + 1}</span>
              <label className="sr-only" htmlFor={`w-${s.setId}`}>
                Weight in kg for set {i + 1} of {ex.name}
              </label>
              <input
                id={`w-${s.setId}`}
                type="number"
                min="0"
                step="0.5"
                value={s.weightKg}
                onChange={(e) => updateSet(s.setId, { weightKg: Number(e.target.value) })}
                className="h-8 w-20 rounded-md border border-input bg-background px-2 text-sm tabular-nums focus:ring-2 focus:ring-ring focus:outline-none"
              />
              <span className="text-xs text-muted-foreground">kg ×</span>
              <label className="sr-only" htmlFor={`r-${s.setId}`}>
                {timed ? 'Seconds' : 'Reps'} for set {i + 1} of {ex.name}
              </label>
              <input
                id={`r-${s.setId}`}
                type="number"
                min="1"
                value={s.reps}
                onChange={(e) => updateSet(s.setId, { reps: Number(e.target.value) })}
                className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm tabular-nums focus:ring-2 focus:ring-ring focus:outline-none"
              />
              <span className="text-xs text-muted-foreground">{timed ? 'sec' : 'reps'}</span>
              <button
                type="button"
                onClick={() => removeSet(s.setId)}
                aria-label={`Delete set ${i + 1} of ${ex.name}`}
                className="ml-auto text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="mt-2.5 flex flex-wrap items-center gap-2">
        <span className="w-10 shrink-0 text-xs text-muted-foreground tabular-nums">
          Set {today.length + 1}
        </span>
        <label className="sr-only" htmlFor={`new-w-${ex.id}`}>
          Weight in kg for the next set of {ex.name}
        </label>
        <input
          id={`new-w-${ex.id}`}
          type="number"
          min="0"
          step="0.5"
          inputMode="decimal"
          placeholder={placeholderWeight != null ? String(placeholderWeight) : 'kg'}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="h-8 w-20 rounded-md border border-input bg-background px-2 text-sm tabular-nums focus:ring-2 focus:ring-ring focus:outline-none"
        />
        <span className="text-xs text-muted-foreground">kg ×</span>
        <label className="sr-only" htmlFor={`new-r-${ex.id}`}>
          {timed ? 'Seconds' : 'Reps'} for the next set of {ex.name}
        </label>
        <input
          id={`new-r-${ex.id}`}
          type="number"
          min="1"
          inputMode="numeric"
          placeholder={timed ? 'sec' : 'reps'}
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm tabular-nums focus:ring-2 focus:ring-ring focus:outline-none"
        />
        <Button type="submit" size="sm" variant={done ? 'outline' : 'primary'}>
          <Plus size={13} /> Add set
        </Button>
      </form>

      {advice.verdict !== 'none' && (
        <p
          className={cn(
            'mt-2.5 flex items-start gap-1.5 text-xs leading-relaxed',
            advice.verdict === 'add-weight' ? 'text-[var(--success)]' : 'text-muted-foreground',
          )}
        >
          {advice.verdict === 'add-weight' && <TrendingUp size={13} className="mt-0.5 shrink-0" />}
          <span>{advice.message}</span>
        </p>
      )}

      {history.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="mt-2.5 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <ChevronDown size={13} className={cn('transition-transform', showHistory && 'rotate-180')} />
            {showHistory ? 'Hide history' : `History & progress (${history.length} session${history.length === 1 ? '' : 's'})`}
          </button>

          {showHistory && (
            <div className="mt-2.5 space-y-3 border-t border-border pt-2.5">
              {series.length >= 2 ? (
                <div>
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <LineChart size={12} />
                    {bodyweightOnly ? 'Best reps per session' : 'Estimated 1RM — the trend, not a lift to attempt'}
                  </div>
                  <Suspense fallback={<div className="h-48 w-full animate-pulse rounded-lg bg-secondary" />}>
                    <ExerciseProgressChart data={series} bodyweight={bodyweightOnly} />
                  </Suspense>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Log a second session to see the trend.
                </p>
              )}

              <div>
                <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <History size={12} /> Past sessions
                </div>
                <ul className="max-h-40 space-y-1 overflow-y-auto text-xs">
                  {history.map((s) => (
                    <li key={s.date} className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground tabular-nums">{s.date}</span>
                      <span className="text-right tabular-nums">{describeSession(s, timed)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/** Compact "3 / 4 sets" marker for the day card, so the week shows what's done. */
export function DayProgressBadge({ exerciseIds, date, targetTotal }: {
  exerciseIds: string[]
  date: string
  targetTotal: number
}) {
  const sets = useWorkoutLog((s) => s.sets)
  const ids = new Set(exerciseIds)
  const done = sets.filter((s) => s.date === date && ids.has(s.exerciseId)).length
  if (done === 0) return null
  return (
    <Badge tone={done >= targetTotal ? 'success' : 'default'}>
      {done}/{targetTotal} sets logged
    </Badge>
  )
}
