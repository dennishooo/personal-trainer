import { useState } from 'react'
import { Dumbbell, Timer, Repeat, Footprints, Moon, ChevronDown, AlertTriangle, ArrowUpRight } from 'lucide-react'
import { usePlan } from '@/stores/profile'
import {
  PROGRAM, PROGRESSION_RULES, WARMUP, GOAL_TRAINING, ACTIVITY_CARDIO, PULLUP_BAR_UPGRADES,
  DUMBBELL_MAX_KG, resolveLoad, adjustedSets,
  type TrainingDay, type Exercise, type Equipment,
} from '@/data/training'
import { GOAL_ADJUSTMENT } from '@/lib/nutrition'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PatternFigure, MuscleMap, patternFor, PATTERN_LABEL } from '@/components/illustrations/ExerciseDiagram'
import { cn } from '@/lib/utils'

const EQUIPMENT_LABEL: Record<Equipment, string> = {
  dumbbell: 'Dumbbells',
  bench: 'Bench',
  band: 'Band',
  bodyweight: 'Bodyweight',
  'pullup-bar': 'Pull-up bar',
}

export function Training() {
  const { profile } = usePlan()
  const [active, setActive] = useState(PROGRAM[0].id)
  const day = PROGRAM.find((d) => d.id === active)!

  const goalTraining = GOAL_TRAINING[profile.goal]
  const cardio = ACTIVITY_CARDIO[profile.activity]

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Training</h1>
        <p className="text-sm text-muted-foreground">
          Built for dumbbells, a bench and bands — nothing here needs a gym. Loads are estimated from
          your {profile.weightKg.toFixed(1)} kg; treat them as a first guess and adjust on feel.
        </p>
      </header>

      {/* ── How the current goal and activity shape the programme ── */}
      <Card className="border-primary/40 bg-accent/25">
        <CardHeader>
          <CardTitle className="text-sm">
            Adjusted for {GOAL_ADJUSTMENT[profile.goal].label.toLowerCase()}
          </CardTitle>
          <CardDescription>
            Change your goal or activity level on the Profile page and this programme changes with it.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-2">
              <Badge tone="primary">{goalTraining.label}</Badge>
              {goalTraining.setDelta !== 0 && (
                <span className="text-xs tabular-nums text-muted-foreground">
                  {goalTraining.setDelta > 0 ? '+' : ''}
                  {goalTraining.setDelta} set per exercise
                </span>
              )}
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{goalTraining.note}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <Badge tone="default">
              {cardio.runsPerWeek} run{cardio.runsPerWeek === 1 ? '' : 's'} / week
            </Badge>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{cardio.note}</p>
          </div>
        </CardContent>
      </Card>

      {/* ── Week strip ── */}
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {PROGRAM.map((d) => (
          <button
            key={d.id}
            onClick={() => setActive(d.id)}
            className={cn(
              'flex min-w-24 shrink-0 flex-col items-start rounded-xl border p-3 text-left transition-colors',
              active === d.id ? 'border-primary bg-accent' : 'border-border bg-card hover:border-primary/40',
            )}
          >
            <span className="text-[10px] tracking-wide text-muted-foreground uppercase">Day {d.day}</span>
            <span className="mt-0.5 text-sm font-semibold">{d.name}</span>
            <span className="mt-1.5 text-muted-foreground">
              {d.type === 'lift' ? <Dumbbell size={14} /> : d.type === 'cardio' ? <Footprints size={14} /> : <Moon size={14} />}
            </span>
          </button>
        ))}
      </div>

      <DayDetail day={day} weightKg={profile.weightKg} goal={profile.goal} />

      {day.type === 'lift' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Warm-up — 8 minutes, every session</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-1.5 text-sm">
              {WARMUP.map((w, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="text-muted-foreground tabular-nums">{i + 1}.</span>
                  <span>{w}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* ── The one real gap in the setup ── */}
      <Card className="border-[var(--warning)]/40 bg-[var(--warning)]/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <ArrowUpRight size={15} /> Worth buying: a pull-up bar
          </CardTitle>
          <CardDescription>
            The one genuine hole in a dumbbell-and-bench setup. A doorway bar runs HK$150–300 and is
            the best value per dollar you can add.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5 text-sm">
            {PULLUP_BAR_UPGRADES.map((u) => (
              <li key={u} className="flex gap-2">
                <span className="text-[var(--warning)]">•</span>
                <span className="text-muted-foreground">{u}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Until then, band pulldowns and dumbbell pullovers cover vertical pulling partially — they
            are marked in the programme so you know what to swap.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to progress</CardTitle>
          <CardDescription>
            Adding weight over time is what builds muscle. The programme is scaffolding; this is the
            actual mechanism.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {PROGRESSION_RULES.map((r) => (
            <div key={r.title} className="rounded-lg border border-border p-3">
              <div className="text-sm font-semibold">{r.title}</div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function DayDetail({ day, weightKg, goal }: { day: TrainingDay; weightKg: number; goal: Parameters<typeof adjustedSets>[1] }) {
  if (day.type !== 'lift') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>{day.name}</CardTitle>
            <Badge tone="outline">{day.focus}</Badge>
          </div>
          <CardDescription>{day.cardio?.what}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-5 sm:flex-row">
          <PatternFigure pattern={day.type === 'cardio' ? 'run' : 'core'} size={110} />
          <div className="flex-1">
            <p className="text-sm leading-relaxed">{day.cardio?.detail}</p>
            {day.durationMin > 0 && (
              <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Timer size={14} /> About {day.durationMin} minutes
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalSets = day.exercises.reduce((a, e) => a + adjustedSets(e, goal), 0)

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{day.name}</CardTitle>
            <Badge tone="primary">{day.focus}</Badge>
          </div>
          <CardDescription>
            {day.exercises.length} exercises · {totalSets} working sets · about {day.durationMin} minutes
          </CardDescription>
        </CardHeader>
      </Card>

      {day.exercises.map((ex) => (
        <ExerciseCard key={ex.id} ex={ex} weightKg={weightKg} goal={goal} />
      ))}
    </div>
  )
}

function ExerciseCard({
  ex, weightKg, goal,
}: {
  ex: Exercise
  weightKg: number
  goal: Parameters<typeof adjustedSets>[1]
}) {
  const [open, setOpen] = useState(false)
  const load = resolveLoad(ex, weightKg)
  const sets = adjustedSets(ex, goal)
  const pattern = patternFor(ex.id)

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex gap-4">
          <div className="hidden shrink-0 flex-col items-center gap-1 sm:flex">
            <PatternFigure pattern={pattern} size={80} />
            <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              {PATTERN_LABEL[pattern]}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{ex.name}</h3>
              {ex.chinese && <span className="text-xs text-muted-foreground">{ex.chinese}</span>}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:hidden">
              <Badge tone="outline">{PATTERN_LABEL[pattern]}</Badge>
            </div>

            <p className="mt-1.5 text-sm text-muted-foreground">{ex.position}</p>

            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {ex.equipment.map((e) => (
                <Badge key={e} tone="outline">
                  {EQUIPMENT_LABEL[e]}
                </Badge>
              ))}
            </div>

            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              <Badge tone="default">
                <Repeat size={11} className="mr-1" />
                {sets} × {ex.reps}
              </Badge>
              <Badge tone="default">
                <Timer size={11} className="mr-1" />
                {ex.restSec}s rest
              </Badge>
              <Badge tone={load.atCeiling ? 'warning' : 'primary'}>{load.text}</Badge>
            </div>

            {load.atCeiling && (
              <p className="mt-2 flex items-start gap-1.5 text-xs text-[var(--warning)]">
                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                <span>
                  Capped at your {DUMBBELL_MAX_KG} kg ceiling. Add reps or a 3-second lowering phase
                  instead of weight.
                </span>
              </p>
            )}

            <p className="mt-2 text-sm text-muted-foreground italic">{ex.cue}</p>

            <button
              onClick={() => setOpen(!open)}
              className="mt-2 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <ChevronDown size={13} className={cn('transition-transform', open && 'rotate-180')} />
              {open ? 'Hide form' : 'Show form breakdown'}
            </button>
          </div>

          <div className="hidden shrink-0 lg:block">
            <MuscleMap groups={[ex.group]} size={54} />
          </div>
        </div>

        {open && (
          <div className="mt-3 border-t border-border pt-3">
            <ol className="space-y-2 text-sm">
              {ex.form.map((f, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{f}</span>
                </li>
              ))}
            </ol>
            {ex.upgrade && (
              <p className="mt-2.5 rounded-lg border-l-2 border-primary bg-accent/40 px-3 py-2 text-xs leading-relaxed">
                <strong>Why this exercise: </strong>
                {ex.upgrade}
              </p>
            )}
            {ex.swap && (
              <p className="mt-2 text-xs text-muted-foreground">
                <strong>Alternative:</strong> {ex.swap}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
