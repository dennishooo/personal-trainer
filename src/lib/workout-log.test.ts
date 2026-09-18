import { describe, expect, it } from 'vitest'
import {
  comparePeriods, datesFor, daySummary, describeSession, estimated1RM, isTimed, loggedDates,
  periodSummary, previousSession, progressionAdvice, progressSeries, repRange, sessionBest1RM,
  sessionsFor, sessionVolume, setsFor, shiftISO, suggestedWeight, todayISO, topSet, volumeSeries,
  type ExerciseSession, type SetEntry,
} from '@/lib/workout-log'
import type { Exercise } from '@/data/training'

const ex = (over: Partial<Exercise> = {}): Exercise => ({
  id: 'goblet-squat',
  name: 'Goblet squat',
  group: 'legs',
  equipment: ['dumbbell'],
  sets: 4,
  reps: '10–15',
  restSec: 105,
  position: 'Standing',
  cue: 'Chest tall.',
  form: ['Step one'],
  formUrl: 'https://example.test',
  formUrlExact: true,
  videoId: 'abc',
  ...over,
})

const set = (over: Partial<SetEntry> = {}): SetEntry => ({
  setId: 's1',
  date: '2026-09-16',
  exerciseId: 'goblet-squat',
  weightKg: 24,
  reps: 12,
  ...over,
})

const session = (sets: SetEntry[], date = '2026-09-16'): ExerciseSession => ({
  date,
  exerciseId: 'goblet-squat',
  sets,
})

describe('todayISO', () => {
  it('formats the local date, not the UTC one', () => {
    // 00:30 local on the 16th is still the 15th in UTC at +08:00 — a session
    // logged just after midnight belongs to the user's day.
    expect(todayISO(new Date(2026, 8, 16, 0, 30))).toBe('2026-09-16')
  })
})

describe('shiftISO', () => {
  it('steps back a day', () => {
    expect(shiftISO('2026-09-16', -1)).toBe('2026-09-15')
  })

  it('crosses a month boundary', () => {
    expect(shiftISO('2026-09-01', -1)).toBe('2026-08-31')
  })

  it('crosses a year boundary forwards', () => {
    expect(shiftISO('2026-12-31', 1)).toBe('2027-01-01')
  })
})

describe('isTimed', () => {
  it('detects a seconds-based hold', () => {
    expect(isTimed(ex({ reps: '30–60 sec' }))).toBe(true)
  })

  it('treats a plain rep range as reps', () => {
    expect(isTimed(ex())).toBe(false)
  })
})

describe('repRange', () => {
  it('parses the en-dash the dataset uses', () => {
    expect(repRange(ex({ reps: '10–15' }))).toEqual({ min: 10, max: 15 })
  })

  it('parses a plain hyphen too', () => {
    expect(repRange(ex({ reps: '8-12' }))).toEqual({ min: 8, max: 12 })
  })

  it('ignores a trailing qualifier', () => {
    expect(repRange(ex({ reps: '10–12 per leg' }))).toEqual({ min: 10, max: 12 })
  })

  it('reads a timed range as numbers', () => {
    expect(repRange(ex({ reps: '30–60 sec' }))).toEqual({ min: 30, max: 60 })
  })

  it('returns null when there is no range', () => {
    expect(repRange(ex({ reps: 'as many as possible' }))).toBeNull()
  })
})

describe('setsFor', () => {
  it('filters to one exercise on one date, in entry order', () => {
    const sets = [
      set({ setId: 'a', reps: 12 }),
      set({ setId: 'b', reps: 10 }),
      set({ setId: 'c', date: '2026-09-09' }),
      set({ setId: 'd', exerciseId: 'db-row' }),
    ]
    expect(setsFor(sets, 'goblet-squat', '2026-09-16').map((s) => s.setId)).toEqual(['a', 'b'])
  })
})

describe('previousSession', () => {
  const sets = [
    set({ setId: 'a', date: '2026-09-02', weightKg: 20 }),
    set({ setId: 'b', date: '2026-09-09', weightKg: 22 }),
    set({ setId: 'c', date: '2026-09-16', weightKg: 24 }),
  ]

  it('returns the most recent session before the given date', () => {
    const prev = previousSession(sets, 'goblet-squat', '2026-09-16')
    expect(prev?.date).toBe('2026-09-09')
    expect(prev?.sets[0].weightKg).toBe(22)
  })

  it('excludes the date itself, so today’s half-finished session is not "last time"', () => {
    // The whole point of the last-time line is comparison; if it counted
    // today's own sets it would show you what you just typed.
    expect(previousSession(sets, 'goblet-squat', '2026-09-09')?.date).toBe('2026-09-02')
  })

  it('returns null for a first-ever session', () => {
    expect(previousSession(sets, 'goblet-squat', '2026-09-02')).toBeNull()
  })

  it('returns null for an exercise never trained', () => {
    expect(previousSession(sets, 'db-row', '2026-09-16')).toBeNull()
  })
})

