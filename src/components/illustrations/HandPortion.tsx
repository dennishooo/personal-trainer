/**
 * Hand-based portioning. Your hand scales with your body, so it travels with you
 * to a restaurant where a food scale does not.
 */
const GUIDES = [
  { id: 'palm', label: 'Palm', what: 'Protein', amount: '1 palm ≈ 25 g protein', tone: 'var(--protein)' },
  { id: 'fist', label: 'Fist', what: 'Vegetables', amount: '1 fist ≈ 1 serving', tone: 'var(--success)' },
  { id: 'cup', label: 'Cupped hand', what: 'Carbs', amount: '1 cupped hand ≈ 25 g carbs', tone: 'var(--carb)' },
  { id: 'thumb', label: 'Thumb', what: 'Fats', amount: '1 thumb ≈ 10 g fat', tone: 'var(--fat)' },
]

function PalmIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 60 60" className="h-14 w-14">
      <path d="M20 50 L20 26 Q20 22 24 22 Q28 22 28 26 L28 14 Q28 10 32 10 Q36 10 36 14 L36 26 Q36 22 40 22 Q44 22 44 26 L44 42 Q44 50 36 52 L26 52 Q20 52 20 50 Z"
        fill={color} opacity="0.25" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

function FistIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 60 60" className="h-14 w-14">
      <rect x="17" y="22" width="28" height="26" rx="11" fill={color} opacity="0.25" stroke={color} strokeWidth="2" />
      <path d="M22 26 h18 M22 33 h18 M22 40 h18" stroke={color} strokeWidth="1.5" opacity="0.6" />
    </svg>
  )
}

function CupIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 60 60" className="h-14 w-14">
      <path d="M14 28 Q14 46 30 46 Q46 46 46 28 Q40 34 30 34 Q20 34 14 28 Z"
        fill={color} opacity="0.25" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <path d="M18 24 Q30 30 42 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </svg>
  )
}

function ThumbIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 60 60" className="h-14 w-14">
      <rect x="24" y="16" width="14" height="30" rx="7" fill={color} opacity="0.25" stroke={color} strokeWidth="2" />
      <path d="M27 24 h8" stroke={color} strokeWidth="1.5" opacity="0.6" />
    </svg>
  )
}

const ICONS = { palm: PalmIcon, fist: FistIcon, cup: CupIcon, thumb: ThumbIcon }

export function HandPortion() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {GUIDES.map((g) => {
        const Icon = ICONS[g.id as keyof typeof ICONS]
        return (
          <div key={g.id} className="flex flex-col items-center rounded-lg border border-border bg-card p-3 text-center">
            <Icon color={g.tone} />
            <div className="mt-1 text-sm font-semibold">{g.label}</div>
            <div className="text-xs font-medium" style={{ color: g.tone }}>{g.what}</div>
            <div className="mt-1 text-[11px] leading-tight text-muted-foreground">{g.amount}</div>
          </div>
        )
      })}
    </div>
  )
}
