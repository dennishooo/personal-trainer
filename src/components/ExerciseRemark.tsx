import { useState } from 'react'
import { Pencil, StickyNote } from 'lucide-react'
import type { Exercise } from '@/data/training'
import { useWorkoutLog } from '@/stores/workout-log'
import { Button } from '@/components/ui/button'

/**
 * A personal note pinned to an exercise — "left shoulder clicks, keep elbows
 * tucked", "bench at incline 2". One per exercise, shown wherever the card is
 * (library, day view, travel), because it is about the movement rather than
 * any single session.
 */
export function ExerciseRemark({ ex }: { ex: Exercise }) {
  const remark = useWorkoutLog((s) => s.remarks[ex.id])
  const setRemark = useWorkoutLog((s) => s.setRemark)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  function startEditing() {
    setDraft(remark ?? '')
    setEditing(true)
  }

  function save() {
    setRemark(ex.id, draft)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="mt-2.5">
        <label className="sr-only" htmlFor={`remark-${ex.id}`}>
          Remark for {ex.name}
        </label>
        <textarea
          id={`remark-${ex.id}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={2}
          autoFocus
          placeholder="e.g. seat one notch higher, left side goes first"
          className="w-full resize-y rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
        />
        <div className="mt-1.5 flex items-center gap-2">
          <Button type="button" size="sm" onClick={save}>
            Save
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)}>
            Cancel
          </Button>
          {remark && (
            <button
              type="button"
              onClick={() => {
                setRemark(ex.id, '')
                setEditing(false)
              }}
              className="ml-auto text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
            >
              Remove remark
            </button>
          )}
        </div>
      </div>
    )
  }

  if (remark) {
    return (
      <div className="mt-2.5 flex items-start gap-2 rounded-lg border-l-2 border-primary bg-accent/40 px-3 py-2">
        <StickyNote size={13} className="mt-0.5 shrink-0 text-primary" />
        <p className="min-w-0 flex-1 text-xs leading-relaxed whitespace-pre-wrap">{remark}</p>
        <button
          type="button"
          onClick={startEditing}
          aria-label={`Edit remark for ${ex.name}`}
          className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
        >
          <Pencil size={13} />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      className="mt-2 flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
    >
      <StickyNote size={13} /> Add a remark
    </button>
  )
}
