import { useMemo, useState } from 'react'
import { Bookmark, GripVertical, X } from 'lucide-react'
import { NUTRITION_GROUPS } from '@/data/nutrition-reference'
import { deltasFrom, resolvePicks, scalePick, totalsFor } from '@/lib/macro-calc'
import { adjustedTargets, ageFrom, macroTargets } from '@/lib/nutrition'
import { usePicks } from '@/stores/picks'
import { usePlan } from '@/stores/profile'
import { cn } from '@/lib/utils'

/** Drag payload type for adding an ingredient from the reference table. */
export const INGREDIENT_DRAG = 'application/x-ingredient'
/** Drag payload type for reordering a row that's already in the calculator. */
const PICK_DRAG = 'application/x-pick'

/** Signed rendering: the sign is the point of the row, so always show it. */
const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`)

/**
 * Totals up the picked ingredients and shows them against the day's macro
 * targets (including any accepted calorie adjustment). Picks persist to
 * localStorage via the picks store; rows can be dragged in from the reference
 * table and reordered by their grip handle.
 */
export function MacroCalculator({ dragActive }: { dragActive: boolean }) {
  const {
    picks: stored, savedMeals, addPick, setGrams, removePick, movePick, clearPicks,
    saveMeal, loadMeal, deleteMeal,
  } = usePicks()
  const { profile, calorieOverride } = usePlan()
  const [dropReady, setDropReady] = useState(false)
  const [mealName, setMealName] = useState('')

  const picks = useMemo(() => resolvePicks(stored, NUTRITION_GROUPS), [stored])
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

  const acceptIngredient = (e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes(INGREDIENT_DRAG)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setDropReady(true)
  }
  const dropIngredient = (e: React.DragEvent) => {
    const name = e.dataTransfer.getData(INGREDIENT_DRAG)
    if (name) {
      e.preventDefault()
      addPick(name)
    }
    setDropReady(false)
  }

  if (picks.length === 0 && savedMeals.length === 0 && !dragActive) return null

  if (picks.length === 0 && dragActive) {
    return (
      <div
        onDragOver={acceptIngredient}
        onDragLeave={() => setDropReady(false)}
        onDrop={dropIngredient}
        className={cn(
          'flex items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-sm transition-colors',
          dropReady ? 'border-primary bg-accent text-accent-foreground' : 'border-border text-muted-foreground',
        )}
      >
        Drop the ingredient here to start a meal
      </div>
    )
  }

  return (
    <section
      onDragOver={acceptIngredient}
      onDragLeave={() => setDropReady(false)}
      onDrop={dropIngredient}
      className={cn(
        'rounded-xl border bg-card transition-colors',
        dropReady ? 'border-primary' : 'border-border',
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Meal calculator</h2>
          <p className="text-xs text-muted-foreground">
            Raw edible weights, against today's full-day target
            {calorieOverride !== 0 && ' (adjustment included)'}
          </p>
        </div>
        {picks.length > 0 && (
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              saveMeal(mealName)
              setMealName('')
            }}
          >
            <input
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              required
              placeholder="Name this meal…"
              aria-label="Name for saved meal"
              className="h-8 w-36 rounded-lg border border-border bg-background px-2 text-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="submit"
              className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Bookmark size={12} /> Save
            </button>
            <button
              type="button"
              onClick={clearPicks}
              className="h-8 rounded-lg border border-dashed border-border px-3 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              Clear
            </button>
          </form>
        )}
      </div>

      {savedMeals.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Saved
          </span>
          {savedMeals.map((meal) => (
            <span
              key={meal.id}
              className="flex items-center overflow-hidden rounded-lg border border-border text-xs"
            >
              <button
                type="button"
                onClick={() => loadMeal(meal.id)}
                title={`Load ${meal.name} (${meal.picks.length} ingredients)`}
                className="flex items-center gap-1.5 px-2.5 py-1.5 font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Bookmark size={11} className="text-primary" />
                {meal.name}
                <span className="text-muted-foreground">{meal.picks.length}</span>
              </button>
              <button
                type="button"
                onClick={() => deleteMeal(meal.id)}
                aria-label={`Delete saved meal ${meal.name}`}
                className="border-l border-border px-1.5 py-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {picks.length === 0 ? (
        <p className="px-4 py-4 text-sm text-muted-foreground">
          Load a saved meal, or add ingredients from the table below.
        </p>
      ) : (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="[&>th]:whitespace-nowrap [&>th]:border-b [&>th]:border-border [&>th]:px-3.5 [&>th]:py-2 [&>th]:text-right [&>th]:text-[10px] [&>th]:font-semibold [&>th]:uppercase [&>th]:tracking-wider [&>th]:text-muted-foreground">
              <th scope="col" aria-label="Reorder" className="w-8" />
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
            {picks.map((pick) => {
              const scaled = scalePick(pick)
              const name = pick.item.name
              return (
                <tr
                  key={name}
                  onDragOver={(e) => {
                    if (!e.dataTransfer.types.includes(PICK_DRAG)) return
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'move'
                  }}
                  onDrop={(e) => {
                    const from = e.dataTransfer.getData(PICK_DRAG)
                    if (!from) return
                    e.preventDefault()
                    e.stopPropagation()
                    movePick(from, name)
                  }}
                  className="[&>td]:border-b [&>td]:border-border [&>td]:px-3.5 [&>td]:py-2 [&>td]:text-right [&>td]:tabular-nums"
                >
                  <td className="!px-2">
                    <span
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData(PICK_DRAG, name)
                        e.dataTransfer.effectAllowed = 'move'
                      }}
                      aria-label={`Drag to reorder ${name}`}
                      title="Drag to reorder"
                      className="inline-flex cursor-grab items-center text-muted-foreground active:cursor-grabbing"
                    >
                      <GripVertical size={14} />
                    </span>
                  </td>
                  <td className="!text-left">
                    <span className="font-medium">{name}</span>
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
                      onChange={(e) => setGrams(name, Math.max(0, Number(e.target.value) || 0))}
                      aria-label={`Weight of ${name} in grams`}
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
                      onClick={() => removePick(name)}
                      aria-label={`Remove ${name}`}
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
              <td className="!text-left" colSpan={3}>Total</td>
              <td>{totals.kcal}</td>
              <td className="text-protein">{totals.proteinG}</td>
              <td className="text-carb">{totals.carbG}</td>
              <td className="text-fat">{totals.fatG}</td>
              <td />
            </tr>
            <tr className="[&>td]:border-b [&>td]:border-border [&>td]:px-3.5 [&>td]:py-2 [&>td]:text-right [&>td]:text-xs [&>td]:text-muted-foreground [&>td]:tabular-nums">
              <td className="!text-left" colSpan={3}>Day target</td>
              <td>{targets.calories}</td>
              <td>{targets.proteinG}</td>
              <td>{targets.carbG}</td>
              <td>{targets.fatG}</td>
              <td />
            </tr>
            <tr className="[&>td]:px-3.5 [&>td]:py-2 [&>td]:text-right [&>td]:font-semibold [&>td]:tabular-nums">
              <td className="!text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground" colSpan={3}>
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
      )}
    </section>
  )
}
