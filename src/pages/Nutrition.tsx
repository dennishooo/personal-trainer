import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import { Icon } from '@/components/icons'
import { NUTRITION_GROUPS, type Leanness, type NutritionItem } from '@/data/nutrition-reference'
import {
  activeFilterCount,
  applyFilters,
  costPerProteinServing,
  countItems,
  EMPTY_FILTERS,
  LEANNESS_LABELS,
  MACRO_LABELS,
  PROTEIN_SERVING_G,
  type FilterState,
  type MacroKey,
  type SortKey,
} from '@/lib/nutrition-filter'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'A–Z' },
  { key: 'protein', label: 'Protein' },
  { key: 'kcal', label: 'Calories' },
  { key: 'carb', label: 'Carbs' },
  { key: 'fat', label: 'Fat' },
  { key: 'density', label: 'Protein / kcal' },
  { key: 'cost', label: 'Cheapest protein' },
]

const MACROS: MacroKey[] = ['high-protein', 'low-cal', 'low-carb', 'low-fat', 'efficient', 'in-plan']
const LEAN_BANDS: Leanness[] = ['lean', 'medium', 'fatty']

const LEAN_DOT: Record<Leanness, string> = {
  lean: 'bg-success',
  medium: 'bg-warning',
  fatty: 'bg-destructive',
}

const TOTAL = countItems(NUTRITION_GROUPS)

/** Toggles a value in an immutable set, for filter chip state. */
function toggle<T>(set: ReadonlySet<T>, value: T): Set<T> {
  const next = new Set(set)
  next.has(value) ? next.delete(value) : next.add(value)
  return next
}

/**
 * HKD to buy one meal's protein from this item, with the underlying assumed
 * price surfaced on hover. Dash for unpriced items (vegetables, oils, sauces).
 */
