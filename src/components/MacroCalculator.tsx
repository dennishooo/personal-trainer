import { useMemo } from 'react'
import { X } from 'lucide-react'
import { deltasFrom, scalePick, totalsFor, type Pick } from '@/lib/macro-calc'
import { adjustedTargets, ageFrom, macroTargets } from '@/lib/nutrition'
import { usePlan } from '@/stores/profile'
import { cn } from '@/lib/utils'

/** Signed rendering: the sign is the point of the row, so always show it. */
const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`)

/**
 * Totals up the picked ingredients and shows them against the day's macro
 * targets (including any accepted calorie adjustment). Picks live in the
 * Nutrition page — this only renders and reports edits.
 */
export function MacroCalculator({
  picks,
  onGramsChange,
  onRemove,
  onClear,
}: {
  picks: Pick[]
  onGramsChange: (index: number, grams: number) => void
  onRemove: (index: number) => void
  onClear: () => void
}) {
  const { profile, calorieOverride } = usePlan()
  const targets = useMemo(
    () => adjustedTargets(macroTargets(profile, ageFrom(profile.birthDate)), calorieOverride),
    [profile, calorieOverride],
  )

  const totals = totalsFor(picks)
  const deltas = deltasFrom(totals, targets)

  const deltaTone = {
    // Over on calories is the miss that matters; protein is the one to hit.
    kcal: deltas.kcal > 0 ? 'text-destructive' : 'text-success',
    proteinG: deltas.proteinG >= 0 ? 'text-success' : 'text-warning',
    carbG: deltas.carbG > 0 ? 'text-warning' : 'text-muted-foreground',
    fatG: deltas.fatG > 0 ? 'text-warning' : 'text-muted-foreground',
  }

  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Meal calculator</h2>
          <p className="text-xs text-muted-foreground">
            Raw edible weights, against today's full-day target
            {calorieOverride !== 0 && ' (adjustment included)'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          Clear
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="[&>th]:whitespace-nowrap [&>th]:border-b [&>th]:border-border [&>th]:px-3.5 [&>th]:py-2 [&>th]:text-right [&>th]:text-[10px] [&>th]:font-semibold [&>th]:uppercase [&>th]:tracking-wider [&>th]:text-muted-foreground">
              <th scope="col" className="!text-left">Ingredient</th>
              <th scope="col">Weight g</th>
              <th scope="col">kcal</th>
              <th scope="col">Protein g</th>
              <th scope="col">Carb g</th>
              <th scope="col">Fat g</th>
              <th scope="col" />
            </tr>
          </thead>
          <tbody>
            {picks.map((pick, i) => {
              const scaled = scalePick(pick)
              return (
                <tr
                  key={`${pick.item.name}-${i}`}
                  className="[&>td]:border-b [&>td]:border-border [&>td]:px-3.5 [&>td]:py-2 [&>td]:text-right [&>td]:tabular-nums"
                >
                  <td className="!text-left">
                    <span className="font-medium">{pick.item.name}</span>
                    {pick.item.chinese && (
                      <span className="ml-1.5 whitespace-nowrap text-xs text-muted-foreground">
                        {pick.item.chinese}
                      </span>
                    )}
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      step={10}
                      value={pick.grams}
                      onChange={(e) => onGramsChange(i, Math.max(0, Number(e.target.value) || 0))}
                      aria-label={`Weight of ${pick.item.name} in grams`}
                      className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-right text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </td>
                  <td className="font-semibold">{scaled.kcal}</td>
                  <td className="text-protein">{scaled.proteinG}</td>
                  <td className="text-carb">{scaled.carbG}</td>
                  <td className="text-fat">{scaled.fatG}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => onRemove(i)}
                      aria-label={`Remove ${pick.item.name}`}
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <X size={14} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="[&>td]:border-b [&>td]:border-border [&>td]:px-3.5 [&>td]:py-2 [&>td]:text-right [&>td]:font-semibold [&>td]:tabular-nums">
              <td className="!text-left" colSpan={2}>Total</td>
              <td>{totals.kcal}</td>
              <td className="text-protein">{totals.proteinG}</td>
              <td className="text-carb">{totals.carbG}</td>
              <td className="text-fat">{totals.fatG}</td>
              <td />
            </tr>
            <tr className="[&>td]:border-b [&>td]:border-border [&>td]:px-3.5 [&>td]:py-2 [&>td]:text-right [&>td]:text-xs [&>td]:text-muted-foreground [&>td]:tabular-nums">
              <td className="!text-left" colSpan={2}>Day target</td>
              <td>{targets.calories}</td>
              <td>{targets.proteinG}</td>
              <td>{targets.carbG}</td>
              <td>{targets.fatG}</td>
              <td />
            </tr>
            <tr className="[&>td]:px-3.5 [&>td]:py-2 [&>td]:text-right [&>td]:font-semibold [&>td]:tabular-nums">
              <td className="!text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground" colSpan={2}>
                +/−
              </td>
              <td className={cn(deltaTone.kcal)}>{signed(deltas.kcal)}</td>
              <td className={cn(deltaTone.proteinG)}>{signed(deltas.proteinG)}</td>
              <td className={cn(deltaTone.carbG)}>{signed(deltas.carbG)}</td>
              <td className={cn(deltaTone.fatG)}>{signed(deltas.fatG)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  )
}
