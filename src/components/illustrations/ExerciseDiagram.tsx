import type { MuscleGroup } from '@/data/training'
import { Icon, type IconName } from '@/components/icons'

/**
 * Movement-pattern figures.
 *
 * Drawn to the same spec as the Tabler icons bundled in `icons.tsx` — 24x24
 * viewBox, 2px stroke, round caps and joins, head as an r=2 circle — so the
 * hand-drawn figures and the licensed icon set read as one family rather than
 * two. Tabler has no icons for specific barbell lifts, which is why these
 * exist at all.
 */
const FIGURES: Record<string, { title: string; body: React.ReactNode }> = {
  squat: {
    title: 'Squat pattern',
    body: (
      <>
        {/* front view: bar across the shoulders, clear of the head */}
        <path d="M4 8.5h16" />
        <path d="M5.5 7v3M18.5 7v3" />
        <circle cx="12" cy="4" r="2" />
        {/* neck into the bar */}
        <path d="M12 6v2.5" />
        {/* torso down to the hips */}
        <path d="M12 8.5v4.5" />
        {/* thighs out to the knees, then shins down — the bottom position */}
        <path d="M12 13l-3.5 2.5v3M12 13l3.5 2.5v3" />
      </>
    ),
  },
  hinge: {
    title: 'Hinge pattern',
    body: (
      <>
        {/* torso near-horizontal, hips pushed back */}
        <circle cx="5.5" cy="7" r="2" />
        <path d="M7.5 7.5l6 1.5" />
        {/* arms hanging straight down to the bar */}
        <path d="M9.5 8v5" />
        <path d="M6.5 13h6" />
        {/* legs, soft knee */}
        <path d="M13.5 9l1.5 4.5l-.5 4" />
        <path d="M12.5 17.5h4" />
      </>
    ),
  },
  push: {
    title: 'Press pattern',
    body: (
      <>
        {/* bar locked out overhead, plates on the ends */}
        <path d="M4 3h16" />
        <path d="M6 1.5v3M18 1.5v3" />
        {/* arms pressed straight up */}
        <path d="M9.5 8.5l.5 -5.5M14.5 8.5l-.5 -5.5" />
        <circle cx="12" cy="10.5" r="2" />
        {/* braced torso, feet planted */}
        <path d="M12 12.5v4" />
        <path d="M12 16.5l-2 4M12 16.5l2 4" />
      </>
    ),
  },
  pull: {
    title: 'Pull pattern',
    body: (
      <>
        {/* fixed bar with hands gripping it */}
        <path d="M3 4h18" />
        <circle cx="8.5" cy="4" r="1" />
        <circle cx="15.5" cy="4" r="1" />
        {/* arms bent, elbows flared — mid-pull, not a dead hang */}
        <path d="M8.5 5l1.5 3.5M15.5 5l-1.5 3.5" />
        <circle cx="12" cy="7" r="2" />
        {/* torso hanging, knees tucked back behind */}
        <path d="M12 9v5" />
        <path d="M12 14l-2.5 3l1 3" />
        <path d="M12 14l2.5 3l-1 3" />
      </>
    ),
  },
  core: {
    title: 'Core brace',
    body: (
      <>
        {/* plank — one straight line from head to heels */}
        <circle cx="4.5" cy="9" r="2" />
        <path d="M6.5 9.5l12 2" />
        {/* forearm support */}
        <path d="M7 10.5v5" />
        <path d="M4.5 15.5h4" />
        {/* legs to the toes */}
        <path d="M18.5 11.5l1 4" />
        <path d="M17.5 15.5h4" />
      </>
    ),
  },
  run: {
    title: 'Running gait',
    body: (
      <>
        <circle cx="13" cy="4.5" r="2" />
        {/* forward-leaning torso */}
        <path d="M12.5 6.5l-1 5" />
        {/* opposite arm drive */}
        <path d="M12 8l3.5 -1.5M12 8.5l-3.5 2" />
        {/* split stride — one leg driving, one trailing */}
        <path d="M11.5 11.5l3 3l-.5 4" />
        <path d="M11.5 11.5l-3.5 2.5l1 3.5" />
      </>
    ),
  },
}

