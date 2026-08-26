export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'full'

export interface Exercise {
  id: string
  name: string
  chinese?: string
  group: MuscleGroup
  sets: number
  reps: string
  restSec: number
  /** Starting load as a multiple of bodyweight. Scales the plan to the user. */
  loadPerBw?: number
  loadNote?: string
  cue: string
  form: string[]
  swap?: string
}

export interface TrainingDay {
  id: string
  day: number
  name: string
  focus: string
  type: 'lift' | 'cardio' | 'rest'
  durationMin: number
  exercises: Exercise[]
  cardio?: { what: string; detail: string; minutes: number }
}

/**
 * A 4-day upper/lower split with jogging on the off days. Upper/lower hits each
 * muscle twice a week, which outperforms a once-weekly "bro split" for someone
 * rebuilding after a long layoff — frequency drives the adaptation more than
 * per-session volume does.
 */
export const PROGRAM: TrainingDay[] = [
  {
    id: 'day-1',
    day: 1,
    name: 'Lower A',
    focus: 'Squat pattern, quads and glutes',
    type: 'lift',
    durationMin: 55,
    exercises: [
      {
        id: 'goblet-squat',
        name: 'Goblet squat',
        chinese: '高腳杯深蹲',
        group: 'legs',
        sets: 3,
        reps: '8–12',
        restSec: 120,
        loadPerBw: 0.25,
        cue: 'Chest tall, elbows inside the knees at the bottom.',
        form: [
          'Hold a dumbbell vertically against your chest, elbows tucked down.',
          'Push your hips back and down, letting the knees travel forward over the toes.',
          'Descend until your thighs are at least parallel — deeper is fine if your back stays neutral.',
          'Drive up through mid-foot. The knees and chest should rise together, not the hips first.',
        ],
        swap: 'Leg press if your gym is busy.',
      },
      {
        id: 'rdl',
        name: 'Romanian deadlift',
        chinese: '羅馬尼亞硬舉',
        group: 'legs',
        sets: 3,
        reps: '8–10',
        restSec: 120,
        loadPerBw: 0.5,
        cue: 'Hips back, bar close, feel the stretch behind the thigh.',
        form: [
          'Stand with the bar or dumbbells at your thighs, knees softly bent.',
          'Push your hips back — do not squat. The bar slides down your legs, staying in contact.',
          'Stop when you feel a strong hamstring stretch, usually around mid-shin.',
          'Drive your hips forward to stand. Squeeze the glutes at the top, do not lean back.',
        ],
      },
      {
        id: 'leg-press',
        name: 'Leg press',
        group: 'legs',
        sets: 3,
        reps: '12–15',
        restSec: 90,
        loadPerBw: 1.2,
        cue: 'Do not lock the knees hard at the top.',
        form: [
          'Feet shoulder-width, mid-platform.',
          'Lower until the knees reach about 90°, keeping your lower back flat against the pad.',
          'Press through the whole foot, stopping just short of full lockout.',
        ],
      },
      {
        id: 'leg-curl',
        name: 'Seated leg curl',
        group: 'legs',
        sets: 3,
        reps: '12–15',
        restSec: 75,
        loadNote: 'Machine — pick a weight where the last 2 reps are hard',
        cue: 'Slow on the way back, 2 seconds.',
        form: ['Pad just above the heels.', 'Curl until the knees are fully bent.', 'Control the return — this is where hamstrings grow.'],
      },
      {
        id: 'calf-raise',
        name: 'Standing calf raise',
        group: 'legs',
        sets: 3,
        reps: '15–20',
        restSec: 60,
        loadPerBw: 0.3,
        cue: 'Full range: deep stretch at the bottom, pause at the top.',
        form: ['Balls of the feet on a step.', 'Drop the heels below the step for a full stretch.', 'Rise to the tallest position and hold 1 second.'],
      },
      {
        id: 'plank',
        name: 'Plank',
        chinese: '平板支撐',
        group: 'core',
        sets: 3,
        reps: '30–60 sec',
        restSec: 60,
        cue: 'Squeeze glutes — that is what stops the hips sagging.',
        form: ['Elbows under shoulders.', 'Body in one line from head to heels.', 'Brace as if about to take a punch.'],
      },
    ],
  },
  {
    id: 'day-2',
    day: 2,
    name: 'Upper A',
    focus: 'Horizontal push and pull',
    type: 'lift',
    durationMin: 55,
    exercises: [
      {
        id: 'db-bench',
        name: 'Dumbbell bench press',
        chinese: '啞鈴臥推',
        group: 'chest',
        sets: 4,
        reps: '8–12',
        restSec: 120,
        loadPerBw: 0.3,
        loadNote: 'per dumbbell',
        cue: 'Shoulder blades pulled back and down into the bench.',
        form: [
          'Lie back with the dumbbells at chest level, elbows about 45° from your torso — not flared to 90°.',
          'Press up and slightly inward until the dumbbells nearly touch.',
          'Lower under control until you feel a stretch across the chest.',
        ],
        swap: 'Barbell bench press if a bench and rack are free.',
      },
      {
        id: 'db-row',
        name: 'Single-arm dumbbell row',
        chinese: '單臂啞鈴划船',
        group: 'back',
        sets: 4,
        reps: '10–12',
        restSec: 90,
        loadPerBw: 0.3,
        cue: 'Pull with the elbow, not the hand.',
        form: [
          'One knee and hand on a bench, back flat and roughly parallel to the floor.',
          'Let the dumbbell hang, then pull it to your hip — not your shoulder.',
          'Squeeze the shoulder blade toward your spine at the top.',
          'Lower all the way down for a full stretch.',
        ],
      },
      {
        id: 'lat-pulldown',
        name: 'Lat pulldown',
        chinese: '高位下拉',
        group: 'back',
        sets: 3,
        reps: '10–12',
        restSec: 90,
        loadPerBw: 0.6,
        cue: 'Drive the elbows down to your ribs.',
        form: ['Grip slightly wider than shoulders.', 'Lean back about 15°, chest up.', 'Pull the bar to your upper chest.', 'Control the return until the arms are fully extended.'],
        swap: 'Assisted pull-ups — work toward unassisted.',
      },
      {
        id: 'db-shoulder-press',
        name: 'Seated dumbbell shoulder press',
        group: 'shoulders',
        sets: 3,
        reps: '10–12',
        restSec: 90,
        loadPerBw: 0.18,
        loadNote: 'per dumbbell',
        cue: 'Do not let the lower back arch off the seat.',
        form: ['Start with dumbbells at ear height, palms forward.', 'Press up until the arms are nearly straight.', 'Lower under control to ear height.'],
      },
      {
        id: 'lateral-raise',
        name: 'Lateral raise',
        chinese: '側平舉',
        group: 'shoulders',
        sets: 3,
        reps: '12–15',
        restSec: 60,
        loadPerBw: 0.07,
        loadNote: 'per dumbbell — lighter than you think',
        cue: 'Lead with the elbows, stop at shoulder height.',
        form: ['Slight bend in the elbows, held throughout.', 'Raise out to the sides to shoulder height, no higher.', 'Lower slowly, 2 seconds.'],
      },
      {
        id: 'face-pull',
        name: 'Face pull',
        group: 'shoulders',
        sets: 3,
        reps: '15–20',
        restSec: 60,
        loadNote: 'Cable — light',
        cue: 'Pull toward your forehead, ending in a double-bicep pose.',
        form: ['Rope at upper-chest height.', 'Pull toward your face, separating the rope ends.', 'External rotation at the end is the whole point.'],
      },
    ],
  },
  {
    id: 'day-3',
    day: 3,
    name: 'Zone 2 run',
    focus: 'Aerobic base',
    type: 'cardio',
    durationMin: 40,
    exercises: [],
    cardio: {
      what: 'Easy jog',
      detail: 'Conversational pace — you should be able to speak in full sentences. If you cannot, slow down. Most people run their easy days too hard and their hard days too easy.',
      minutes: 40,
    },
  },
  {
    id: 'day-4',
    day: 4,
    name: 'Lower B',
    focus: 'Hinge pattern, hamstrings and glutes',
    type: 'lift',
    durationMin: 55,
    exercises: [
      {
        id: 'deadlift',
        name: 'Trap-bar deadlift',
        chinese: '硬舉',
        group: 'legs',
        sets: 4,
        reps: '5–8',
        restSec: 150,
        loadPerBw: 0.8,
        cue: 'Push the floor away rather than pulling the bar up.',
        form: [
          'Stand inside the trap bar, feet hip-width.',
          'Hinge down and grip the handles, chest up, back flat, shoulders slightly ahead of the bar.',
          'Take the slack out of the bar before you pull — you should feel tension in your lats.',
          'Drive through the floor, standing up in one piece. Hips and shoulders rise together.',
          'Lower under control. Do not round your back to save a rep.',
        ],
        swap: 'Conventional barbell deadlift, or dumbbell deadlift if no trap bar.',
      },
      {
        id: 'bulgarian-split',
        name: 'Bulgarian split squat',
        group: 'legs',
        sets: 3,
        reps: '10–12 per leg',
        restSec: 90,
        loadPerBw: 0.15,
        loadNote: 'per dumbbell',
        cue: 'Most of the weight on the front leg — the back leg is a kickstand.',
        form: ['Rear foot on a bench, front foot about two feet ahead.', 'Drop straight down until the back knee nears the floor.', 'Drive up through the front heel.'],
      },
      {
        id: 'hip-thrust',
        name: 'Hip thrust',
        group: 'legs',
        sets: 3,
        reps: '10–12',
        restSec: 90,
        loadPerBw: 0.6,
        cue: 'Tuck the chin, ribs down, squeeze hard at the top.',
        form: ['Upper back on a bench, bar across the hips with a pad.', 'Drive hips up until the torso is parallel to the floor.', 'Hold 1 second at the top.'],
      },
      {
        id: 'leg-extension',
        name: 'Leg extension',
        group: 'legs',
        sets: 3,
        reps: '12–15',
        restSec: 75,
        loadNote: 'Machine',
        cue: 'Pause 1 second at the top.',
        form: ['Pad on the lower shin.', 'Extend until the legs are straight.', 'Lower slowly.'],
      },
      {
        id: 'hanging-knee-raise',
        name: 'Hanging knee raise',
        group: 'core',
        sets: 3,
        reps: '10–15',
        restSec: 60,
        cue: 'Curl the pelvis up — do not just swing the legs.',
        form: ['Hang from a bar, shoulders active.', 'Raise the knees toward your chest, rolling the pelvis under.', 'Lower slowly without swinging.'],
        swap: 'Lying leg raise if grip fails first.',
      },
    ],
  },
  {
    id: 'day-5',
    day: 5,
    name: 'Upper B',
    focus: 'Vertical push and pull, arms',
    type: 'lift',
    durationMin: 55,
    exercises: [
      {
        id: 'ohp',
        name: 'Overhead press',
        chinese: '肩上推舉',
        group: 'shoulders',
        sets: 4,
        reps: '6–10',
        restSec: 120,
        loadPerBw: 0.4,
        cue: 'Squeeze the glutes so the press does not become a lean-back.',
        form: [
          'Bar at collarbone height, hands just outside shoulder-width.',
          'Move your head back slightly so the bar can pass your face.',
          'Press straight up, then push your head "through" the window at lockout.',
          'The bar finishes over the mid-foot, not in front of you.',
        ],
      },
      {
        id: 'pullup',
        name: 'Pull-up or assisted pull-up',
        chinese: '引體向上',
        group: 'back',
        sets: 4,
        reps: '6–10',
        restSec: 120,
        loadNote: 'Bodyweight — use the machine or a band as needed',
        cue: 'Start each rep from a dead hang.',
        form: ['Grip slightly wider than shoulders.', 'Pull the chest toward the bar, elbows driving down.', 'Chin clears the bar.', 'Lower all the way to a straight-arm hang.'],
      },
      {
        id: 'incline-db-press',
        name: 'Incline dumbbell press',
        group: 'chest',
        sets: 3,
        reps: '10–12',
        restSec: 90,
        loadPerBw: 0.22,
        loadNote: 'per dumbbell',
        cue: 'Bench at 30°, not 45° — higher shifts the work to the shoulders.',
        form: ['Dumbbells at upper-chest level.', 'Press up and slightly together.', 'Lower until you feel the stretch.'],
      },
      {
        id: 'cable-row',
        name: 'Seated cable row',
        group: 'back',
        sets: 3,
        reps: '10–12',
        restSec: 90,
        loadPerBw: 0.55,
        cue: 'Chest stays still — do not rock backward to move the weight.',
        form: ['Slight forward lean at the stretch, torso upright at the pull.', 'Pull to the navel.', 'Squeeze the shoulder blades together for 1 second.'],
      },
      {
        id: 'db-curl',
        name: 'Incline dumbbell curl',
        group: 'arms',
        sets: 3,
        reps: '10–12',
        restSec: 60,
        loadPerBw: 0.12,
        loadNote: 'per dumbbell',
        cue: 'Elbows stay behind the torso — that stretch is the point.',
        form: ['Sit on a 45° incline, arms hanging straight down.', 'Curl without letting the elbows drift forward.', 'Lower fully.'],
      },
      {
        id: 'triceps-pushdown',
        name: 'Cable triceps pushdown',
        group: 'arms',
        sets: 3,
        reps: '12–15',
        restSec: 60,
        loadPerBw: 0.3,
        cue: 'Elbows pinned to your sides.',
        form: ['Elbows tucked, upper arms motionless.', 'Extend fully, squeeze 1 second.', 'Return to 90° only.'],
      },
    ],
  },
  {
    id: 'day-6',
    day: 6,
    name: 'Intervals or long run',
    focus: 'Conditioning',
    type: 'cardio',
    durationMin: 35,
    exercises: [],
    cardio: {
      what: 'Alternate weekly',
      detail: 'Week A — intervals: 10 min easy warm-up, then 6 × (1 min hard / 2 min easy), 8 min cool-down. Week B — long run: 50–60 min at conversational pace. Alternating keeps the aerobic base growing without piling fatigue onto your leg days.',
      minutes: 35,
    },
  },
  {
    id: 'day-7',
    day: 7,
    name: 'Rest',
    focus: 'Recovery',
    type: 'rest',
    durationMin: 0,
    exercises: [],
    cardio: {
      what: 'Full rest or a walk',
      detail: 'Muscle is built during recovery, not during the session. A 20–30 minute walk and 15 minutes of stretching is ideal; doing nothing is also fine.',
      minutes: 0,
    },
  },
]

