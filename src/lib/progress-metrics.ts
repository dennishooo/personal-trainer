/**
 * Which metric the per-exercise progress chart plots, and how to label it.
 *
 * Kept out of ExerciseProgressChart.tsx deliberately: SetLogger needs the
 * metric list to render its toggle, and importing that from the chart module
 * would pull recharts into the main bundle and undo the lazy import.
 */

export type ProgressMetric = 'est1RM' | 'topWeightKg' | 'topReps' | 'volume'

export interface MetricSpec {
  key: ProgressMetric
  /** Short label for the toggle button. */
  tab: string
  /** Full label for the tooltip. */
  label: string
  /** The caption above the chart — says what the number means, not just its name. */
  caption: string
  /** Volume is a quantity of work, which reads better as bars than as a trend line. */
  shape: 'line' | 'bar'
  /** Decimal places in the tooltip — 1RM is an estimate, volume is a whole kg count. */
  decimals: number
}

export const METRICS: Record<ProgressMetric, MetricSpec> = {
  est1RM: {
    key: 'est1RM',
    tab: 'Est. 1RM',
    label: 'Est. 1RM (kg)',
    caption: 'Estimated 1RM — the trend, not a lift to attempt',
    shape: 'line',
    decimals: 1,
  },
  topWeightKg: {
    key: 'topWeightKg',
    tab: 'Top weight',
    label: 'Heaviest set (kg)',
    caption: 'Heaviest set per session',
    shape: 'line',
    decimals: 1,
  },
  topReps: {
    key: 'topReps',
    tab: 'Best reps',
    label: 'Best set (reps)',
    caption: 'Best reps per session',
    shape: 'line',
    decimals: 0,
  },
  volume: {
    key: 'volume',
    tab: 'Volume',
    label: 'Load volume (kg)',
    caption: 'Load volume — weight × reps, loaded sets only',
    shape: 'bar',
    decimals: 0,
  },
}

/**
 * The metrics worth offering for an exercise. Bodyweight work has no load, so
 * estimated 1RM, top weight and volume are all flat zero — offering them would
 * be three tabs where only one holds data.
 */
export function metricsFor(bodyweight: boolean): MetricSpec[] {
  return bodyweight ? [METRICS.topReps] : [METRICS.est1RM, METRICS.topWeightKg, METRICS.volume]
}
