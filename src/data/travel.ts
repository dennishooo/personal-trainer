import { EXERCISE_BY_ID, type Exercise } from '@/data/training'

/**
 * Travel mode: full-body sessions that need nothing but a hotel room, a towel
 * and a door. Kept separate from the home library because the two answer
 * different questions — the home programme is built to progress with
 * dumbbells, this one exists to hold muscle for a week or two with none.
 *
 * Two ideas shape it:
 *
 * 1. Maintenance needs roughly a third of the volume that building does, so
 *    two to three short sessions across a 10-day trip is genuinely enough —
 *    this is deliberately not a daily plan.
 * 2. Bodyweight loads are too light for a trained lifter, so intensity comes
 *    from execution instead: slow eccentrics, pauses, unilateral variants,
 *    and taking sets close to failure. The cues below bake that in.
 */
const TRAVEL_EXERCISES: Exercise[] = [
  {
    id: 'pushup',
    videoId: 'WDIpL0pjun0',
    name: 'Push-up',
    chinese: '掌上壓',
    group: 'chest',
    equipment: ['bodyweight'],
    sets: 3,
    reps: '15–30',
    restSec: 75,
    position: 'Plank position, hands slightly wider than shoulders',
    cue: 'Lower for 3 seconds — the descent is where the stimulus is.',
    form: [
      'Hands under and slightly wider than the shoulders, body in one line from head to heels.',
      'Lower until your chest nearly touches the floor, elbows about 45° from the torso.',
      'Pause one second at the bottom, then press to a full lockout.',
      'Stop each set 1–2 reps before your form breaks.',
    ],
    swap: 'Too easy at 30? Feet on the bed (decline) or hands together (diamond, more triceps).',
    upgrade:
      'Replaces the dumbbell bench press for the trip. High-rep sets near failure grow muscle the same as heavy low-rep sets — the last few hard reps are what count.',
    formUrl: 'https://exrx.net/WeightExercises/PectoralSternal/BWPushup',
    formUrlExact: true,
  },
  {
    id: 'pike-pushup',
    videoId: 'XckEEwa1BPI',
    name: 'Pike push-up',
    chinese: '折刀式掌上壓',
    group: 'shoulders',
    equipment: ['bodyweight'],
    sets: 3,
    reps: '8–15',
    restSec: 75,
    position: 'Inverted V — hips high, hands and feet on the floor',
    cue: 'Head travels forward-and-down toward a spot between your hands.',
    form: [
      'From a push-up position, walk your feet in until your hips point at the ceiling.',
      'Bend the elbows and lower the top of your head toward the floor.',
      'Press back up until the arms are straight, keeping the hips high throughout.',
      'The more vertical your torso, the more it loads the shoulders.',
    ],
    swap: 'Feet up on the bed or a chair shifts more weight onto the shoulders.',
    upgrade: 'The closest thing to an overhead press with no equipment — your bodyweight becomes the dumbbells.',
    formUrl: 'https://exrx.net/WeightExercises/DeltoidAnterior/BWPikePress',
    formUrlExact: false,
  },
  {
    id: 'towel-row',
    videoId: 'g8wWFlr2gQU',
    name: 'Towel door row',
    chinese: '毛巾划船',
    group: 'back',
    equipment: ['bodyweight'],
    sets: 3,
    reps: '10–15',
    restSec: 75,
    position: 'Standing, leaning back holding a towel looped around a door handle',
    cue: 'Pull with the elbows and squeeze the shoulder blades — same cue as your dumbbell row.',
    form: [
      'Loop a towel around both handles of a closed door (hinge side away from you) and grip an end in each hand.',
      'Walk your feet in toward the door and lean back until your arms are straight.',
      'Pull your chest to your hands, elbows driving back, shoulder blades squeezing together.',
      'Lower yourself back slowly, 3 seconds. Walk the feet further in to make it harder.',
    ],
    swap: 'A sturdy table edge works too — lie under it and row your chest to the edge.',
    upgrade:
      'Pulling is the hardest thing to cover with no equipment, so do not skip this one — it is the only rowing in the plan and the towel version is closest to a real inverted row.',
    formUrl: 'https://exrx.net/WeightExercises/BackGeneral/BWSupineRow',
    formUrlExact: false,
  },
  {
    id: 'superman',
    videoId: 'z6PJMT2y8GQ',
    name: 'Superman',
    chinese: '超人式',
    group: 'back',
    equipment: ['bodyweight'],
    sets: 3,
    reps: '12–15',
    restSec: 60,
    position: 'Lying face down, arms extended overhead',
    cue: 'Lift slowly and hold two seconds at the top — no swinging.',
    form: [
      'Lie face down, arms stretched overhead, legs straight.',
      'Raise arms, chest and legs off the floor together, squeezing the glutes and upper back.',
      'Hold the top for two seconds, then lower under control.',
    ],
    swap: 'Y-T-W raises (arms tracing each letter) hit the rear delts and mid-back harder.',
    formUrl: 'https://exrx.net/WeightExercises/ErectorSpinae/Superman',
    formUrlExact: true,
  },
  {
    id: 'bw-split-squat',
    videoId: '2k6e_UFGPb8',
    name: 'Rear-foot-elevated split squat',
    chinese: '後腳抬高分腿蹲',
    group: 'legs',
    equipment: ['bodyweight'],
    sets: 3,
    reps: '12–15 per leg',
    restSec: 90,
    position: 'Standing, rear foot up on the bed or a chair behind you',
    cue: 'Same movement as your Bulgarian split squat — 3 seconds down, 1 second pause at the bottom.',
    form: [
      'Rear foot on the bed or a chair, front foot about two feet ahead.',
      'Drop straight down for a slow 3-count until the back knee nears the floor.',
      'Pause at the bottom, then drive up through the front heel.',
      'Finish all reps on one leg before switching.',
    ],
    upgrade:
      'One leg at a time is what keeps legs trainable with no weights — the working leg carries nearly all of you, which is more than your dumbbells load it with at home.',
    formUrl: 'https://exrx.net/WeightExercises/Quadriceps/BWSingleLegSplitSquat',
    formUrlExact: true,
  },
  {
    id: 'sl-glute-bridge',
    videoId: 'sVfp4LN9niA',
    name: 'Single-leg glute bridge',
    chinese: '單腳臀橋',
    group: 'legs',
    equipment: ['bodyweight'],
    sets: 3,
    reps: '12–15 per leg',
    restSec: 60,
    position: 'Lying on your back, one foot flat on the floor, the other leg straight',
    cue: 'Hips stay level — do not let the free side sag.',
    form: [
      'Lie on your back, one knee bent with the foot flat, the other leg held straight.',
      'Drive through the planted heel until hips are fully extended.',
      'Squeeze the glute hard for two seconds at the top, then lower slowly.',
      'Finish all reps on one side before switching.',
    ],
    swap: 'Shoulders up on the bed turns it into a single-leg hip thrust — longer range, harder.',
    formUrl: 'https://exrx.net/WeightExercises/GluteusMaximus/BWLyingHipExtension',
    formUrlExact: false,
  },
]

