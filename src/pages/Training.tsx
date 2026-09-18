import { useEffect, useState } from 'react'
import { Timer, Repeat, ChevronDown, AlertTriangle, ArrowUpRight, ArrowUp, Footprints, Moon, X, ChevronLeft, ChevronRight, CalendarDays, Plane, Undo2 } from 'lucide-react'
import { usePlan } from '@/stores/profile'
import { useUi } from '@/stores/ui'
import {
  MUSCLE_GROUPS, WEEKLY_SPLIT, CARDIO_SESSIONS, PROGRESSION_RULES, WARMUP, GOAL_TRAINING, ACTIVITY_CARDIO, PULLUP_BAR_UPGRADES,
  DUMBBELL_MAX_KG, resolveLoad, adjustedSets, estimatedMinutes, splitDayExercises, runDays,
  type MuscleGroupSection, type SplitDay, type Exercise, type Equipment,
} from '@/data/training'
import {
  TRAVEL_WORKOUTS, TRAVEL_WARMUP, TRAVEL_GUIDELINES, TRAVEL_RETURN_NOTE, travelWorkoutExercises,
  type TravelWorkout,
} from '@/data/travel'
import { GOAL_ADJUSTMENT } from '@/lib/nutrition'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PatternFigure, MuscleMap, patternFor, PATTERN_LABEL } from '@/components/illustrations/ExerciseDiagram'
import { FormVideo } from '@/components/FormVideo'
import { SetLogger, DayProgressBadge } from '@/components/SetLogger'
import { TrainingSummary } from '@/components/TrainingSummary'
import { ExerciseRemark } from '@/components/ExerciseRemark'
import { useWorkoutLog } from '@/stores/workout-log'
import { shiftISO, todayISO } from '@/lib/workout-log'
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
  const { trainingDay, setTrainingDay, travelMode, setTravelMode, travelWorkout, setTravelWorkout } = useUi()
  const { logDate, setLogDate } = useWorkoutLog()

  const goalTraining = GOAL_TRAINING[profile.goal]
  const cardio = ACTIVITY_CARDIO[profile.activity]
  const runningDays = runDays(cardio.runsPerWeek)
  const selectedDay = WEEKLY_SPLIT.find((d) => d.day === trainingDay) ?? null

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Training</h1>
        <p className="text-sm text-muted-foreground">
          {travelMode ? (
            <>
              Travel mode — nothing here needs equipment beyond a towel, a door and the hotel bed.
              Two alternating full-body sessions, one every 3–4 days, hold your muscle until you are
              home; your logged sets keep counting toward the same history.
            </>
          ) : (
            <>
              Built for dumbbells, a bench and bands — nothing here needs a gym. The week runs a six-day
              push/pull/legs split, each muscle trained twice; the library below has the form details.
              Loads are estimated from your {profile.weightKg.toFixed(1)} kg; treat them as a first guess
              and adjust on feel.
            </>
          )}
        </p>
      </header>

      {/* ── Travel mode switch ── */}
      <Card className={cn(travelMode && 'border-primary/40 bg-accent/25')}>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-5">
          <div className="flex items-start gap-3">
            <Plane size={18} className="mt-0.5 shrink-0 text-primary" />
            <div>
              <div className="text-sm font-semibold">
                {travelMode ? 'Travel mode is on' : 'Travelling without your equipment?'}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {travelMode
                  ? TRAVEL_RETURN_NOTE
                  : 'Switch to a bodyweight-only plan for the trip — the home programme comes straight back when you do.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTravelMode(!travelMode)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
              travelMode
                ? 'border-border bg-card hover:bg-accent'
                : 'border-primary bg-primary text-primary-foreground hover:opacity-90',
            )}
          >
            {travelMode ? <><Undo2 size={13} /> Back to the home plan</> : <><Plane size={13} /> Switch to travel mode</>}
          </button>
        </CardContent>
      </Card>

      {travelMode ? (
        <TravelPlan
          goal={profile.goal}
          weightKg={profile.weightKg}
          selectedId={travelWorkout}
          onSelect={setTravelWorkout}
          logDate={logDate}
          setLogDate={setLogDate}
        />
      ) : (
        <>
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

      {/* ── What the last week actually looked like ── */}
      <TrainingSummary />

      {/* ── The weekly split ── */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight">The week</h2>
          <p className="text-sm text-muted-foreground">
            Push / pull / legs, run twice. Saturday is the heavy leg day — the weekend has the time
            for it — and Sunday is a full rest day, which is what makes six lifting days recoverable.
            <strong className="font-medium text-foreground"> Tap a day to see its exercises</strong>,
            with form videos, in the order you do them.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {WEEKLY_SPLIT.map((d) => (
            <SplitDayCard
              key={d.day}
              day={d}
              goal={profile.goal}
              isRunDay={runningDays.has(d.day)}
              selected={selectedDay?.day === d.day}
              logDate={logDate}
              onSelect={() => setTrainingDay(selectedDay?.day === d.day ? null : d.day)}
            />
          ))}
        </div>
      </div>

      {/* ── Jump to a muscle group (full-library view only) ── */}
      {!selectedDay && (
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {MUSCLE_GROUPS.map((g) => (
            <a
              key={g.id}
              href={`#group-${g.id}`}
              className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-accent"
            >
              {g.name}
            </a>
          ))}
          <a
            href="#cardio"
            className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-accent"
          >
            Cardio
          </a>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Warm-up — 8 minutes, before any session</CardTitle>
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

      {selectedDay ? (
        <SelectedDaySection
          day={selectedDay}
          weightKg={profile.weightKg}
          goal={profile.goal}
          isRunDay={runningDays.has(selectedDay.day)}
          logDate={logDate}
          setLogDate={setLogDate}
          onClear={() => setTrainingDay(null)}
        />
      ) : (
        MUSCLE_GROUPS.map((g) => (
          <MuscleGroupSectionCard key={g.id} group={g} weightKg={profile.weightKg} goal={profile.goal} />
        ))
      )}

      <div id="cardio" className="space-y-3 scroll-mt-4">
        <h2 className="text-lg font-bold tracking-tight">Cardio</h2>
        {CARDIO_SESSIONS.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <CardTitle>{c.name}</CardTitle>
              <CardDescription>{c.what}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-5 sm:flex-row">
              <PatternFigure pattern="run" size={90} />
              <div className="flex-1">
                <p className="text-sm leading-relaxed">{c.detail}</p>
                <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Timer size={14} /> About {c.minutes} minutes
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
        </>
      )}

      <BackToTop />
    </div>
  )
}

/**
 * The bodyweight plan shown while travel mode is on. Same exercise cards and
 * set logging as the home programme — only the plan around them changes, so
 * travel sessions land in the same workout history.
 */
function TravelPlan({
  goal, weightKg, selectedId, onSelect, logDate, setLogDate,
}: {
  goal: Parameters<typeof adjustedSets>[1]
  weightKg: number
  selectedId: string | null
  onSelect: (id: string | null) => void
  logDate: string
  setLogDate: (date: string) => void
}) {
  const selected = TRAVEL_WORKOUTS.find((w) => w.id === selectedId) ?? null

  return (
    <>
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight">The trip</h2>
          <p className="text-sm text-muted-foreground">
            Alternate A and B every 3–4 days — two or three sessions across a 10-day trip is all
            maintenance takes. All exercises are listed below;{' '}
            <strong className="font-medium text-foreground">tap a session to do it in order and log
            your sets</strong> as usual.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {TRAVEL_WORKOUTS.map((w) => (
            <TravelWorkoutCard
              key={w.id}
              workout={w}
              goal={goal}
              selected={selected?.id === w.id}
              logDate={logDate}
              onSelect={() => onSelect(selected?.id === w.id ? null : w.id)}
            />
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Warm-up — 5 minutes, before either session</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-1.5 text-sm">
            {TRAVEL_WARMUP.map((w, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="text-muted-foreground tabular-nums">{i + 1}.</span>
                <span>{w}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {selected ? (
        <div className="space-y-3">
          <Card className="border-primary/40 bg-accent/25">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle>{selected.title}</CardTitle>
                <button
                  type="button"
                  onClick={() => onSelect(null)}
                  className="flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary/40 hover:bg-accent"
                >
                  <X size={13} /> Show all exercises
                </button>
              </div>
              <CardDescription>
                {selected.focus} · {travelWorkoutExercises(selected).length} exercises in order
              </CardDescription>
            </CardHeader>
          </Card>

          <LogDateBar logDate={logDate} setLogDate={setLogDate} />

          {travelWorkoutExercises(selected).map((ex, i) => (
            <div key={ex.id} className="relative">
              <span className="absolute -left-1 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-sm">
                {i + 1}
              </span>
              <ExerciseCard ex={ex} weightKg={weightKg} goal={goal} logging />
            </div>
          ))}
        </div>
      ) : (
        // Mirror the home page: with no session selected, the exercises still
        // show as a reference library. Logging stays in the session view, where
        // order and the log-date bar give it context.
        TRAVEL_WORKOUTS.map((w) => (
          <div key={w.id} className="space-y-3">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>{w.title}</CardTitle>
                  <Badge tone="primary">Full body</Badge>
                </div>
                <CardDescription>{w.focus}</CardDescription>
              </CardHeader>
            </Card>
            {travelWorkoutExercises(w).map((ex) => (
              <ExerciseCard key={ex.id} ex={ex} weightKg={weightKg} goal={goal} />
            ))}
          </div>
        ))
      )}

      <Card>
        <CardHeader>
          <CardTitle>How to make bodyweight count</CardTitle>
          <CardDescription>
            The loads are lighter than your dumbbells, so the intensity has to come from execution.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {TRAVEL_GUIDELINES.map((r) => (
            <div key={r.title} className="rounded-lg border border-border p-3">
              <div className="text-sm font-semibold">{r.title}</div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  )
}

function TravelWorkoutCard({
  workout, goal, selected, onSelect, logDate,
}: {
  workout: TravelWorkout
  goal: Parameters<typeof adjustedSets>[1]
  selected: boolean
  onSelect: () => void
  logDate: string
}) {
  const exercises = travelWorkoutExercises(workout)
  const totalSets = exercises.reduce((a, e) => a + adjustedSets(e, goal), 0)
  const minutes = estimatedMinutes(exercises, goal)

  return (
    <button type="button" onClick={onSelect} aria-pressed={selected} className="h-full w-full text-left">
      <Card
        className={cn(
          'h-full transition-colors hover:border-primary/50',
          selected && 'border-primary ring-1 ring-primary',
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm">{workout.title}</CardTitle>
            <Badge tone="primary">
              <Plane size={11} className="mr-1" />
              Full body
            </Badge>
          </div>
          <CardDescription>
            {totalSets} sets · ~{minutes} min
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <DayProgressBadge exerciseIds={workout.exerciseIds} date={logDate} targetTotal={totalSets} />
          <ul className="space-y-1 text-sm">
            {exercises.map((e) => (
              <li key={e.id}>{e.name}</li>
            ))}
          </ul>
          {workout.note && <p className="text-xs leading-relaxed text-muted-foreground">{workout.note}</p>}
        </CardContent>
      </Card>
    </button>
  )
}

const KIND_LABEL: Record<SplitDay['kind'], string> = {
  push: 'Push',
  pull: 'Pull',
  legs: 'Legs',
  rest: 'Rest',
}

function SplitDayCard({
  day, goal, isRunDay, selected, onSelect, logDate,
}: {
  day: SplitDay
  goal: Parameters<typeof adjustedSets>[1]
  isRunDay: boolean
  selected: boolean
  onSelect: () => void
  /** Date the logger is writing to — the badge counts that day's sets, not today's. */
  logDate: string
}) {
  const exercises = splitDayExercises(day)
  const totalSets = exercises.reduce((a, e) => a + adjustedSets(e, goal), 0)
  const minutes = estimatedMinutes(exercises, goal)

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="h-full w-full text-left"
    >
      <Card
        className={cn(
          'h-full transition-colors hover:border-primary/50',
          day.kind === 'rest' && 'border-dashed bg-accent/20',
          selected && 'border-primary ring-1 ring-primary',
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm">{day.day}</CardTitle>
            <Badge tone={day.kind === 'rest' ? 'outline' : 'primary'}>
              {day.kind === 'rest' && <Moon size={11} className="mr-1" />}
              {KIND_LABEL[day.kind]}
            </Badge>
          </div>
          <CardDescription>
            {day.title}
            {day.kind !== 'rest' && <> · {totalSets} sets · ~{minutes} min lifting</>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          {day.kind !== 'rest' && (
            <DayProgressBadge exerciseIds={day.exerciseIds} date={logDate} targetTotal={totalSets} />
          )}
          {exercises.length > 0 && (
            <ul className="space-y-1 text-sm">
              {exercises.map((e) => (
                <li key={e.id}>{e.name}</li>
              ))}
            </ul>
          )}
          {isRunDay && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <Footprints size={13} /> Zone 2 run · after lifting
            </div>
          )}
          {day.note && <p className="text-xs leading-relaxed text-muted-foreground">{day.note}</p>}
        </CardContent>
      </Card>
    </button>
  )
}

function SelectedDaySection({
  day, weightKg, goal, isRunDay, logDate, setLogDate, onClear,
}: {
  day: SplitDay
  weightKg: number
  goal: Parameters<typeof adjustedSets>[1]
  isRunDay: boolean
  logDate: string
  setLogDate: (date: string) => void
  onClear: () => void
}) {
  const exercises = splitDayExercises(day)
  const totalSets = exercises.reduce((a, e) => a + adjustedSets(e, goal), 0)
  const minutes = estimatedMinutes(exercises, goal)

  return (
    <div className="space-y-3">
      <Card className="border-primary/40 bg-accent/25">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>
              {day.day} — {day.title}
            </CardTitle>
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary/40 hover:bg-accent"
            >
              <X size={13} /> Show full library
            </button>
          </div>
          <CardDescription>
            {day.kind === 'rest' ? (
              day.focus
            ) : (
              <>
                {day.focus} · {exercises.length} exercises in order · {totalSets} sets · ~{minutes} min
                lifting{isRunDay && <> · zone 2 run after</>}
              </>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      {day.kind !== 'rest' && <LogDateBar logDate={logDate} setLogDate={setLogDate} />}

      {day.kind === 'rest' ? (
        <Card className="border-dashed">
          <CardContent className="flex items-center gap-3 pt-5 text-sm text-muted-foreground">
            <Moon size={18} className="shrink-0" />
            <p>{day.note}</p>
          </CardContent>
        </Card>
      ) : (
        exercises.map((ex, i) => (
          <div key={ex.id} className="relative">
            <span className="absolute -left-1 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-sm">
              {i + 1}
            </span>
            <ExerciseCard ex={ex} weightKg={weightKg} goal={goal} logging />
          </div>
        ))
      )}
    </div>
  )
}

/** Floating scroll-to-top control — the page is long once exercise cards render. */
function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className="fixed bottom-20 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-md transition-colors hover:border-primary/50 hover:bg-accent lg:bottom-6 lg:right-8"
    >
      <ArrowUp size={18} />
    </button>
  )
}

function MuscleGroupSectionCard({
  group, weightKg, goal,
}: {
  group: MuscleGroupSection
  weightKg: number
  goal: Parameters<typeof adjustedSets>[1]
}) {
  const totalSets = group.exercises.reduce((a, e) => a + adjustedSets(e, goal), 0)
  const minutes = estimatedMinutes(group.exercises, goal)

  return (
    <div id={`group-${group.id}`} className="space-y-3 scroll-mt-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{group.name}</CardTitle>
            <Badge tone="primary">{group.focus}</Badge>
          </div>
          <CardDescription>
            {group.exercises.length} exercises · {totalSets} working sets · about {minutes} minutes
          </CardDescription>
        </CardHeader>
      </Card>

      {group.exercises.map((ex) => (
        <ExerciseCard key={ex.id} ex={ex} weightKg={weightKg} goal={goal} />
      ))}
    </div>
  )
}

function ExerciseCard({
  ex, weightKg, goal, logging = false,
}: {
  ex: Exercise
  weightKg: number
  goal: Parameters<typeof adjustedSets>[1]
  /** Set logging only appears in the day view — the full library is a reference, not a session. */
  logging?: boolean
}) {
  const [open, setOpen] = useState(false)
  const load = resolveLoad(ex, weightKg)
  const sets = adjustedSets(ex, goal)
  const pattern = patternFor(ex.id)

  return (
    <Card id={`ex-${ex.id}`} className="scroll-mt-4">
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

            <ExerciseRemark ex={ex} />

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <ChevronDown size={13} className={cn('transition-transform', open && 'rotate-180')} />
                {open ? 'Hide form' : 'Show form breakdown'}
              </button>
              <a
                href={ex.formUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <ArrowUpRight size={13} />
                Detailed reference on ExRx
              </a>
            </div>
            {!ex.formUrlExact && (
              <p className="mt-1 text-xs text-muted-foreground">
                ExRx doesn't have this exact variant — the link shows the closest equivalent movement.
              </p>
            )}

            {logging && <SetLogger ex={ex} targetSets={sets} />}

            <div className="mt-3 max-w-sm">
              <FormVideo videoId={ex.videoId} title={ex.name} />
            </div>
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

/**
 * Which date the set logger writes to. Defaults to today, but a session that
 * got logged the morning after still belongs to the day it happened, so the
 * date is steppable rather than fixed.
 */
function LogDateBar({ logDate, setLogDate }: { logDate: string; setLogDate: (date: string) => void }) {
  const isToday = logDate === todayISO()

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
      <CalendarDays size={15} className="shrink-0 text-muted-foreground" />
      <span className="text-sm font-medium">Logging to</span>
      <button
        type="button"
        onClick={() => setLogDate(shiftISO(logDate, -1))}
        aria-label="Previous day"
        className="flex h-7 w-7 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent"
      >
        <ChevronLeft size={14} />
      </button>
      <input
        type="date"
        value={logDate}
        onChange={(e) => e.target.value && setLogDate(e.target.value)}
        aria-label="Date to log sets against"
        className="h-8 rounded-md border border-input bg-background px-2 text-sm tabular-nums focus:ring-2 focus:ring-ring focus:outline-none"
      />
      <button
        type="button"
        onClick={() => setLogDate(shiftISO(logDate, 1))}
        aria-label="Next day"
        className="flex h-7 w-7 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent"
      >
        <ChevronRight size={14} />
      </button>
      {isToday ? (
        <Badge tone="primary">Today</Badge>
      ) : (
        <button
          type="button"
          onClick={() => setLogDate(todayISO())}
          className="text-xs font-medium text-primary hover:underline"
        >
          Back to today
        </button>
      )}
    </div>
  )
}
