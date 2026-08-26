import { useMemo } from 'react'
import { Check, Info, AlertTriangle } from 'lucide-react'
import { usePlan } from '@/stores/profile'
import {
  SUPPLEMENTS, TIER_META, TIMING_LABELS, resolveDose, monthlyCost,
  type Tier, type TimingKey,
} from '@/data/supplements'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const TIERS: Tier[] = ['core', 'supporting', 'optional']
const TIMING_ORDER: TimingKey[] = ['morning', 'pre-workout', 'post-workout', 'with-meal', 'evening', 'anytime']

const EVIDENCE_TONE = { strong: 'success', moderate: 'warning', limited: 'outline' } as const

export function Supplements() {
  const { profile, supplements, toggleSupplement } = usePlan()

  const selected = useMemo(() => SUPPLEMENTS.filter((s) => supplements.includes(s.id)), [supplements])
  const [lo, hi] = monthlyCost(selected)

  const schedule = useMemo(
    () =>
      TIMING_ORDER.map((t) => ({
        timing: t,
        items: selected.filter((s) => s.timing === t),
      })).filter((g) => g.items.length > 0),
    [selected],
  )

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Supplements</h1>
        <p className="text-sm text-muted-foreground">
          Doses scale with your {profile.weightKg.toFixed(1)} kg where the research supports it. Tick
          what you actually take to build your daily schedule.
        </p>
      </header>

      <Card className="border-[var(--warning)]/40 bg-[var(--warning)]/5">
        <CardContent className="flex gap-3 pt-5">
          <AlertTriangle size={17} className="mt-0.5 shrink-0 text-[var(--warning)]" />
          <div className="space-y-1 text-sm">
            <p>
              <strong>Food first.</strong> Supplements close gaps; they do not substitute for meals,
              sleep or training. Nothing on this page will do much if those three are not in place.
            </p>
            <p className="text-muted-foreground">
              Get a blood panel before committing to a long list — vitamin D, B12 and ferritin in
              particular. Correcting a real deficiency is worth doing; topping up a level that is
              already normal is not. Check with a doctor or pharmacist if you take any medication.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Daily schedule ── */}
      {schedule.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your daily schedule</CardTitle>
            <CardDescription>
              {selected.length} selected · roughly HK${lo}–{hi} a month
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {schedule.map((g) => (
              <div key={g.timing} className="rounded-lg border border-border p-3">
                <div className="mb-2 flex items-baseline gap-2">
                  <span className="text-sm font-semibold">{TIMING_LABELS[g.timing].label}</span>
                  <span className="text-xs text-muted-foreground">{TIMING_LABELS[g.timing].when}</span>
                </div>
                <ul className="space-y-1">
                  {g.items.map((s) => (
                    <li key={s.id} className="flex justify-between gap-3 text-sm">
                      <span>{s.name}</span>
                      <span className="shrink-0 font-medium tabular-nums">{resolveDose(s, profile.weightKg)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── The full catalogue by tier ── */}
      {TIERS.map((tier) => {
        const items = SUPPLEMENTS.filter((s) => s.tier === tier)
        return (
          <section key={tier} className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold">{TIER_META[tier].label}</h2>
              <p className="text-sm text-muted-foreground">{TIER_META[tier].blurb}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {items.map((s) => {
                const on = supplements.includes(s.id)
                return (
                  <Card key={s.id} className={cn('transition-colors', on && 'border-primary/50 bg-accent/20')}>
                    <CardContent className="pt-5">
                      <label className="flex cursor-pointer items-start gap-3">
                        <span
                          className={cn(
                            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
                            on ? 'border-primary bg-primary text-primary-foreground' : 'border-border',
                          )}
                        >
                          {on && <Check size={13} strokeWidth={3} />}
                        </span>
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => toggleSupplement(s.id)}
                          className="sr-only"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold">{s.name}</span>
                            {s.chinese && <span className="text-xs text-muted-foreground">{s.chinese}</span>}
                            <Badge tone={EVIDENCE_TONE[s.evidence]}>{s.evidence} evidence</Badge>
                          </span>

                          <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                            <span>
                              <span className="text-muted-foreground">Dose: </span>
                              <strong className="tabular-nums">{resolveDose(s, profile.weightKg)}</strong>
                            </span>
                            <span>
                              <span className="text-muted-foreground">When: </span>
                              {TIMING_LABELS[s.timing].label}
                            </span>
                          </span>

                          <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">{s.why}</span>

                          {s.notes && (
                            <span className="mt-2 flex gap-1.5 rounded-md bg-secondary px-2.5 py-1.5 text-xs leading-relaxed">
                              <Info size={13} className="mt-0.5 shrink-0" />
                              <span>{s.notes}</span>
                            </span>
                          )}

                          <span className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                            <span>{s.hkSource}</span>
                            <span className="tabular-nums">
                              HK${s.monthlyHkd[0]}–{s.monthlyHkd[1]}/mo
                            </span>
                          </span>
                        </span>
                      </label>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        )
      })}

      {/* ── Grey hair, addressed honestly ── */}
      <Card>
        <CardHeader>
          <CardTitle>On the grey hair</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <p>
            Greying at 33 is overwhelmingly genetic — if your parents greyed early, that is the
            explanation, and no supplement reverses it. Anyone selling you otherwise is selling you
            something.
          </p>
          <p>
            The parts that <em>are</em> worth checking: B12, ferritin (iron stores), thyroid function
            and vitamin D. Deficiency in any of these can accelerate greying, and correcting a real
            deficiency sometimes slows further change. That is a blood test, not a guess — which is
            why B-complex sits in the supporting tier here rather than the core.
          </p>
          <p>
            Chronic stress and smoking are the two lifestyle factors with genuine evidence behind
            them. Sleep and training help there more than any capsule will.
          </p>
        </CardContent>
      </Card>

      {/* ── The itchy feet question ── */}
      <Card>
        <CardHeader>
          <CardTitle>About the itchy, flaking feet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <p>
            Itching with skin that flakes when scratched is far more often{' '}
            <strong className="text-foreground">athlete's foot (tinea pedis)</strong> or eczema than a
            food allergy. Food allergy usually shows up as hives, swelling or gut symptoms within
            minutes to a couple of hours of eating — not as localised foot itching.
          </p>
          <p>
            Hong Kong's humidity plus running shoes is close to ideal conditions for fungus. Worth
            trying before you change anything about your diet: dry between the toes properly after
            showering, rotate between two pairs of shoes so each fully dries, change socks when damp,
            and consider an over-the-counter antifungal cream such as clotrimazole or terbinafine.
          </p>
          <p>
            If it has not cleared after two to three weeks of that, see a GP or dermatologist. They
            can scrape a sample to confirm fungus, and if it turns out not to be, that is when
            allergy testing makes sense. Cutting foods out on suspicion is the least reliable route —
            it restricts your diet for months and rarely gives a clear answer.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