export const TRAVEL_EXERCISE_BY_ID: Record<string, Exercise> = Object.fromEntries(
  TRAVEL_EXERCISES.map((e) => [e.id, e]),
)

/** Look up a travel-plan exercise: travel-specific first, then the shared home library (plank, leg raise). */
export function travelExercise(id: string): Exercise | undefined {
  return TRAVEL_EXERCISE_BY_ID[id] ?? EXERCISE_BY_ID[id]
}

export interface TravelWorkout {
  id: string
  title: string
  focus: string
  exerciseIds: string[]
  note?: string
}

/**
 * Two alternating full-body sessions rather than a split: with only 2–3
 * sessions across a whole trip, every session has to touch everything. A and
 * B rotate the push, pull and leg patterns so back-to-back sessions do not
 * repeat the same stress. Plank and lying leg raise come from the home
 * library — they were already bodyweight moves.
 */
export const TRAVEL_WORKOUTS: TravelWorkout[] = [
  {
    id: 'travel-a',
    title: 'Travel A',
    focus: 'Push, pull, legs, core — about 20 minutes',
    exerciseIds: ['pushup', 'towel-row', 'bw-split-squat', 'plank'],
    note: 'Do this the first session. One movement per pattern, three sets each, close to failure.',
  },
  {
    id: 'travel-b',
    title: 'Travel B',
    focus: 'Shoulders, posterior chain, core — about 20 minutes',
    exerciseIds: ['pike-pushup', 'superman', 'sl-glute-bridge', 'lying-leg-raise'],
    note: 'Alternate with A. Different angles on the same patterns, so the two sessions do not just repeat.',
  },
]

export function travelWorkoutExercises(w: TravelWorkout): Exercise[] {
  return w.exerciseIds.map(travelExercise).filter((e): e is Exercise => Boolean(e))
}

/** No bands to warm up with — everything here is floor and joints. */
export const TRAVEL_WARMUP = [
  '2 minutes of marching or jogging on the spot.',
  'Arm circles, 10 each direction, then 10 shoulder shrugs.',
  'Leg swings, 10 each direction per leg.',
  'One easy half-effort set of your first exercise before the working sets.',
]

export const TRAVEL_GUIDELINES = [
  {
    title: 'Every 3–4 days is enough',
    body: 'Maintaining muscle takes roughly a third of the volume that building it does. Two or three of these sessions across a 10-day trip fully covers it — do not turn the holiday into a training camp.',
  },
  {
    title: 'Make bodyweight heavy with execution',
    body: 'No weights means tension has to come from elsewhere: 3-second lowering phases, a pause at the hardest point, one limb at a time, and sets taken to 1–2 reps short of failure. A 20-rep set done that way is real training, not cardio.',
  },
  {
    title: 'Walking is the cardio',
    body: 'A travel day on foot easily beats a zone-2 run for volume. No treadmill required — the runs resume when you are home.',
  },
  {
    title: 'Ten days will not cost you muscle',
    body: 'Measurable atrophy takes 2–3 weeks of doing nothing. Feeling smaller mid-trip is glycogen and water, not lost tissue, and it refills within days of training again.',
  },
]

/** Shown while travel mode is on — the week back home matters more than the trip itself. */
export const TRAVEL_RETURN_NOTE =
  'First week back, work at 80–90% of your usual weights. Connective tissue and tendons re-adapt slower than muscle, and jumping straight to full loads after a layoff is the classic injury window. Week two, resume normal progression.'