describe('datesFor and sessionsFor', () => {
  const sets = [
    set({ setId: 'a', date: '2026-09-09' }),
    set({ setId: 'b', date: '2026-09-16' }),
    set({ setId: 'c', date: '2026-09-16' }),
    set({ setId: 'd', date: '2026-09-16', exerciseId: 'db-row' }),
  ]

  it('lists distinct dates newest first', () => {
    expect(datesFor(sets, 'goblet-squat')).toEqual(['2026-09-16', '2026-09-09'])
  })

  it('groups sets into sessions newest first', () => {
    const out = sessionsFor(sets, 'goblet-squat')
    expect(out).toHaveLength(2)
    expect(out[0].sets).toHaveLength(2)
  })
})

describe('sessionVolume', () => {
  it('sums weight times reps across sets', () => {
    expect(sessionVolume(session([set({ weightKg: 20, reps: 10 }), set({ setId: 'b', weightKg: 20, reps: 8 })]))).toBe(360)
  })

  it('is zero for bodyweight work', () => {
    expect(sessionVolume(session([set({ weightKg: 0, reps: 20 })]))).toBe(0)
  })

  it('skips bodyweight sets rather than letting them drag a loaded total down', () => {
    const mixed = session([set({ weightKg: 20, reps: 10 }), set({ setId: 'b', weightKg: 0, reps: 30 })])
    expect(sessionVolume(mixed)).toBe(200)
  })

  it('is zero for a timed hold, whose reps are seconds and not repetitions', () => {
    // 10 kg x 45 sec is 450 kg-seconds, which must not be added to a kg-reps total.
    expect(sessionVolume(session([set({ weightKg: 10, reps: 45 })]), true)).toBe(0)
  })
})

describe('periodSummary', () => {
  const week = [
    set({ setId: 'a', date: '2026-09-16', weightKg: 20, reps: 10 }),
    set({ setId: 'b', date: '2026-09-16', weightKg: 20, reps: 10 }),
    set({ setId: 'c', date: '2026-09-14', weightKg: 10, reps: 10 }),
    // Outside a 7-day window ending 2026-09-16, which starts on the 10th.
    set({ setId: 'd', date: '2026-09-01', weightKg: 100, reps: 10 }),
  ]

  it('counts distinct days, not sets, as sessions', () => {
    const out = periodSummary(week, '2026-09-16')
    expect(out.sessionCount).toBe(2)
    expect(out.setCount).toBe(3)
  })

  it('includes both window bounds and excludes what falls outside', () => {
    const out = periodSummary(week, '2026-09-16')
    expect(out.from).toBe('2026-09-10')
    expect(out.to).toBe('2026-09-16')
    expect(out.volume).toBe(500)
  })

  it('excludes bodyweight sets from volume but still counts them as sets', () => {
    const out = periodSummary([set({ weightKg: 0, reps: 30 })], '2026-09-16')
    expect(out.setCount).toBe(1)
    expect(out.volume).toBe(0)
  })
})

describe('comparePeriods', () => {
  it('compares the last seven days against the seven before, without overlap', () => {
    const out = comparePeriods([
      set({ setId: 'a', date: '2026-09-16', weightKg: 20, reps: 10 }),
      set({ setId: 'b', date: '2026-09-08', weightKg: 10, reps: 10 }),
    ], '2026-09-16')
    expect(out.current.volume).toBe(200)
    expect(out.previous.volume).toBe(100)
    expect(out.previous.to).toBe('2026-09-09')
    expect(out.volumeChangePct).toBe(100)
  })

  it('reports no comparison rather than infinity on the first week', () => {
    const out = comparePeriods([set({ date: '2026-09-16', weightKg: 20, reps: 10 })], '2026-09-16')
    expect(out.previous.volume).toBe(0)
    expect(out.volumeChangePct).toBeNull()
  })

  it('reports a negative change when volume drops', () => {
    const out = comparePeriods([
      set({ setId: 'a', date: '2026-09-16', weightKg: 10, reps: 10 }),
      set({ setId: 'b', date: '2026-09-08', weightKg: 20, reps: 10 }),
    ], '2026-09-16')
    expect(out.volumeChangePct).toBe(-50)
  })
})

