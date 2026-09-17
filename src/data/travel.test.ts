import { describe, it, expect } from 'vitest'
import { EXERCISE_BY_ID, adjustedSets, estimatedMinutes } from './training'
import {
  TRAVEL_EXERCISE_BY_ID, TRAVEL_WORKOUTS, TRAVEL_WARMUP, TRAVEL_GUIDELINES, TRAVEL_RETURN_NOTE,
  travelExercise, travelWorkoutExercises,
} from './travel'

const travelOnly = Object.values(TRAVEL_EXERCISE_BY_ID)
const scheduled = TRAVEL_WORKOUTS.flatMap(travelWorkoutExercises)

describe('travel exercises', () => {
  it('need no equipment at all', () => {
    const bad = scheduled.filter((e) => e.equipment.some((q) => q !== 'bodyweight'))
    expect(bad.map((e) => e.id)).toEqual([])
  })

  it('never reuse an id from the home library — logged sets are keyed by id', () => {
    const clashes = travelOnly.filter((e) => EXERCISE_BY_ID[e.id])
    expect(clashes.map((e) => e.id)).toEqual([])
  })

  it('have no duplicate ids or demo videos among themselves', () => {
    const ids = travelOnly.map((e) => e.id)
    const vids = travelOnly.map((e) => e.videoId)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(vids).size).toBe(vids.length)
  })

  it('give every exercise a well-formed YouTube id and an ExRx reference', () => {
    expect(travelOnly.filter((e) => !/^[A-Za-z0-9_-]{11}$/.test(e.videoId))).toEqual([])
    expect(travelOnly.filter((e) => !/^https:\/\/exrx\.net\//.test(e.formUrl))).toEqual([])
  })

  it('give every exercise a starting position, cue and form steps', () => {
    for (const e of travelOnly) {
      expect(e.position.trim(), e.id).toBeTruthy()
      expect(e.cue.trim(), e.id).toBeTruthy()
      expect(e.form.length, e.id).toBeGreaterThan(0)
    }
  })

  it('resolves shared home-library exercises through travelExercise', () => {
    expect(travelExercise('plank')?.id).toBe('plank')
    expect(travelExercise('pushup')?.id).toBe('pushup')
    expect(travelExercise('nope')).toBeUndefined()
  })
})

describe('travel workouts', () => {
  it('has two alternating sessions with only resolvable exercises', () => {
    expect(TRAVEL_WORKOUTS).toHaveLength(2)
    for (const w of TRAVEL_WORKOUTS) {
      expect(travelWorkoutExercises(w).length, w.id).toBe(w.exerciseIds.length)
    }
  })

  it('covers push, pull, legs and core in every session', () => {
    for (const w of TRAVEL_WORKOUTS) {
      const groups = new Set(travelWorkoutExercises(w).map((e) => e.group))
      expect(groups.has('chest') || groups.has('shoulders'), `${w.id} push`).toBe(true)
      expect(groups.has('back'), `${w.id} pull`).toBe(true)
      expect(groups.has('legs'), `${w.id} legs`).toBe(true)
      expect(groups.has('core'), `${w.id} core`).toBe(true)
    }
  })

  it('never repeats an exercise within or across the two sessions', () => {
    const ids = TRAVEL_WORKOUTS.flatMap((w) => w.exerciseIds)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('stays a short maintenance session, not a training camp', () => {
    for (const w of TRAVEL_WORKOUTS) {
      const exercises = travelWorkoutExercises(w)
      const sets = exercises.reduce((a, e) => a + adjustedSets(e, 'recomp'), 0)
      expect(sets, w.id).toBeLessThanOrEqual(14)
      expect(estimatedMinutes(exercises, 'recomp'), w.id).toBeLessThanOrEqual(30)
    }
  })

  it('keeps every exercise unloaded — no dumbbell-relative loads', () => {
    expect(scheduled.filter((e) => e.loadPerBw != null)).toEqual([])
  })
})

describe('travel guidance', () => {
  it('ships a warm-up, guidelines and a return-to-training note', () => {
    expect(TRAVEL_WARMUP.length).toBeGreaterThan(0)
    expect(TRAVEL_GUIDELINES.length).toBeGreaterThan(0)
    expect(TRAVEL_GUIDELINES.every((g) => g.title.trim() && g.body.trim())).toBe(true)
    expect(TRAVEL_RETURN_NOTE).toMatch(/80–90%/)
  })
})
