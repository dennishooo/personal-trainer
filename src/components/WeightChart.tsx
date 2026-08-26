import { lazy, Suspense, useMemo, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { usePlan } from '@/stores/profile'
import { ewma } from '@/lib/adjust'

const TrendChart = lazy(() => import('./TrendChart').then((m) => ({ default: m.TrendChart })))
import { targetWeightRange } from '@/lib/nutrition'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function WeightChart() {
  const { weights, profile, addWeight, removeWeight } = usePlan()
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [value, setValue] = useState('')

  const range = targetWeightRange(profile.heightCm)

  const data = useMemo(() => {
    const smoothed = ewma(weights)
    return weights
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((w, i) => ({
        date: w.date,
        label: w.date.slice(5),
        weight: w.weightKg,
        trend: smoothed[i]?.value ?? w.weightKg,
      }))
  }, [weights])

  const domain = useMemo(() => {
    const all = data.flatMap((d) => [d.weight, d.trend])
    if (!all.length) return [60, 90]
    return [Math.floor(Math.min(...all, range.max) - 2), Math.ceil(Math.max(...all) + 2)]
  }, [data, range.max])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const kg = parseFloat(value)
    if (!Number.isFinite(kg) || kg < 30 || kg > 250) return
    addWeight({ date, weightKg: +kg.toFixed(1) })
    setValue('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight trend</CardTitle>
        <CardDescription>
          The solid line is the smoothed trend — that is the one to read. Individual weigh-ins swing
          a kilo or more from water and food weight alone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Weight (kg)
            <input
              type="number"
              step="0.1"
              min="30"
              max="250"
              placeholder="78.8"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-9 w-28 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </label>
          <Button type="submit" size="md">
            <Plus size={15} /> Log
          </Button>
        </form>

        {data.length >= 2 ? (
          <Suspense fallback={<div className="h-64 w-full animate-pulse rounded-lg bg-secondary" />}>
            <TrendChart data={data} domain={domain} range={range} />
          </Suspense>
        ) : (
          <p className="rounded-lg border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            Log at least two weigh-ins to see the trend.
          </p>
        )}

        {weights.length > 0 && (
          <div className="max-h-40 overflow-y-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <tbody>
                {weights
                  .slice()
                  .reverse()
                  .map((w) => (
                    <tr key={w.date} className="border-b border-border last:border-0">
                      <td className="px-3 py-1.5 text-muted-foreground">{w.date}</td>
                      <td className="px-3 py-1.5 text-right font-medium tabular-nums">{w.weightKg.toFixed(1)} kg</td>
                      <td className="w-10 px-2 py-1.5 text-right">
                        <button
                          onClick={() => removeWeight(w.date)}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                          aria-label={`Delete entry for ${w.date}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Weigh yourself at the same time each day — first thing, after the toilet, before eating.
          Same conditions is what makes the numbers comparable.
        </p>
      </CardContent>
    </Card>
  )
}
