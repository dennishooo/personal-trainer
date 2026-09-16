import { describe, it, expect } from 'vitest'
import {
  MUSCLE_GROUPS, WEEKLY_SPLIT, CARDIO_SESSIONS, GOAL_TRAINING, ACTIVITY_CARDIO, DUMBBELL_MAX_KG, DUMBBELL_STEP_KG,
  EXERCISE_BY_ID, resolveLoad, adjustedSets, estimatedMinutes, splitDayExercises, runDays,
  type Exercise, type MuscleGroup,
} from './training'

const ex = (over: Partial<Exercise> = {}): Exercise => ({
  id: 'test',
  name: 'Test',
  group: 'legs',
  equipment: ['dumbbell'],
  sets: 3,
  reps: '8–12',
  restSec: 90,
  position: '',
  cue: '',
  form: [],
  formUrl: 'https://exrx.net/',
  formUrlExact: true,
  videoId: 'dQw4w9WgXcQ',
  ...over,
})

describe('muscle group sections', () => {
  const all = MUSCLE_GROUPS.flatMap((g) => g.exercises)

  it('never requires equipment the user does not own', () => {
    const owned = new Set(['dumbbell', 'bench', 'band', 'bodyweight'])
    const bad = all.filter((e) => e.equipment.some((q) => !owned.has(q)))
    expect(bad.map((e) => e.id)).toEqual([])
  })

  it('gives every exercise at least one equipment tag', () => {
    expect(all.filter((e) => e.equipment.length === 0)).toEqual([])
  })

  it('covers every major muscle group with at least one exercise', () => {
    for (const g of MUSCLE_GROUPS) {
      expect(g.exercises.length).toBeGreaterThan(0)
    }
  })

  it('has exactly one section per muscle group, with no duplicates or gaps', () => {
    const expected: MuscleGroup[] = ['chest', 'back', 'shoulders', 'legs', 'biceps', 'triceps', 'core']
    expect(MUSCLE_GROUPS.map((g) => g.id).sort()).toEqual([...expected].sort())
  })

  it('only lists an exercise under the section matching its group', () => {
    for (const g of MUSCLE_GROUPS) {
      expect(g.exercises.every((e) => e.group === g.id)).toBe(true)
    }
  })

  it('has no duplicate exercise ids across sections', () => {
    const ids = all.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every exercise a starting position for beginners', () => {
    expect(all.filter((e) => !e.position.trim())).toEqual([])
  })

  it('gives every exercise a form demo link', () => {
    expect(all.filter((e) => !/^https:\/\/exrx\.net\//.test(e.formUrl))).toEqual([])
  })

  it('gives every exercise a well-formed YouTube video id', () => {
    expect(all.filter((e) => !/^[A-Za-z0-9_-]{11}$/.test(e.videoId))).toEqual([])
  })

  it('has no duplicate demo videos across exercises', () => {
    const ids = all.map((e) => e.videoId)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('cardio sessions', () => {
  it('has exactly two sessions, each with a positive duration and a short label', () => {
    expect(CARDIO_SESSIONS).toHaveLength(2)
    expect(CARDIO_SESSIONS.every((c) => c.minutes > 0 && c.what.trim())).toBe(true)
  })
})

describe('weekly split', () => {
  const lifting = WEEKLY_SPLIT.filter((d) => d.kind !== 'rest')

  it('covers all seven days, Monday first', () => {
    expect(WEEKLY_SPLIT.map((d) => d.day)).toEqual([
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
    ])
  })

  it('only schedules exercises that exist in the library', () => {
    const missing = WEEKLY_SPLIT.flatMap((d) => d.exerciseIds).filter((id) => !EXERCISE_BY_ID[id])
    expect(missing).toEqual([])
  })

  it('never repeats an exercise within a day', () => {
    for (const d of WEEKLY_SPLIT) {
      expect(new Set(d.exerciseIds).size).toBe(d.exerciseIds.length)
    }
  })

  it('runs each session type exactly twice, with exactly one rest day', () => {
    const kinds = WEEKLY_SPLIT.map((d) => d.kind)
    expect(kinds.filter((k) => k === 'push')).toHaveLength(2)
    expect(kinds.filter((k) => k === 'pull')).toHaveLength(2)
    expect(kinds.filter((k) => k === 'legs')).toHaveLength(2)
    expect(kinds.filter((k) => k === 'rest')).toHaveLength(1)
  })

  it('never schedules the same session type on consecutive days', () => {
    for (let i = 1; i < WEEKLY_SPLIT.length; i++) {
      if (WEEKLY_SPLIT[i].kind === 'rest') continue
      expect(WEEKLY_SPLIT[i].kind).not.toBe(WEEKLY_SPLIT[i - 1].kind)
    }
  })

  it('trains every major muscle group at least twice a week', () => {
    const hits = new Map<MuscleGroup, number>()
    for (const d of WEEKLY_SPLIT) {
      const groups = new Set(splitDayExercises(d).map((e) => e.group))
      for (const g of groups) hits.set(g, (hits.get(g) ?? 0) + 1)
    }
    for (const g of ['chest', 'back', 'shoulders', 'legs', 'biceps', 'triceps', 'core'] as const) {
      expect(hits.get(g) ?? 0, `muscle group ${g}`).toBeGreaterThanOrEqual(2)
    }
  })

  it('keeps per-session volume moderate at the recomp baseline', () => {
    for (const d of lifting) {
      const sets = splitDayExercises(d).reduce((a, e) => a + adjustedSets(e, 'recomp'), 0)
      expect(sets, d.title).toBeGreaterThanOrEqual(12)
      expect(sets, d.title).toBeLessThanOrEqual(20)
    }
  })

  it('makes Saturday the biggest session, next to the rest day', () => {
    const volume = (d: (typeof lifting)[number]) =>
      splitDayExercises(d).reduce((a, e) => a + adjustedSets(e, 'recomp'), 0)
    const saturday = WEEKLY_SPLIT.find((d) => d.day === 'Saturday')!
    expect(lifting.every((d) => volume(d) <= volume(saturday))).toBe(true)
    expect(WEEKLY_SPLIT.find((d) => d.day === 'Sunday')!.kind).toBe('rest')
  })

  it('gives the rest day no exercises', () => {
    const rest = WEEKLY_SPLIT.find((d) => d.kind === 'rest')!
    expect(splitDayExercises(rest)).toEqual([])
  })

  it('places runs by priority, keeping Saturday down to one run per week', () => {
    expect(runDays(1)).toEqual(new Set(['Saturday']))
    expect(runDays(2)).toEqual(new Set(['Saturday', 'Tuesday']))
    expect(runDays(3)).toEqual(new Set(['Saturday', 'Tuesday', 'Thursday']))
  })

  it('never puts a run on the rest day or the heavy Wednesday leg day', () => {
    const maxRuns = Math.max(...Object.values(ACTIVITY_CARDIO).map((a) => a.runsPerWeek))
    const days = runDays(maxRuns)
    expect(days.has('Sunday')).toBe(false)
    expect(days.has('Wednesday')).toBe(false)
  })
})

describe('resolveLoad', () => {
  it('rounds to the dumbbell adjustment step', () => {
    const { text } = resolveLoad(ex({ loadPerBw: 0.3 }), 78.8)
    const kg = Number(text.split(' ')[0])
    expect(kg % DUMBBELL_STEP_KG).toBe(0)
  })

  it('scales with bodyweight', () => {
    const light = resolveLoad(ex({ loadPerBw: 0.2 }), 60).text
    const heavy = resolveLoad(ex({ loadPerBw: 0.2 }), 90).text
    expect(Number(light.split(' ')[0])).toBeLessThan(Number(heavy.split(' ')[0]))
  })

  it('clamps to the dumbbell ceiling and flags it', () => {
    const r = resolveLoad(ex({ loadPerBw: 2 }), 78.8)
    expect(Number(r.text.split(' ')[0])).toBe(DUMBBELL_MAX_KG)
    expect(r.atCeiling).toBe(true)
  })

  it('does not flag a load within the ceiling', () => {
    expect(resolveLoad(ex({ loadPerBw: 0.1 }), 78.8).atCeiling).toBe(false)
  })

  it('never suggests less than one adjustment step', () => {
    const kg = Number(resolveLoad(ex({ loadPerBw: 0.001 }), 40).text.split(' ')[0])
    expect(kg).toBeGreaterThanOrEqual(DUMBBELL_STEP_KG)
  })

  it('falls back to the note for unweighted exercises', () => {
    expect(resolveLoad(ex({ loadPerBw: undefined }), 78.8).text).toBe('Bodyweight')
  })
})

describe('adjustedSets', () => {
  it('cuts volume on a cut and adds it on a bulk', () => {
    const e = ex({ sets: 4 })
    expect(adjustedSets(e, 'cut')).toBe(3)
    expect(adjustedSets(e, 'recomp')).toBe(4)
    expect(adjustedSets(e, 'lean-bulk')).toBe(5)
    expect(adjustedSets(e, 'maintain')).toBe(4)
  })

  it('never drops below two working sets', () => {
    expect(adjustedSets(ex({ sets: 2 }), 'cut')).toBe(2)
  })

  it('changes total session volume when the goal changes', () => {
    const group = MUSCLE_GROUPS.find((g) => g.id === 'chest')!
    const total = (g: Parameters<typeof adjustedSets>[1]) =>
      group.exercises.reduce((a, e) => a + adjustedSets(e, g), 0)
    expect(total('cut')).toBeLessThan(total('recomp'))
    expect(total('lean-bulk')).toBeGreaterThan(total('recomp'))
  })
})

describe('estimatedMinutes', () => {
  it('grows with more sets and shrinks with less', () => {
    const group = MUSCLE_GROUPS.find((g) => g.id === 'chest')!
    expect(estimatedMinutes(group.exercises, 'lean-bulk')).toBeGreaterThan(
      estimatedMinutes(group.exercises, 'cut'),
    )
  })

  it('returns zero for an empty exercise list', () => {
    expect(estimatedMinutes([], 'recomp')).toBe(0)
  })
})

describe('goal and activity metadata', () => {
  it('covers every goal', () => {
    for (const g of ['cut', 'recomp', 'lean-bulk', 'maintain'] as const) {
      expect(GOAL_TRAINING[g].note).toBeTruthy()
    }
  })

  it('scales weekly runs with activity level', () => {
    expect(ACTIVITY_CARDIO.sedentary.runsPerWeek).toBeLessThan(ACTIVITY_CARDIO.active.runsPerWeek)
  })
})