describe('volumeSeries', () => {
  it('returns one point per day, oldest first, with rest days as zeros', () => {
    const out = volumeSeries([set({ date: '2026-09-16', weightKg: 20, reps: 10 })], '2026-09-16', 7)
    expect(out).toHaveLength(7)
    expect(out[0].date).toBe('2026-09-10')
    expect(out[6].date).toBe('2026-09-16')
    expect(out[6].volume).toBe(200)
    expect(out.slice(0, 6).every((d) => d.volume === 0 && d.setCount === 0)).toBe(true)
  })
})

describe('topSet', () => {
  it('picks the heaviest set', () => {
    const out = topSet(session([set({ setId: 'a', weightKg: 20 }), set({ setId: 'b', weightKg: 26 })]))
    expect(out?.setId).toBe('b')
  })

  it('breaks a weight tie on reps', () => {
    const out = topSet(session([set({ setId: 'a', weightKg: 24, reps: 8 }), set({ setId: 'b', weightKg: 24, reps: 12 })]))
    expect(out?.setId).toBe('b')
  })

  it('is null for an empty session', () => {
    expect(topSet(session([]))).toBeNull()
  })
})

describe('estimated1RM', () => {
  it('applies the Epley formula', () => {
    expect(estimated1RM(100, 10)).toBeCloseTo(133.3, 1)
  })

  it('is the bare weight at a single rep', () => {
    expect(estimated1RM(100, 1)).toBeCloseTo(103.3, 1)
  })

  it('is zero for bodyweight work, which has no load to extrapolate', () => {
    expect(estimated1RM(0, 20)).toBe(0)
  })
})

describe('sessionBest1RM', () => {
  it('takes the best set, not the last', () => {
    expect(sessionBest1RM(session([
      set({ setId: 'a', weightKg: 30, reps: 5 }),
      set({ setId: 'b', weightKg: 20, reps: 5 }),
    ]))).toBeCloseTo(35, 1)
  })
})

describe('progressSeries', () => {
  it('returns points oldest first, as the chart needs', () => {
    const out = progressSeries([
      set({ setId: 'a', date: '2026-09-16', weightKg: 24, reps: 10 }),
      set({ setId: 'b', date: '2026-09-09', weightKg: 22, reps: 10 }),
    ], 'goblet-squat')
    expect(out.map((p) => p.date)).toEqual(['2026-09-09', '2026-09-16'])
    expect(out[1].topWeightKg).toBe(24)
  })

  it('tracks top reps for bodyweight work, where weight says nothing', () => {
    const out = progressSeries([set({ weightKg: 0, reps: 25 })], 'goblet-squat')
    expect(out[0].est1RM).toBe(0)
    expect(out[0].topReps).toBe(25)
  })
})

describe('progressionAdvice', () => {
  const squat = ex({ reps: '10–15', sets: 4 })

  it('says nothing useful before anything is logged', () => {
    expect(progressionAdvice(null, squat, 4).verdict).toBe('none')
  })

  it('holds while the session is still short of its prescribed sets', () => {
    // Two sets at the top of the range is not the same achievement as four,
    // and prompting here would add weight the user has not earned.
    const out = progressionAdvice(session([
      set({ setId: 'a', reps: 15 }),
      set({ setId: 'b', reps: 15 }),
    ]), squat, 4)
    expect(out.verdict).toBe('hold')
    expect(out.message).toContain('2 more sets')
  })

  it('holds when any set falls short of the top of the range', () => {
    const out = progressionAdvice(session([
      set({ setId: 'a', reps: 15 }),
      set({ setId: 'b', reps: 15 }),
      set({ setId: 'c', reps: 15 }),
      set({ setId: 'd', reps: 11 }),
    ]), squat, 4)
    expect(out.verdict).toBe('hold')
    expect(out.message).toContain('11')
  })

  it('adds one dumbbell step once every set hits the top', () => {
    const out = progressionAdvice(session([
      set({ setId: 'a', weightKg: 24, reps: 15 }),
      set({ setId: 'b', weightKg: 24, reps: 15 }),
      set({ setId: 'c', weightKg: 24, reps: 16 }),
      set({ setId: 'd', weightKg: 24, reps: 15 }),
    ]), squat, 4)
    expect(out.verdict).toBe('add-weight')
    expect(out.nextWeightKg).toBe(26)
    expect(out.message).toContain('drop back to 10')
  })

  it('steps up from the heaviest set when the weight drifted mid-session', () => {
    const out = progressionAdvice(session([
      set({ setId: 'a', weightKg: 24, reps: 15 }),
      set({ setId: 'b', weightKg: 26, reps: 15 }),
    ]), ex({ reps: '10–15', sets: 2 }), 2)
    expect(out.nextWeightKg).toBe(28)
  })

  it('tells bodyweight work to change variation, since there is no load to add', () => {
    const out = progressionAdvice(session([
      set({ setId: 'a', weightKg: 0, reps: 20 }),
      set({ setId: 'b', weightKg: 0, reps: 20 }),
    ]), ex({ reps: '15–20', sets: 2 }), 2)
    expect(out.verdict).toBe('add-weight')
    expect(out.nextWeightKg).toBeUndefined()
    expect(out.message).toContain('harder variation')
  })

  it('uses seconds rather than reps for a timed hold', () => {
    const out = progressionAdvice(session([
      set({ setId: 'a', weightKg: 0, reps: 40 }),
    ]), ex({ reps: '30–60 sec', sets: 1 }), 1)
    expect(out.message).toContain('60 sec')
  })

  it('stays silent when the exercise has no parseable range', () => {
    expect(progressionAdvice(session([set()]), ex({ reps: 'to failure' }), 1).verdict).toBe('none')
  })
})

