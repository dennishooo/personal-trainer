import {
  Area, AreaChart, CartesianGrid, Line, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

export interface TrendPoint {
  date: string
  label: string
  weight: number
  trend: number
}

/** Split out from WeightChart so recharts is code-split into its own chunk. */
export function TrendChart({
  data,
  domain,
  range,
}: {
  data: TrendPoint[]
  domain: number[]
  range: { min: number; max: number }
}) {
  return (
    <div className="h-64 w-full">

            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                <YAxis domain={domain} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} width={44} />
                <ReferenceArea y1={range.min} y2={range.max} fill="var(--success)" fillOpacity={0.08} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    fontSize: 12,
                    color: 'var(--foreground)',
                  }}
                  formatter={(v, name) => [
                    typeof v === 'number' ? `${v.toFixed(1)} kg` : String(v ?? ''),
                    name === 'trend' ? 'Trend' : 'Logged',
                  ]}
                />
                <Area type="monotone" dataKey="trend" stroke="var(--primary)" strokeWidth={2.5} fill="url(#trendFill)" />
                <Line type="monotone" dataKey="weight" stroke="var(--muted-foreground)" strokeWidth={1} strokeDasharray="3 3" dot={{ r: 2.5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
  )
}
