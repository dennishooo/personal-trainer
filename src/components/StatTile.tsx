import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export function StatTile({
  label,
  value,
  unit,
  sub,
  icon,
  tone,
  className,
}: {
  label: string
  value: ReactNode
  unit?: string
  sub?: ReactNode
  icon?: ReactNode
  tone?: 'success' | 'warning' | 'destructive'
  className?: string
}) {
  const toneColor =
    tone === 'success' ? 'var(--success)' : tone === 'warning' ? 'var(--warning)' : tone === 'destructive' ? 'var(--destructive)' : undefined

  return (
    <div className={cn('rounded-xl border border-border bg-card p-4', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums" style={toneColor ? { color: toneColor } : undefined}>
          {value}
        </span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  )
}
