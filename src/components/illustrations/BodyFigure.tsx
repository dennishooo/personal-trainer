/**
 * A simple front-facing figure whose silhouette narrows as BMI falls, giving a
 * non-numeric read on progress. Deliberately abstract — this is a progress
 * indicator, not a body-composition claim.
 */
export function BodyFigure({ bmi, size = 150 }: { bmi: number; size?: number }) {
  // Map BMI 18–32 onto a torso width so the shape responds to real change.
  const t = Math.max(0, Math.min(1, (bmi - 18) / 14))
  const waist = 15 + t * 15
  const chest = 21 + t * 10
  const tone = bmi < 23 ? 'var(--success)' : bmi < 25 ? 'var(--warning)' : 'var(--destructive)'

  return (
    <svg viewBox="0 0 120 190" width={size} height={size * 1.58} role="img" aria-label={`Body outline at BMI ${bmi}`}>
      <defs>
        <linearGradient id="bodyFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tone} stopOpacity="0.28" />
          <stop offset="100%" stopColor={tone} stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* head */}
      <circle cx="60" cy="22" r="14" fill="url(#bodyFill)" stroke={tone} strokeWidth="2" />

      {/* torso — waist and chest interpolate with BMI */}
      <path
        d={`M ${60 - chest} 44
            C ${60 - chest - 3} 62, ${60 - waist} 74, ${60 - waist} 96
            L ${60 - waist + 2} 112
            L ${60 + waist - 2} 112
            L ${60 + waist} 96
            C ${60 + waist} 74, ${60 + chest + 3} 62, ${60 + chest} 44 Z`}
        fill="url(#bodyFill)"
        stroke={tone}
        strokeWidth="2"
        strokeLinejoin="round"
        style={{ transition: 'd 600ms ease' }}
      />

      {/* arms */}
      <path
        d={`M ${60 - chest} 48 C ${60 - chest - 12} 66, ${60 - chest - 14} 86, ${60 - chest - 11} 104`}
        fill="none"
        stroke={tone}
        strokeWidth="7"
        strokeLinecap="round"
        style={{ transition: 'd 600ms ease' }}
      />
      <path
        d={`M ${60 + chest} 48 C ${60 + chest + 12} 66, ${60 + chest + 14} 86, ${60 + chest + 11} 104`}
        fill="none"
        stroke={tone}
        strokeWidth="7"
        strokeLinecap="round"
        style={{ transition: 'd 600ms ease' }}
      />

      {/* legs */}
      <path
        d={`M ${60 - waist + 6} 112 C ${60 - waist + 3} 138, ${60 - waist + 4} 158, ${60 - waist + 5} 178`}
        fill="none"
        stroke={tone}
        strokeWidth="9"
        strokeLinecap="round"
        style={{ transition: 'd 600ms ease' }}
      />
      <path
        d={`M ${60 + waist - 6} 112 C ${60 + waist - 3} 138, ${60 + waist - 4} 158, ${60 + waist - 5} 178`}
        fill="none"
        stroke={tone}
        strokeWidth="9"
        strokeLinecap="round"
        style={{ transition: 'd 600ms ease' }}
      />
    </svg>
  )
}