function ProteinCostCell({ item }: { item: NutritionItem }) {
  const cost = costPerProteinServing(item)
  if (cost === null) return <td className="text-muted-foreground">—</td>
  return (
    <td title={`assumes HK$${item.pricePer100gHKD}/100 g — edit in nutrition-reference.ts`}>
      ${cost.toFixed(1)}
    </td>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'border-primary bg-accent text-accent-foreground'
          : 'border-border text-muted-foreground hover:bg-secondary hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

export function Nutrition() {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [showFilters, setShowFilters] = useState(false)
  const controlsRef = useRef<HTMLDivElement>(null)
  const [controlsH, setControlsH] = useState(0)

  const groups = useMemo(() => applyFilters(NUTRITION_GROUPS, filters), [filters])
  const shown = countItems(groups)
  const activeCount = activeFilterCount(filters)

  const update = (patch: Partial<FilterState>) => setFilters((f) => ({ ...f, ...patch }))

  // Table headers stick directly below the control bar, so the offset has to
  // track its real height — it grows when the filter panel opens or chips wrap.
  useLayoutEffect(() => {
    const el = controlsRef.current
    if (!el) return
    const sync = () => setControlsH(el.getBoundingClientRect().height)
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => ro.disconnect()
  }, [showFilters])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Nutrition reference</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Macros per 100 g raw, broken out by cut — the part of the animal matters more than the
          animal. Chicken runs 109 kcal at the tenderloin and 290 at the wing; pork runs 143 at the
          tenderloin and 518 at the belly. Cuts in your meal plan are tagged{' '}
          <Badge tone="outline" className="align-middle text-[10px]">
            in plan
          </Badge>
          ; the rest are for ordering out or at the butcher.
        </p>
      </header>

      {/* ── Controls: search + sort always visible, filters collapse ── */}
      <div
        ref={controlsRef}
        className="sticky top-0 z-20 -mx-4 space-y-2 border-b border-border bg-background px-4 py-3 lg:-mx-6 lg:px-6"
      >
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={filters.query}
            onChange={(e) => update({ query: e.target.value })}
            placeholder="Search ingredient — tofu, salmon, oats…"
            aria-label="Search ingredients"
            className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Chip active={showFilters} onClick={() => setShowFilters((v) => !v)}>
            <SlidersHorizontal size={13} />
            Filters
            {activeCount > 0 && (
              <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                {activeCount}
              </span>
            )}
            <ChevronDown size={13} className={cn('transition-transform', showFilters && 'rotate-180')} />
          </Chip>

          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Sort
          </span>
          {SORTS.map((s) => (
            <Chip key={s.key} active={filters.sort === s.key} onClick={() => update({ sort: s.key })}>
              {s.label}
            </Chip>
          ))}

          <span className="ml-auto text-xs text-muted-foreground">
            {shown === TOTAL ? `${TOTAL} ingredients` : `${shown} of ${TOTAL} ingredients`}
          </span>
        </div>

        {showFilters && (
          <div className="space-y-2 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Category
              </span>
              {NUTRITION_GROUPS.map((g) => (
                <Chip
                  key={g.name}
                  active={filters.categories.has(g.name)}
                  onClick={() => update({ categories: toggle(filters.categories, g.name) })}
                >
                  <Icon name={g.icon} size={14} strokeWidth={1.8} />
                  {g.name}
                </Chip>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Macro
              </span>
              {MACROS.map((m) => (
                <Chip
                  key={m}
                  active={filters.macros.has(m)}
                  onClick={() => update({ macros: toggle(filters.macros, m) })}
                >
                  {MACRO_LABELS[m]}
                </Chip>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Cut
              </span>
              {LEAN_BANDS.map((l) => (
                <Chip
                  key={l}
                  active={filters.leanness.has(l)}
                  onClick={() => update({ leanness: toggle(filters.leanness, l) })}
                >
                  <span className={cn('size-2 rounded-full', LEAN_DOT[l])} title={LEANNESS_LABELS[l]} />
                  {l[0].toUpperCase() + l.slice(1)}
                </Chip>
              ))}
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="ml-auto rounded-lg border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {groups.length === 0 && (
        <p className="py-8 text-sm text-muted-foreground">
          Nothing matches these filters. Try clearing one.
        </p>
      )}

      {groups.map((group) => {
        const hasCuts = group.items.some((i) => i.cut)
        return (
          <section key={group.name} className="space-y-3">
            <div className="flex items-center gap-2">
              <Icon name={group.icon} size={20} strokeWidth={1.8} className="text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">{group.name}</h2>
              <span className="text-xs tabular-nums text-muted-foreground">{group.items.length}</span>
            </div>

            {/* A scroll container clips position:sticky, so the wrapper only becomes one
                below the table's min-width; above it the header sticks to the viewport. */}
            <div className="rounded-xl border border-border bg-card max-[980px]:overflow-x-auto">
              <table className="w-full min-w-[940px] border-separate border-spacing-0 text-sm">
                <thead>
                  <tr
                    style={{ ['--th-top' as string]: `${controlsH}px` }}
                    className="[&>th]:sticky [&>th]:top-(--th-top) [&>th]:z-10 max-[980px]:[&>th]:static [&>th]:whitespace-nowrap [&>th]:border-b [&>th]:border-border [&>th]:bg-card [&>th]:px-3.5 [&>th]:py-2.5 [&>th]:text-right [&>th]:text-[10px] [&>th]:font-semibold [&>th]:uppercase [&>th]:tracking-wider [&>th]:text-muted-foreground">
                    <th scope="col" className="!text-left">
                      Ingredient
                    </th>
                    {hasCuts && <th scope="col">Cut</th>}
                    <th scope="col">kcal</th>
                    <th scope="col">Protein g</th>
                    <th scope="col">Carb g</th>
                    <th scope="col">Fat g</th>
                    <th scope="col">$ / {PROTEIN_SERVING_G} g protein</th>
                    <th scope="col">Portion</th>
                    <th scope="col" className="!text-left">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map((item) => (
                    <tr
                      key={`${group.name}-${item.name}`}
                      className="[&>td]:border-b [&>td]:border-border [&>td]:bg-card [&>td]:px-3.5 [&>td]:py-2.5 [&>td]:text-right [&>td]:tabular-nums last:[&>td]:border-b-0 hover:[&>td]:bg-secondary"
                    >
                      <td className="!text-left">
                        <span className="flex items-center gap-2.5">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                            <Icon name={item.icon} size={17} strokeWidth={1.7} />
                          </span>
                          <span>
                            <span className="font-medium">{item.name}</span>
                            {item.chinese && (
                              <span className="ml-1.5 whitespace-nowrap text-xs text-muted-foreground">
                                {item.chinese}
                              </span>
                            )}
                            {item.inPlan && (
                              <Badge tone="outline" className="ml-1.5 align-middle text-[10px]">
                                in plan
                              </Badge>
                            )}
                          </span>
                        </span>
                      </td>
                      {hasCuts && (
                        <td>
                          <span className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                            {item.leanness && (
                              <span
                                className={cn('size-2 rounded-full', LEAN_DOT[item.leanness])}
                                title={LEANNESS_LABELS[item.leanness]}
                              />
                            )}
                            {item.cut ?? '—'}
                          </span>
                        </td>
                      )}
                      <td className="font-semibold">{item.kcal}</td>
                      <td className="font-semibold text-protein">{item.proteinG}</td>
                      <td className="text-carb">{item.carbG}</td>
                      <td className="text-fat">{item.fatG}</td>
                      <ProteinCostCell item={item} />
                      <td className="whitespace-nowrap text-xs text-muted-foreground">{item.portion}</td>
                      <td className="!text-left text-xs text-muted-foreground">{item.note ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )
      })}

      <footer className="max-w-3xl space-y-2 border-t border-border pt-5 text-xs text-muted-foreground">
        <p>
          <strong className="text-foreground">Sources.</strong> USDA FoodData Central, with Hong Kong
          Centre for Food Safety values for the Chinese ingredients. Whey and konjac figures are
          typical label values and vary by brand — check yours.
        </p>
        <p>
          <strong className="text-foreground">Raw weights</strong> unless noted. Meat sheds roughly a
          quarter of its weight as water when cooked, so 100 g raw chicken breast lands near 75 g on
          the plate with the protein unchanged. Bone-in cuts are quoted as edible meat.
        </p>
        <p>
          <strong className="text-foreground">Leanness dots</strong> grade fat per 100 g: lean under
          8 g, medium 8–17 g, fatty over 17 g.
        </p>
        <p>
          <strong className="text-foreground">Protein cost</strong> is HKD to buy{' '}
          {PROTEIN_SERVING_G} g of protein — roughly one meal's worth — from typical chilled
          supermarket prices (Sep 2026). Frozen shops and wet markets run cheaper, city'super
          higher; hover a value to see the assumed price, and edit{' '}
          <code>pricePer100gHKD</code> in <code>nutrition-reference.ts</code> to match your store.
        </p>
      </footer>
    </div>
  )
}