describe('suggestedWeight', () => {
  it('repeats the weight of the previous set in this session', () => {
    expect(suggestedWeight([set({ weightKg: 24 }), set({ setId: 'b', weightKg: 26 })], null)).toBe(26)
  })

  it('falls back to last session’s top set', () => {
    expect(suggestedWeight([], session([set({ weightKg: 22 })]))).toBe(22)
  })

  it('suggests nothing at all on a first-ever session', () => {
    // The card already shows an estimated starting load; inventing a number
    // here would quietly become logged history.
    expect(suggestedWeight([], null)).toBeNull()
  })
})

describe('describeSession', () => {
  it('collapses a constant weight into one figure', () => {
    expect(describeSession(session([
      set({ setId: 'a', weightKg: 22, reps: 12 }),
      set({ setId: 'b', weightKg: 22, reps: 10 }),
    ]))).toBe('22 kg × 12, 10')
  })

  it('names bodyweight rather than showing 0 kg', () => {
    expect(describeSession(session([set({ weightKg: 0, reps: 20 })]))).toBe('bodyweight × 20')
  })

  it('lists each set when the weight changed', () => {
    expect(describeSession(session([
      set({ setId: 'a', weightKg: 22, reps: 12 }),
      set({ setId: 'b', weightKg: 24, reps: 8 }),
    ]))).toBe('22×12, 24×8')
  })

  it('marks seconds for a timed hold', () => {
    expect(describeSession(session([set({ weightKg: 0, reps: 45 })]), true)).toBe('bodyweight × 45s')
  })

  it('handles an empty session', () => {
    expect(describeSession(session([]))).toBe('nothing logged')
  })
})

describe('loggedDates and daySummary', () => {
  const sets = [
    set({ setId: 'a', date: '2026-09-16', weightKg: 24, reps: 10 }),
    set({ setId: 'b', date: '2026-09-16', exerciseId: 'db-row', weightKg: 20, reps: 10 }),
    set({ setId: 'c', date: '2026-09-09', weightKg: 22, reps: 10 }),
  ]

  it('lists dates newest first', () => {
    expect(loggedDates(sets)).toEqual(['2026-09-16', '2026-09-09'])
  })

  it('rolls a day up into exercise, set and volume counts', () => {
    expect(daySummary(sets, '2026-09-16')).toEqual({
      date: '2026-09-16',
      exerciseCount: 2,
      setCount: 2,
      volume: 440,
    })
  })

  it('is empty for an untrained day', () => {
    expect(daySummary(sets, '2026-09-10')).toEqual({
      date: '2026-09-10', exerciseCount: 0, setCount: 0, volume: 0,
    })
  })

  it('counts a bodyweight set without adding it to volume', () => {
    const out = daySummary([...sets, set({ setId: 'd', date: '2026-09-16', exerciseId: 'plank', weightKg: 0, reps: 60 })], '2026-09-16')
    expect(out.exerciseCount).toBe(3)
    expect(out.setCount).toBe(3)
    expect(out.volume).toBe(440)
  })
})
