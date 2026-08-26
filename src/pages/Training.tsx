import { useState } from 'react'
import { Dumbbell, Timer, Repeat, Footprints, Moon, ChevronDown } from 'lucide-react'
import { usePlan } from '@/stores/profile'
import { PROGRAM, PROGRESSION_RULES, WARMUP, resolveLoad, type TrainingDay, type Exercise } from '@/data/training'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PatternFigure, MuscleMap, patternFor } from '@/components/illustrations/ExerciseDiagram'
import { cn } from '@/lib/utils'

export function Training() {
  const { profile } = usePlan()
  const [active, setActive] = useState(PROGRAM[0].id)
  const day = PROGRAM.find((d) => d.id === active)!

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Training</h1>
        <p className="text-sm text-muted-foreground">
          Four lifting days, two runs, one rest day. Starting loads are estimated from your{' '}
          {profile.weightKg.toFixed(1)} kg — treat them as a first guess and adjust on feel.
        </p>
      </header>

      {/* ── Week strip ── */}
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {PROGRAM.map((d) => (
          <button
            key={d.id}
            onClick={() => setActive(d.id)}
            className={cn(
              'flex min-w-24 shrink-0 flex-col items-start rounded-xl border p-3 text-left transition-colors',
              active === d.id
                ? 'border-primary bg-accent'
                : 'border-border bg-card hover:border-primary/40',
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

      <DayDetail day={day} weightKg={profile.weightKg} />

      {/* ── Warm-up ── */}
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

      {/* ── Progression ── */}
      <Card>
        <CardHeader>
          <CardTitle>How to progress</CardTitle>
          <CardDescription>
            Adding weight over time is what builds muscle. The programme is the scaffolding; this is
            the actual mechanism.
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

function DayDetail({ day, weightKg }: { day: TrainingDay; weightKg: number }) {
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

  const totalSets = day.exercises.reduce((a, e) => a + e.sets, 0)

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
        <ExerciseCard key={ex.id} ex={ex} weightKg={weightKg} />
      ))}
    </div>
  )
}

function ExerciseCard({ ex, weightKg }: { ex: Exercise; weightKg: number }) {
  const [open, setOpen] = useState(false)

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex gap-4">
          <div className="hidden shrink-0 sm:block">
            <PatternFigure pattern={patternFor(ex.id)} size={80} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{ex.name}</h3>
              {ex.chinese && <span className="text-xs text-muted-foreground">{ex.chinese}</span>}
            </div>

            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              <Badge tone="default">
                <Repeat size={11} className="mr-1" />
                {ex.sets} × {ex.reps}
              </Badge>
              <Badge tone="default">
                <Timer size={11} className="mr-1" />
                {ex.restSec}s rest
              </Badge>
              <Badge tone="primary">{resolveLoad(ex, weightKg)}</Badge>
            </div>

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
