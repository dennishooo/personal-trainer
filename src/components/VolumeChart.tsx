import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DaySummary } from '@/lib/workout-log'

/**
 * Daily load volume across all exercises. Bars rather than a line, and zeros
 * kept in: a rest day is data, and connecting across it with a line would
 * imply work that did not happen.
 */
export function VolumeChart({ data }: { data: DaySummary[] }) {
  const max = Math.max(...data.map((d) => d.volume), 1)

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={128}>
        <BarChart data={data} margin={{ top: 5, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="date"
            // One label a week: 28 daily ticks would overlap into a grey smear.
            tickFormatter={(d: string, i: number) => (i % 7 === 0 ? d.slice(5) : '')}
            interval={0}
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
          />
          <YAxis
            domain={[0, Math.ceil(max * 1.1)]}
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
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
            formatter={(v, _n, item) => {
              const row = item?.payload as DaySummary | undefined
              const vol = typeof v === 'number' ? v.toLocaleString() : String(v ?? '')
              return [row && row.setCount > 0 ? `${vol} kg · ${row.setCount} sets` : 'Rest day', 'Volume']
            }}
          />
          {/*
            Animation off deliberately: the chart mounts behind a Suspense
            fallback, so it lays out once inside a container that was still
            zero-height, and the grow-from-baseline animation never advances
            past its first frame — every bar stays a 2 px sliver.
          */}
          <Bar dataKey="volume" fill="var(--primary)" radius={[2, 2, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
