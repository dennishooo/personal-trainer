import { Icon } from '@/components/icons'

/**
 * The plate model — a portioning heuristic for meals you have not weighed,
 * which is every lunch you eat out. Half the plate to vegetables, a quarter
 * each to protein and carbohydrate.
 *
 * Food icons sit inside each section so the rule is legible without reading
 * the labels.
 */
export function PlateModel({ size = 220 }: { size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label="Plate portioning model">
        {/* rim */}
        <circle cx="100" cy="100" r="92" fill="var(--card)" stroke="var(--border)" strokeWidth="2" />
        <circle cx="100" cy="100" r="82" fill="none" stroke="var(--border)" strokeWidth="1.5" />

        {/* left half — vegetables */}
        <path d="M 100 20 A 80 80 0 0 0 100 180 Z" fill="var(--success)" opacity="0.16" />
        {/* top right quarter — protein */}
        <path d="M 100 20 A 80 80 0 0 1 180 100 L 100 100 Z" fill="var(--protein)" opacity="0.16" />
        {/* bottom right quarter — carbs */}
        <path d="M 180 100 A 80 80 0 0 1 100 180 L 100 100 Z" fill="var(--carb)" opacity="0.16" />

        {/* dividers */}
        <line x1="100" y1="20" x2="100" y2="180" stroke="var(--border)" strokeWidth="1.5" />
        <line x1="100" y1="100" x2="180" y2="100" stroke="var(--border)" strokeWidth="1.5" />

        <text x="55" y="112" textAnchor="middle" className="fill-foreground" fontSize="13" fontWeight="600">
          ½ plate
        </text>
        <text x="55" y="126" textAnchor="middle" className="fill-muted-foreground" fontSize="10">
          Vegetables
        </text>

        <text x="141" y="72" textAnchor="middle" className="fill-foreground" fontSize="12" fontWeight="600">
          ¼
        </text>
        <text x="141" y="85" textAnchor="middle" className="fill-muted-foreground" fontSize="10">
          Protein
        </text>

        <text x="141" y="139" textAnchor="middle" className="fill-foreground" fontSize="12" fontWeight="600">
          ¼
        </text>
        <text x="141" y="152" textAnchor="middle" className="fill-muted-foreground" fontSize="10">
          Carbs
        </text>
      </svg>

      {/* Food icons overlaid in each section, positioned as a fraction of size
          so they track the plate at any scale. */}
      <Icon
        name="salad"
        size={size * 0.17}
        className="absolute -translate-x-1/2 -translate-y-1/2 text-[var(--success)]"
        style={{ left: '27%', top: '43%' }}
      />
      <Icon
        name="fish"
        size={size * 0.14}
        className="absolute -translate-x-1/2 -translate-y-1/2 text-[var(--protein)]"
        style={{ left: '70%', top: '27%' }}
      />
      <Icon
        name="bowl-chopsticks"
        size={size * 0.14}
        className="absolute -translate-x-1/2 -translate-y-1/2 text-[var(--carb)]"
        style={{ left: '70%', top: '73%' }}
      />
    </div>
  )
}
