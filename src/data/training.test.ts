import { describe, it, expect } from 'vitest'
import {
  MUSCLE_GROUPS, CARDIO_SESSIONS, GOAL_TRAINING, ACTIVITY_CARDIO, DUMBBELL_MAX_KG, DUMBBELL_STEP_KG,
  resolveLoad, adjustedSets, estimatedMinutes, type Exercise, type MuscleGroup,
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
