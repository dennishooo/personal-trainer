import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Icon, type IconName } from '@/components/icons'
import { DISH_CUISINE_LABELS, type DishCuisine, type DishVerdict } from '@/data/dishes'
import {
  deriveVerdict, EMPTY_DRAFT, validateDraft, type DishDraft, type DraftErrors,
} from '@/lib/custom-dish'
import { VERDICT_LABELS } from '@/lib/dish-log'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const CUISINES = Object.keys(DISH_CUISINE_LABELS) as DishCuisine[]

/** The food icons, from the shared set — the rest are exercise glyphs. */
const DISH_ICONS: IconName[] = [
  'bowl-spoon', 'bowl-chopsticks', 'soup', 'salad', 'meat', 'fish', 'egg', 'egg-fried',
  'bread', 'cheese', 'grill', 'cooker', 'coffee', 'bubble-tea', 'cup', 'milk',
  'apple', 'carrot', 'avocado', 'lemon', 'mushroom', 'pepper',
]

export function DishForm({
  initial = EMPTY_DRAFT,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: DishDraft
  submitLabel: string
  onSubmit: (draft: DishDraft) => void
  onCancel: () => void
}) {
  const [draft, setDraft] = useState<DishDraft>(initial)
  // Errors appear on submit, not on every keystroke — flagging "enter a number"
  // while the field is still being typed into is just noise.
  const [errors, setErrors] = useState<DraftErrors>({})
  const [showMore, setShowMore] = useState(false)

  const set = (patch: Partial<DishDraft>) => setDraft((d) => ({ ...d, ...patch }))

  const submit = () => {
    const found = validateDraft(draft)
    setErrors(found)
    if (Object.keys(found).length === 0) onSubmit(draft)
  }

  const autoVerdict = deriveVerdict(
    Number(draft.kcal) || 0,
    Number(draft.proteinG) || 0,
    Number(draft.sodiumMg) || 0,
  )

  return (
    <div className="space-y-4">
      <Field label="Dish name" error={errors.name}>
        <input
          value={draft.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="Tsui Wah curry beef brisket"
          className={inputClass(errors.name)}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Cuisine">
          <select
            value={draft.cuisine}
            onChange={(e) => set({ cuisine: e.target.value as DishCuisine })}
            className={inputClass()}
          >
            {CUISINES.map((c) => (
              <option key={c} value={c}>{DISH_CUISINE_LABELS[c]}</option>
            ))}
          </select>
        </Field>
        <Field label="Serving" hint="as ordered">
          <input
            value={draft.servingNote}
            onChange={(e) => set({ servingNote: e.target.value })}
            placeholder="One plate"
            className={inputClass()}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Calories" error={errors.kcal}>
          <input inputMode="numeric" value={draft.kcal} onChange={(e) => set({ kcal: e.target.value })} placeholder="780" className={inputClass(errors.kcal)} />
        </Field>
        <Field label="Protein g" error={errors.proteinG}>
          <input inputMode="numeric" value={draft.proteinG} onChange={(e) => set({ proteinG: e.target.value })} placeholder="38" className={inputClass(errors.proteinG)} />
        </Field>
        <Field label="Carbs g" error={errors.carbG}>
          <input inputMode="numeric" value={draft.carbG} onChange={(e) => set({ carbG: e.target.value })} placeholder="82" className={inputClass(errors.carbG)} />
        </Field>
        <Field label="Fat g" error={errors.fatG}>
          <input inputMode="numeric" value={draft.fatG} onChange={(e) => set({ fatG: e.target.value })} placeholder="30" className={inputClass(errors.fatG)} />
        </Field>
      </div>

      <button
        type="button"
        onClick={() => setShowMore(!showMore)}
        className="flex items-center gap-1 text-xs font-medium text-primary transition-opacity hover:opacity-75"
      >
        {showMore ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        {showMore ? 'Fewer details' : 'More details'}
      </button>

      {showMore && (
        <div className="space-y-4 border-t border-border pt-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Chinese name">
              <input value={draft.chinese} onChange={(e) => set({ chinese: e.target.value })} placeholder="咖喱牛腩飯" className={inputClass()} />
            </Field>
            <Field label="Sodium mg" error={errors.sodiumMg}>
              <input inputMode="numeric" value={draft.sodiumMg} onChange={(e) => set({ sodiumMg: e.target.value })} placeholder="1800" className={inputClass(errors.sodiumMg)} />
            </Field>
            <Field label="Price HK$" error={errors.priceHKD}>
              <input inputMode="numeric" value={draft.priceHKD} onChange={(e) => set({ priceHKD: e.target.value })} placeholder="68" className={inputClass(errors.priceHKD)} />
            </Field>
          </div>

          <Field label="Tags" hint="comma separated">
            <input value={draft.tags} onChange={(e) => set({ tags: e.target.value })} placeholder="rice, curry, beef" className={inputClass()} />
          </Field>

          <Field label="Ordering tip" hint="how to order it better">
            <textarea
              value={draft.swap}
              onChange={(e) => set({ swap: e.target.value })}
              rows={2}
              placeholder="Ask for 少飯 — about 180 kcal off, protein untouched."
              className={cn(inputClass(), 'h-auto py-2 leading-relaxed')}
            />
          </Field>

          <Field label="Verdict">
            <div className="flex flex-wrap gap-1.5">
              <VerdictChip
                active={draft.verdict === 'auto'}
                onClick={() => set({ verdict: 'auto' })}
                label={`Auto (${VERDICT_LABELS[autoVerdict].toLowerCase()})`}
              />
              {(['green', 'amber', 'red'] as DishVerdict[]).map((v) => (
                <VerdictChip
                  key={v}
                  active={draft.verdict === v}
                  onClick={() => set({ verdict: v })}
                  label={VERDICT_LABELS[v]}
                />
              ))}
            </div>
          </Field>

          <Field label="Icon">
            <div className="flex flex-wrap gap-1.5">
              {DISH_ICONS.map((name) => (
                <button
                  key={name}
                  type="button"
                  aria-label={`Icon ${name}`}
                  aria-pressed={draft.icon === name}
                  onClick={() => set({ icon: name })}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg border transition-colors',
                    draft.icon === name
                      ? 'border-primary bg-accent text-accent-foreground'
                      : 'border-border text-muted-foreground hover:bg-secondary',
                  )}
                >
                  <Icon name={name} size={18} />
                </button>
              ))}
            </div>
          </Field>
        </div>
      )}

      <div className="flex gap-2 border-t border-border pt-3">
        <Button onClick={submit}>{submitLabel}</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  )
}

function inputClass(error?: string) {
  return cn(
    'h-9 w-full rounded-lg border bg-background px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none',
    error ? 'border-destructive' : 'border-input',
  )
}

function Field({
  label, hint, error, children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-1">
      <span className="flex items-baseline gap-1.5">
        <span className="text-xs font-medium">{label}</span>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </span>
      {children}
      {error && <span className="block text-[11px] text-destructive">{error}</span>}
    </label>
  )
}

function VerdictChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
        active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-secondary',
      )}
    >
      {label}
    </button>
  )
}
