/**
 * Concentric macro ring. Protein/carb/fat are drawn as arcs of one circle so the
 * relative share is readable at a glance without needing to read the numbers.
 */
export function MacroRing({
  protein,
  carb,
  fat,
  calories,
  size = 180,
}: {
  protein: number
  carb: number
  fat: number
  calories: number
  size?: number
}) {
  const total = protein + carb + fat || 1
  const r = 62
  const c = 2 * Math.PI * r
  const stroke = 16

  const segments = [
    { key: 'protein', value: protein, color: 'var(--protein)' },
    { key: 'carb', value: carb, color: 'var(--carb)' },
    { key: 'fat', value: fat, color: 'var(--fat)' },
  ]

  let offset = 0

  return (
    <svg viewBox="0 0 160 160" width={size} height={size} role="img" aria-label="Macro split">
      <circle cx="80" cy="80" r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
      {segments.map((s) => {
        const len = (s.value / total) * c
        const el = (
          <circle
            key={s.key}
            cx="80"
            cy="80"
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeDasharray={`${len} ${c - len}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
            transform="rotate(-90 80 80)"
            style={{ transition: 'stroke-dasharray 600ms ease, stroke-dashoffset 600ms ease' }}
          />
        )
        offset += len
        return el
      })}
      <text x="80" y="74" textAnchor="middle" className="fill-foreground" fontSize="26" fontWeight="700">
        {calories}
      </text>
      <text x="80" y="92" textAnchor="middle" className="fill-muted-foreground" fontSize="11">
        kcal / day
      </text>
    </svg>
  )
}
