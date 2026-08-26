/**
 * A front-facing figure whose silhouette narrows as BMI falls, giving a
 * non-numeric read on progress. Deliberately abstract — a progress indicator,
 * not a body-composition claim.
 *
 * Drawn with rounded joins and a 1.6px stroke on a 24-wide grid so it sits in
 * the same visual family as the Tabler icon set used elsewhere.
 */
export function BodyFigure({ bmi, size = 150 }: { bmi: number; size?: number }) {
  // Map BMI 18–32 onto torso width so the shape responds to real change.
  const t = Math.max(0, Math.min(1, (bmi - 18) / 14))
  const waist = 3.2 + t * 2.6
  const chest = 4.4 + t * 1.8
  const tone = bmi < 23 ? 'var(--success)' : bmi < 25 ? 'var(--warning)' : 'var(--destructive)'

  return (
    <svg
      viewBox="0 0 24 40"
      width={size}
      height={size * 1.66}
      fill="none"
      stroke={tone}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={`Body outline at BMI ${bmi}`}
    >
      <defs>
        <linearGradient id="bodyFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tone} stopOpacity="0.22" />
          <stop offset="100%" stopColor={tone} stopOpacity="0.06" />
        </linearGradient>
      </defs>

      <circle cx="12" cy="4.2" r="2.8" fill="url(#bodyFill)" />

      {/* torso — chest and waist interpolate with BMI */}
      <path
        d={`M ${12 - chest} 9
            C ${12 - chest - 0.5} 13, ${12 - waist} 16, ${12 - waist} 21
            L ${12 - waist + 0.4} 24
            L ${12 + waist - 0.4} 24
            L ${12 + waist} 21
            C ${12 + waist} 16, ${12 + chest + 0.5} 13, ${12 + chest} 9 Z`}
        fill="url(#bodyFill)"
        style={{ transition: 'd 600ms ease' }}
      />

      {/* arms */}
      <path
        d={`M ${12 - chest} 9.8 C ${12 - chest - 2.2} 13, ${12 - chest - 2.6} 17, ${12 - chest - 2} 21.5`}
        style={{ transition: 'd 600ms ease' }}
      />
      <path
        d={`M ${12 + chest} 9.8 C ${12 + chest + 2.2} 13, ${12 + chest + 2.6} 17, ${12 + chest + 2} 21.5`}
        style={{ transition: 'd 600ms ease' }}
      />

      {/* legs */}
      <path
        d={`M ${12 - waist + 1} 24 C ${12 - waist + 0.6} 29, ${12 - waist + 0.8} 33, ${12 - waist + 1} 37`}
        style={{ transition: 'd 600ms ease' }}
      />
      <path
        d={`M ${12 + waist - 1} 24 C ${12 + waist - 0.6} 29, ${12 + waist - 0.8} 33, ${12 + waist - 1} 37`}
        style={{ transition: 'd 600ms ease' }}
      />
    </svg>
  )
}
