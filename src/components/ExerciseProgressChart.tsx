import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import type { ProgressPoint } from '@/lib/workout-log'
import { METRICS, type ProgressMetric } from '@/lib/progress-metrics'

/**
 * Strength trend for one exercise.  Lazy-loaded like TrendChart — recharts is
 * a heavy import and the Training page is long enough already.
 *
 * Estimated 1RM is the default because it is the only axis that compares a set
 * of 24 kg × 8 against 22 kg × 12. Volume is available alongside it but not
 * as the default: it swings with set count, so dropping a set reads as a
 * collapse even when the lift got stronger.
 */
export function ExerciseProgressChart({ data, metric }: { data: ProgressPoint[]; metric: ProgressMetric }) {
  const spec = METRICS[metric]
  const values = data.map((d) => d[spec.key])
  const max = Math.max(...values)
  const min = Math.min(...values)

  // Bars are only readable against a zero baseline; a trend line is better
  // served by a padded window around the actual range, since the interesting
  // movement is a few kg on top of a large number.
  const domain: [number, number] =
    spec.shape === 'bar'
      ? [0, Math.ceil(max * 1.1) || 1]
      : [Math.floor(min - Math.max(1, (max - min) * 0.15)), Math.ceil(max + Math.max(1, (max - min) * 0.15))]

  const axes = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
      <XAxis
        dataKey="date"
        tickFormatter={(d: string) => d.slice(5)}
        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
        tickLine={false}
        axisLine={{ stroke: 'var(--border)' }}
      />
      <YAxis
        domain={domain}
        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
        tickLine={false}
        axisLine={false}
        width={44}
      />
      <Tooltip
        cursor={{ fill: 'var(--secondary)' }}
        contentStyle={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          fontSize: 12,
          color: 'var(--card-foreground)',
        }}
        labelFormatter={(d) => String(d ?? '')}
        formatter={(v) => [typeof v === 'number' ? v.toFixed(spec.decimals) : String(v ?? ''), spec.label]}
      />
    </>
  )

  return (
    // Explicit pixel height rather than a percentage: ResponsiveContainer
    // needs a sized parent, and this one mounts inside a section that is
    // collapsed until the user opens it.
    <div className="w-full">
      <ResponsiveContainer width="100%" height={192}>
        {spec.shape === 'bar' ? (
          <BarChart data={data} margin={{ top: 5, right: 8, bottom: 0, left: -18 }}>
            {axes}
            {/* Same mount-inside-Suspense stall as VolumeChart — see the note there. */}
            <Bar
              dataKey={spec.key}
              fill="var(--primary)"
              radius={[3, 3, 0, 0]}
              name={spec.label}
              isAnimationActive={false}
            />
          </BarChart>
        ) : (
          <LineChart data={data} margin={{ top: 5, right: 8, bottom: 0, left: -18 }}>
            {axes}
            <Line
              type="monotone"
              dataKey={spec.key}
              stroke="var(--primary)"
              strokeWidth={2}
              dot={{ r: 3, fill: 'var(--primary)' }}
              activeDot={{ r: 5 }}
              name={spec.label}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
