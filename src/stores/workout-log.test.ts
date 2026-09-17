import { describe, it, expect, beforeEach } from 'vitest'
import { useWorkoutLog } from './workout-log'

const initial = useWorkoutLog.getState()

describe('useWorkoutLog remarks', () => {
  beforeEach(() => {
    useWorkoutLog.setState({ ...initial, sets: [], remarks: {} })
  })

  it('stores one remark per exercise, trimmed', () => {
    useWorkoutLog.getState().setRemark('goblet-squat', '  heels on a plate  ')
    expect(useWorkoutLog.getState().remarks['goblet-squat']).toBe('heels on a plate')
  })

  it('replaces rather than appends when the same exercise is remarked again', () => {
    useWorkoutLog.getState().setRemark('goblet-squat', 'first')
    useWorkoutLog.getState().setRemark('goblet-squat', 'second')
    expect(useWorkoutLog.getState().remarks).toEqual({ 'goblet-squat': 'second' })
  })

  it('removes the remark when saved as empty, instead of keeping a blank entry', () => {
    useWorkoutLog.getState().setRemark('goblet-squat', 'heels on a plate')
    useWorkoutLog.getState().setRemark('goblet-squat', '   ')
    expect('goblet-squat' in useWorkoutLog.getState().remarks).toBe(false)
  })

  it('leaves other exercises untouched when one remark is removed', () => {
    useWorkoutLog.getState().setRemark('goblet-squat', 'heels on a plate')
    useWorkoutLog.getState().setRemark('floor-press', 'wrists neutral')
    useWorkoutLog.getState().setRemark('goblet-squat', '')
    expect(useWorkoutLog.getState().remarks).toEqual({ 'floor-press': 'wrists neutral' })
  })
})
