export type Tier = 'core' | 'supporting' | 'optional'
export type TimingKey = 'morning' | 'pre-workout' | 'post-workout' | 'with-meal' | 'evening' | 'anytime'

export interface Supplement {
  id: string
  name: string
  chinese?: string
  tier: Tier
  /** Dose per kg of bodyweight, when the dose should scale with the user. */
  dosePerKg?: number
  doseFixed?: string
  unit?: string
  timing: TimingKey
  why: string
  evidence: 'strong' | 'moderate' | 'limited'
  notes?: string
  hkSource: string
  monthlyHkd: [number, number]
  minAge?: number
}

/**
 * Tiering reflects evidence quality, not marketing. `core` items have
 * randomised-trial support for the stated benefit; `optional` ones are
 * plausible but thin, and are flagged as such rather than quietly included.
 */
export const SUPPLEMENTS: Supplement[] = [
  {
    id: 'whey',
    name: 'Whey protein isolate',
    chinese: '乳清蛋白',
    tier: 'core',
    dosePerKg: 0.3,
    unit: 'g powder',
    timing: 'post-workout',
    why: 'The cheapest way to close a protein gap. Eating out at lunch makes hitting your protein target from food alone unreliable — one scoop covers roughly a quarter of the day.',
    evidence: 'strong',
    notes: 'Isolate over concentrate if dairy bloats you — it is filtered to near-zero lactose. Not required if you already hit protein from food.',
    hkSource: 'iHerb, Muscle Nation HK, Decathlon',
    monthlyHkd: [180, 320],
  },
  {
    id: 'creatine',
    name: 'Creatine monohydrate',
    chinese: '肌酸',
    tier: 'core',
    doseFixed: '3–5',
    unit: 'g',
    timing: 'anytime',
    why: 'The most-studied sports supplement there is. Adds a few reps per set, which compounds into real muscle over months. Timing genuinely does not matter — daily consistency does.',
    evidence: 'strong',
    notes: 'Monohydrate only. "HCl", "buffered" and similar cost more and beat nothing. The 1–2 kg gain in the first weeks is water inside muscle, not fat.',
    hkSource: 'iHerb (Optimum Nutrition), Watsons',
    monthlyHkd: [60, 110],
  },
  {
    id: 'vitamin-d',
    name: 'Vitamin D3',
    chinese: '維他命D3',
    tier: 'core',
    doseFixed: '1000–2000',
    unit: 'IU',
    timing: 'with-meal',
    why: 'Office hours indoors plus the HK habit of avoiding sun makes deficiency common here even with the climate. Low D means worse bone density, mood and strength.',
    evidence: 'strong',
    notes: 'Fat-soluble — take with a meal containing fat or you absorb little. Worth a blood test to set your real dose.',
    hkSource: 'Watsons, Mannings, iHerb',
    monthlyHkd: [30, 60],
  },
  {
    id: 'omega3',
    name: 'Omega-3 (EPA/DHA)',
    chinese: '奧米加3魚油',
    tier: 'core',
    doseFixed: '1000–2000',
    unit: 'mg combined EPA+DHA',
    timing: 'with-meal',
    why: 'Anti-inflammatory; supports joint comfort as you ramp up jogging, and cardiovascular health. Also one of the few things with any real evidence for skin-barrier quality.',
    evidence: 'strong',
    notes: 'Read the EPA+DHA number on the back, not the "1000mg fish oil" on the front — those are different figures. Skip if you eat oily fish 3+ times a week.',
    hkSource: 'Watsons, Mannings, iHerb (Nordic Naturals)',
    monthlyHkd: [80, 180],
  },
  {
    id: 'magnesium',
    name: 'Magnesium glycinate',
    chinese: '甘氨酸鎂',
    tier: 'supporting',
    doseFixed: '200–400',
    unit: 'mg elemental',
    timing: 'evening',
    why: 'Most people eating out regularly fall short. Supports sleep quality and muscle relaxation — both of which drive recovery more than any supplement does.',
    evidence: 'moderate',
    notes: 'Glycinate, not oxide — oxide is poorly absorbed and mostly acts as a laxative.',
    hkSource: 'iHerb, Mannings',
    monthlyHkd: [70, 130],
  },
  {
    id: 'zinc',
    name: 'Zinc',
    chinese: '鋅',
    tier: 'supporting',
    doseFixed: '15–25',
    unit: 'mg',
    timing: 'evening',
    why: 'Supports testosterone, immune function and skin repair. Sweating from daily training raises losses.',
    evidence: 'moderate',
    notes: 'Do not exceed 40 mg/day long-term — chronic high zinc blocks copper absorption. Take away from your calcium or iron.',
    hkSource: 'Watsons, iHerb',
    monthlyHkd: [40, 80],
  },
  {
    id: 'b-complex',
    name: 'B-complex',
    chinese: '維他命B雜',
    tier: 'supporting',
    doseFixed: '1',
    unit: 'capsule',
    timing: 'morning',
    why: 'B12, folate and B6 are the vitamins most clearly tied to hair pigment cells. Correcting a deficiency helps; taking extra beyond that does not.',
    evidence: 'moderate',
    notes: 'Direct relevance to your white hair — but only if you are actually low. Ask for B12 and ferritin on your next blood test before assuming.',
    hkSource: 'Watsons, Mannings',
    monthlyHkd: [50, 100],
  },
  {
    id: 'creatine-caffeine',
    name: 'Caffeine (pre-workout)',
    chinese: '咖啡因',
    tier: 'optional',
    dosePerKg: 3,
    unit: 'mg',
    timing: 'pre-workout',
    why: 'Reliably improves training output and perceived effort. Plain coffee works as well as any powder.',
    evidence: 'strong',
    notes: 'Nothing after 2pm — the half-life is ~5 hours and wrecked sleep costs you more recovery than the session gained. Counts toward your bubble tea caffeine too.',
    hkSource: 'Any coffee shop',
    monthlyHkd: [0, 200],
  },
  {
    id: 'collagen',
    name: 'Collagen peptides',
    chinese: '膠原蛋白',
    tier: 'optional',
    doseFixed: '10–15',
    unit: 'g',
    timing: 'pre-workout',
    why: 'Some evidence for tendon and joint support when taken with vitamin C about an hour before loading. Relevant when you restart running after a long gap.',
    evidence: 'limited',
    notes: 'Skin and hair claims are far weaker than the marketing suggests. Counts toward protein but is an incomplete protein — do not let it replace whey.',
    hkSource: 'iHerb, Mannings',
    monthlyHkd: [100, 220],
  },
  {
    id: 'psyllium',
    name: 'Psyllium husk',
    chinese: '洋車前子殼',
    tier: 'optional',
    doseFixed: '5–10',
    unit: 'g',
    timing: 'evening',
    why: 'A practical fix if eating out leaves you short on fibre. Helps satiety on a deficit and steadies digestion.',
    evidence: 'moderate',
    notes: 'Take with a full glass of water. Prefer vegetables first — this is a backstop, not a replacement.',
    hkSource: 'Mannings, iHerb',
    monthlyHkd: [40, 80],
  },
  {
    id: 'vitamin-c',
    name: 'Vitamin C',
    chinese: '維他命C',
    tier: 'optional',
    doseFixed: '500',
    unit: 'mg',
    timing: 'pre-workout',
    why: 'Mainly here as the cofactor that makes collagen dosing work. Also supports iron absorption from plant sources.',
    evidence: 'limited',
    notes: 'Very large doses around training may actually blunt some adaptation. 500 mg is plenty.',
    hkSource: 'Watsons, Mannings',
    monthlyHkd: [25, 50],
  },
]