/** Resolve a bodyweight-relative starting load into kilograms. */
export function resolveLoad(ex: Exercise, weightKg: number): string {
  if (ex.loadPerBw) {
    const kg = Math.round((ex.loadPerBw * weightKg) / 2.5) * 2.5
    return `~${kg} kg${ex.loadNote ? ` (${ex.loadNote})` : ''}`
  }
  return ex.loadNote ?? 'Bodyweight'
}

export const PROGRESSION_RULES = [
  {
    title: 'Double progression',
    body: 'Stay at the same weight until you hit the top of the rep range on every set. Then add the smallest increment available and drop back to the bottom of the range.',
  },
  {
    title: 'Leave 1–2 reps in reserve',
    body: 'Stop each set when you could manage one or two more good reps. Training to absolute failure on compound lifts costs more recovery than the extra stimulus is worth.',
  },
  {
    title: 'Add weight in small steps',
    body: '2.5 kg on lower-body lifts, 1–2 kg on upper. Small jumps you can keep making beat big ones that stall you for a month.',
  },
  {
    title: 'Deload every 6–8 weeks',
    body: 'Take one week at roughly 60% of your usual volume. You will come back stronger — the adaptation happens when the fatigue clears.',
  },
  {
    title: 'Expect slower progress in a deficit',
    body: 'Recomposition means adding muscle while eating below maintenance. Strength will still go up, just more gradually than it would on a surplus. Holding your lifts steady while bodyweight falls is itself a win.',
  },
]

export const WARMUP = [
  '5 minutes easy cardio — bike, row or brisk treadmill walk.',
  'Leg swings, 10 each direction per leg.',
  'Arm circles and band pull-aparts, 15 each.',
  'Two ramp-up sets of your first exercise: one at ~50% for 8 reps, one at ~75% for 3.',
]
