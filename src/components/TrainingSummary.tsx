import { lazy, Suspense, useMemo } from 'react'
import { Activity, Dumbbell, Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { useWorkoutLog } from '@/stores/workout-log'
import { comparePeriods, todayISO, volumeSeries } from '@/lib/workout-log'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatTile } from '@/components/StatTile'
import { cn } from '@/lib/utils'

const VolumeChart = lazy(() => import('./VolumeChart').then((m) => ({ default: m.VolumeChart })))

/**
 * Last seven days of training against the seven before — the view that answers
 * "am I actually doing more than last month?", which no single exercise card
 * can show.
 *
 * Anchored to today rather than to the log date: the log date follows whichever
 * session you are back-filling, and a summary that jumped around with it would
 * not be a summary of now.
 */
export function TrainingSummary() {
  const sets = useWorkoutLog((s) => s.sets)
  const today = todayISO()

  const { current, previous, volumeChangePct } = useMemo(
    () => comparePeriods(sets, today),
    [sets, today],
  )
  const series = useMemo(() => volumeSeries(sets, today, 28), [sets, today])

  // Nothing logged in a fortnight is a blank slate, not a decline — the card
  // would otherwise shout "0 kg, down 100%" at someone coming back from a break.
  if (current.setCount === 0 && previous.setCount === 0) return null

  const trend = volumeChangePct == null ? 'flat' : volumeChangePct > 2 ? 'up' : volumeChangePct < -2 ? 'down' : 'flat'
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Activity size={15} /> Last 7 days
        </CardTitle>
        <CardDescription>
          Against the seven days before. Load volume counts weight × reps on loaded sets —
          bodyweight and timed holds are real work but have no kg to total, so they sit outside it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile
            label="Sessions"
            value={current.sessionCount}
            unit={`day${current.sessionCount === 1 ? '' : 's'}`}
            sub={`${previous.sessionCount} the week before`}
          />
          <StatTile
            label="Sets"
            value={current.setCount}
            sub={`${previous.setCount} the week before`}
          />
          <StatTile
            label="Load volume"
            value={current.volume.toLocaleString()}
            unit="kg"
            icon={<Dumbbell size={14} />}
            tone={trend === 'up' ? 'success' : undefined}
            sub={
              volumeChangePct == null ? (
                'No comparison yet'
              ) : (
                <span
                  className={cn(
                    'inline-flex items-center gap-1',
                    trend === 'up' && 'text-[var(--success)]',
                    trend === 'down' && 'text-[var(--warning)]',
                  )}
                >
                  <TrendIcon size={12} />
                  {volumeChangePct > 0 ? '+' : ''}
                  {volumeChangePct}% vs {previous.volume.toLocaleString()} kg
                </span>
              )
            }
          />
        </div>

        <div>
          <div className="mb-1 text-xs font-medium text-muted-foreground">
            Daily load volume — last 4 weeks
          </div>
          <Suspense fallback={<div className="h-32 w-full animate-pulse rounded-lg bg-secondary" />}>
            <VolumeChart data={series} />
          </Suspense>
        </div>
      </CardContent>
    </Card>
  )
}