export function PatternFigure({ pattern, size = 96 }: { pattern: keyof typeof FIGURES; size?: number }) {
  const f = FIGURES[pattern] ?? FIGURES.squat
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary"
      role="img"
      aria-label={f.title}
    >
      {f.body}
    </svg>
  )
}

/** Equipment icon shown alongside each exercise, from the Tabler set. */
export function EquipmentIcon({ id, size = 20 }: { id: string; size?: number }) {
  const name: IconName = /pullup|pulldown|row|face-pull/.test(id)
    ? 'weight'
    : /deadlift|squat|bench|ohp|press|thrust/.test(id)
      ? 'barbell'
      : /curl|raise|pushdown|extension/.test(id)
        ? 'dumbbell'
        : /plank|knee/.test(id)
          ? 'stretching'
          : 'barbell'
  return <Icon name={name} size={size} />
}

/**
 * Simplified body map highlighting the muscles a movement trains. Rounded
 * shapes and a 24-wide coordinate space keep it in step with the icon set.
 */
export function MuscleMap({ groups, size = 84 }: { groups: MuscleGroup[]; size?: number }) {
  const lit = (g: MuscleGroup) => groups.includes(g) || groups.includes('full')
  const fill = (g: MuscleGroup) => (lit(g) ? 'var(--primary)' : 'var(--muted-foreground)')
  const op = (g: MuscleGroup) => (lit(g) ? 0.9 : 0.25)

  return (
    <svg
      viewBox="0 0 24 40"
      width={size}
      height={size * 1.66}
      role="img"
      aria-label={`Muscles worked: ${groups.join(', ')}`}
    >
      {/* head */}
      <circle cx="12" cy="4" r="2.6" fill="var(--muted-foreground)" opacity="0.25" />
      {/* shoulders */}
      <circle cx="6.6" cy="10" r="2.5" fill={fill('shoulders')} opacity={op('shoulders')} />
      <circle cx="17.4" cy="10" r="2.5" fill={fill('shoulders')} opacity={op('shoulders')} />
      {/* chest */}
      <rect x="7.5" y="8.2" width="9" height="5" rx="2.2" fill={fill('chest')} opacity={op('chest')} />
      {/* upper back */}
      <rect x="8" y="13.4" width="8" height="4.4" rx="1.8" fill={fill('back')} opacity={op('back')} />
      {/* arms */}
      <rect x="3.6" y="12.5" width="2.8" height="7.5" rx="1.4" fill={fill('arms')} opacity={op('arms')} />
      <rect x="17.6" y="12.5" width="2.8" height="7.5" rx="1.4" fill={fill('arms')} opacity={op('arms')} />
      {/* core */}
      <rect x="8.6" y="18" width="6.8" height="5.6" rx="1.8" fill={fill('core')} opacity={op('core')} />
      {/* legs */}
      <rect x="8" y="24" width="3.4" height="12" rx="1.7" fill={fill('legs')} opacity={op('legs')} />
      <rect x="12.6" y="24" width="3.4" height="12" rx="1.7" fill={fill('legs')} opacity={op('legs')} />
    </svg>
  )
}

/** Map an exercise id onto its movement pattern. */
export function patternFor(exerciseId: string): keyof typeof FIGURES {
  if (/squat|leg-press|split|extension/.test(exerciseId)) return 'squat'
  if (/deadlift|rdl|thrust|leg-curl/.test(exerciseId)) return 'hinge'
  if (/bench|press|pushdown|lateral-raise|ohp|calf/.test(exerciseId)) return 'push'
  if (/row|pulldown|pullup|face-pull|db-curl/.test(exerciseId)) return 'pull'
  if (/plank|knee-raise/.test(exerciseId)) return 'core'
  return 'squat'
}