export const TIMING_LABELS: Record<TimingKey, { label: string; when: string }> = {
  morning: { label: 'Morning', when: 'With breakfast' },
  'pre-workout': { label: 'Pre-workout', when: '30–60 min before training' },
  'post-workout': { label: 'Post-workout', when: 'Within an hour after training' },
  'with-meal': { label: 'With a meal', when: 'Any meal containing fat' },
  evening: { label: 'Evening', when: 'With dinner or before bed' },
  anytime: { label: 'Anytime', when: 'Consistency matters more than timing' },
}

export const TIER_META: Record<Tier, { label: string; blurb: string }> = {
  core: { label: 'Core', blurb: 'Strong evidence, clear benefit for your situation. Start here.' },
  supporting: { label: 'Supporting', blurb: 'Reasonable evidence. Add once the core four are habit.' },
  optional: { label: 'Optional', blurb: 'Situational or thin evidence. Only if budget and interest allow.' },
}

/** Resolve a per-kg dose against current bodyweight so doses track the user. */
export function resolveDose(s: Supplement, weightKg: number): string {
  if (s.dosePerKg) {
    const v = s.dosePerKg * weightKg
    return `${v < 10 ? v.toFixed(1) : Math.round(v)} ${s.unit ?? ''}`.trim()
  }
  return `${s.doseFixed} ${s.unit ?? ''}`.trim()
}

export function monthlyCost(items: Supplement[]): [number, number] {
  return items.reduce<[number, number]>(
    (acc, s) => [acc[0] + s.monthlyHkd[0], acc[1] + s.monthlyHkd[1]],
    [0, 0],
  )
}
