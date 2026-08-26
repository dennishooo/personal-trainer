import type { MuscleGroup } from '@/data/training'

/**
 * A stick-figure diagram per movement pattern, plus a body map highlighting the
 * muscles worked. Enough to confirm you have the right movement in mind without
 * pretending to replace a coach.
 */
const FIGURES: Record<string, { title: string; path: React.ReactNode }> = {
  squat: {
    title: 'Squat pattern',
    path: (
      <>
        <circle cx="50" cy="16" r="7" />
        <path d="M50 23 L50 46" />
        <path d="M50 46 L38 62 L38 80" />
        <path d="M50 46 L62 62 L62 80" />
        <path d="M40 30 L60 30" strokeWidth="4" />
        <path d="M34 80 L44 80 M56 80 L66 80" strokeWidth="3" />
      </>
    ),
  },
  hinge: {
    title: 'Hinge pattern',
    path: (
      <>
        <circle cx="26" cy="26" r="7" />
        <path d="M32 29 L60 40" />
        <path d="M60 40 L62 62 L62 80" />
        <path d="M34 32 L34 62" strokeWidth="3" />
        <path d="M28 62 L42 62" strokeWidth="4" />
        <path d="M56 80 L68 80" strokeWidth="3" />
      </>
    ),
  },
  push: {
    title: 'Press pattern',
    path: (
      <>
        <circle cx="50" cy="20" r="7" />
        <path d="M50 27 L50 52" />
        <path d="M50 32 L36 18" />
        <path d="M50 32 L64 18" />
        <path d="M30 14 L70 14" strokeWidth="4" />
        <path d="M50 52 L42 76 M50 52 L58 76" />
      </>
    ),
  },
  pull: {
    title: 'Pull pattern',
    path: (
      <>
        <path d="M22 12 L78 12" strokeWidth="4" />
        <circle cx="50" cy="32" r="7" />
        <path d="M50 39 L50 62" />
        <path d="M50 34 L36 14" />
        <path d="M50 34 L64 14" />
        <path d="M50 62 L44 82 M50 62 L56 82" />
      </>
    ),
  },
  core: {
    title: 'Core brace',
    path: (
      <>
        <circle cx="22" cy="40" r="7" />
        <path d="M29 44 L74 52" />
        <path d="M34 46 L32 72" strokeWidth="3" />
        <path d="M74 52 L78 74" strokeWidth="3" />
        <path d="M24 72 L42 72 M70 74 L86 74" strokeWidth="3" />
      </>
    ),
  },
  run: {
    title: 'Running gait',
    path: (
      <>
        <circle cx="54" cy="16" r="7" />
        <path d="M54 23 L48 46" />
        <path d="M52 30 L68 24" />
        <path d="M52 32 L36 40" />
        <path d="M48 46 L60 62 L58 80" />
        <path d="M48 46 L34 58 L38 72" />
      </>
    ),
  },
}

export function PatternFigure({ pattern, size = 96 }: { pattern: keyof typeof FIGURES; size?: number }) {
  const f = FIGURES[pattern] ?? FIGURES.squat
  return (
    <svg viewBox="0 0 100 92" width={size} height={size * 0.92} role="img" aria-label={f.title}>
      <g fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {f.path}
      </g>
    </svg>
  )
}

/** Highlight the muscle groups a movement trains on a simplified body map. */
export function MuscleMap({ groups, size = 84 }: { groups: MuscleGroup[]; size?: number }) {
  const on = (g: MuscleGroup) => (groups.includes(g) || groups.includes('full') ? 'var(--primary)' : 'var(--muted)')
  const op = (g: MuscleGroup) => (groups.includes(g) || groups.includes('full') ? 0.85 : 0.4)

  return (
    <svg viewBox="0 0 70 120" width={size} height={size * 1.7} role="img" aria-label="Muscles worked">
      <circle cx="35" cy="12" r="8" fill="var(--muted)" opacity="0.4" />
      {/* shoulders */}
      <ellipse cx="20" cy="28" rx="7" ry="6" fill={on('shoulders')} opacity={op('shoulders')} />
      <ellipse cx="50" cy="28" rx="7" ry="6" fill={on('shoulders')} opacity={op('shoulders')} />
      {/* chest */}
      <rect x="23" y="26" width="24" height="14" rx="5" fill={on('chest')} opacity={op('chest')} />
      {/* back sits behind the chest block */}
      <rect x="24" y="40" width="22" height="12" rx="4" fill={on('back')} opacity={op('back')} />
      {/* arms */}
      <rect x="12" y="36" width="7" height="20" rx="3.5" fill={on('arms')} opacity={op('arms')} />
      <rect x="51" y="36" width="7" height="20" rx="3.5" fill={on('arms')} opacity={op('arms')} />
      {/* core */}
      <rect x="26" y="52" width="18" height="16" rx="4" fill={on('core')} opacity={op('core')} />
      {/* legs */}
      <rect x="24" y="70" width="9" height="34" rx="4.5" fill={on('legs')} opacity={op('legs')} />
      <rect x="37" y="70" width="9" height="34" rx="4.5" fill={on('legs')} opacity={op('legs')} />
    </svg>
  )
}

/** Map an exercise id onto its movement pattern for the figure above. */
export function patternFor(exerciseId: string): keyof typeof FIGURES {
  if (/squat|leg-press|split|extension/.test(exerciseId)) return 'squat'
  if (/deadlift|rdl|thrust|curl$/.test(exerciseId)) return 'hinge'
  if (/bench|press|pushdown|raise/.test(exerciseId)) return 'push'
  if (/row|pulldown|pullup|face-pull/.test(exerciseId)) return 'pull'
  if (/plank|knee-raise/.test(exerciseId)) return 'core'
  return 'squat'
}
