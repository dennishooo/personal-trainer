import { Icon, type IconName } from '@/components/icons'

/**
 * Hand-based portioning. Your hand scales with your body, so it travels with
 * you to a restaurant where a food scale does not.
 *
 * Deliberately no hand pictograms: at icon scale an open palm, a fist and a
 * cupped hand are near-indistinguishable, and an ambiguous picture reads worse
 * than none. The food icon carries the recognition and the measure is stated
 * in words, with a proportional bar for relative size.
 */
const GUIDES: {
  food: IconName
  label: string
  what: string
  amount: string
  /** Relative visual weight of the portion, 0-1. */
  scale: number
  tone: string
}[] = [
  { food: 'meat', label: '1 palm', what: 'Protein', amount: '≈ 25 g protein', scale: 0.62, tone: 'var(--protein)' },
  { food: 'salad', label: '1 fist', what: 'Vegetables', amount: '≈ 1 serving', scale: 1, tone: 'var(--success)' },
  { food: 'bowl-chopsticks', label: '1 cupped hand', what: 'Carbs', amount: '≈ 25 g carbs', scale: 0.5, tone: 'var(--carb)' },
  { food: 'cheese', label: '1 thumb', what: 'Fats', amount: '≈ 10 g fat', scale: 0.18, tone: 'var(--fat)' },
]

export function HandPortion() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {GUIDES.map((g) => (
        <div
          key={g.label}
          className="flex flex-col items-center rounded-lg border border-border bg-card p-3 text-center"
        >
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ background: `color-mix(in oklch, ${g.tone} 16%, transparent)`, color: g.tone }}
          >
            <Icon name={g.food} size={26} strokeWidth={1.7} />
          </span>

          <div className="mt-2 text-sm font-semibold">{g.label}</div>
          <div className="text-xs font-medium" style={{ color: g.tone }}>
            {g.what}
          </div>

          {/* Relative portion size, so the four are comparable at a glance. */}
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full" style={{ width: `${g.scale * 100}%`, background: g.tone }} />
          </div>

          <div className="mt-1.5 text-[11px] leading-tight text-muted-foreground">{g.amount}</div>
        </div>
      ))}
    </div>
  )
}
