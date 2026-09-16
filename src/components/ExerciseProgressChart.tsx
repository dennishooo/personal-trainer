import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import type { ProgressPoint } from '@/lib/workout-log'

/**
 * Strength trend for one exercise. Lazy-loaded like TrendChart — recharts is
 * a heavy import and the Training page is long enough already.
 *
 * Loaded work plots estimated 1RM, which is the only way to compare a set of
 * 24 kg × 8 against 22 kg × 12 on one axis. Bodyweight work has no load to
 * extrapolate from, so it plots best reps instead.
 */
export function ExerciseProgressChart({ data, bodyweight }: { data: ProgressPoint[]; bodyweight: boolean }) {
  const key = bodyweight ? 'topReps' : 'est1RM'
  const label = bodyweight ? 'Best reps' : 'Est. 1RM (kg)'
  const values = data.map((d) => d[key])
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = Math.max(1, (max - min) * 0.15)

  return (
    // Explicit pixel height rather than a percentage: ResponsiveContainer
    // needs a sized parent, and this one mounts inside a section that is
    // collapsed until the user opens it.
    <div className="w-full">
      <ResponsiveContainer width="100%" height={192}>
        <LineChart data={data} margin={{ top: 5, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => d.slice(5)}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
          />
          <YAxis
            domain={[Math.floor(min - pad), Math.ceil(max + pad)]}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 12,
              color: 'var(--card-foreground)',
            }}
            labelFormatter={(d) => String(d ?? '')}
            formatter={(v) => [typeof v === 'number' ? v.toFixed(1) : String(v ?? ''), label]}
          />
          <Line
            type="monotone"
            dataKey={key}
            stroke="var(--primary)"
            strokeWidth={2}
            dot={{ r: 3, fill: 'var(--primary)' }}
            activeDot={{ r: 5 }}
            name={label}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
