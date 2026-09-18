import { describe, expect, it } from 'vitest'
import { METRICS, metricsFor, type ProgressMetric } from '@/lib/progress-metrics'
import type { ProgressPoint } from '@/lib/workout-log'

describe('metricsFor', () => {
  it('offers the three loaded metrics for weighted work', () => {
    expect(metricsFor(false).map((m) => m.key)).toEqual(['est1RM', 'topWeightKg', 'volume'])
  })

  it('offers only reps for bodyweight work, where the other three are flat zero', () => {
    expect(metricsFor(true).map((m) => m.key)).toEqual(['topReps'])
  })

  it('never returns an empty list, so the chart always has a metric to plot', () => {
    expect(metricsFor(true).length).toBeGreaterThan(0)
    expect(metricsFor(false).length).toBeGreaterThan(0)
  })
})

describe('METRICS', () => {
  it('keys every spec by its own key, which the toggle relies on', () => {
    for (const [key, spec] of Object.entries(METRICS)) {
      expect(spec.key).toBe(key)
    }
  })

  it('names a real ProgressPoint field, so the chart can read the value', () => {
    // A renamed field on ProgressPoint must break this, not silently plot undefined.
    const point: ProgressPoint = { date: '2026-09-16', est1RM: 30, topWeightKg: 24, topReps: 12, volume: 864 }
    for (const spec of Object.values(METRICS)) {
      expect(typeof point[spec.key]).toBe('number')
    }
  })

  it('draws volume as bars and the rest as lines', () => {
    expect(METRICS.volume.shape).toBe('bar')
    expect(METRICS.est1RM.shape).toBe('line')
    expect(METRICS.topWeightKg.shape).toBe('line')
    expect(METRICS.topReps.shape).toBe('line')
  })

  it('rounds reps and volume to whole numbers, estimates to one decimal', () => {
    expect(METRICS.topReps.decimals).toBe(0)
    expect(METRICS.volume.decimals).toBe(0)
    expect(METRICS.est1RM.decimals).toBe(1)
  })

  it('gives every metric a tab and a caption for the toggle and chart heading', () => {
    for (const spec of Object.values(METRICS)) {
      expect(spec.tab.length).toBeGreaterThan(0)
      expect(spec.caption.length).toBeGreaterThan(0)
      expect(spec.label.length).toBeGreaterThan(0)
    }
  })

  it('says in the volume caption that unloaded sets are excluded', () => {
    // The exclusion is the whole reason this is "load volume" and not "work done".
    expect(METRICS.volume.caption).toMatch(/loaded sets only/i)
  })

  it('covers every ProgressMetric in the union', () => {
    const keys: ProgressMetric[] = ['est1RM', 'topWeightKg', 'topReps', 'volume']
    expect(Object.keys(METRICS).sort()).toEqual([...keys].sort())
  })
})
