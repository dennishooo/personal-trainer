import { describe, it, expect } from 'vitest'
import { patternFor } from './ExerciseDiagram'
import { MUSCLE_GROUPS } from '@/data/training'

describe('patternFor', () => {
  it('maps the band accessories onto the right movement patterns', () => {
    expect(patternFor('band-pallof')).toBe('core')
    expect(patternFor('band-pushdown')).toBe('push')
    expect(patternFor('band-pushup')).toBe('push')
    expect(patternFor('band-curl')).toBe('pull')
  })

  it('classifies every core exercise as a core brace, not the squat fallback', () => {
    const core = MUSCLE_GROUPS.find((g) => g.id === 'core')!
    for (const e of core.exercises) {
      expect(patternFor(e.id)).toBe('core')
    }
  })
})
