import type { Goal } from '@/lib/nutrition'

export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'biceps' | 'triceps' | 'core' | 'full'
export type Equipment = 'dumbbell' | 'bench' | 'band' | 'bodyweight' | 'pullup-bar'

export interface Exercise {
  id: string
  name: string
  chinese?: string
  group: MuscleGroup
  equipment: Equipment[]
  sets: number
  reps: string
  restSec: number
  /**
   * Starting load per dumbbell, as a multiple of bodyweight. Resolved against
   * the user's actual weight and clamped to what their dumbbells can reach.
   */
  loadPerBw?: number
  loadNote?: string
  /** Plain-English starting position/stance, shown before the form steps so a beginner knows how to set up. */
  position: string
  cue: string
  form: string[]
  swap?: string
  /** Shown when this exercise is a workaround for equipment the user lacks. */
  upgrade?: string
  /** ExRx.net demo page for this exercise, linked as "Watch form". */
  formUrl: string
  /** True when formUrl is the exact named variant; false when it's the closest ExRx page for the same movement (e.g. their dumbbell page is paywalled). */
  formUrlExact: boolean
  /**
   * YouTube id of a form demo, embedded inline on the card. ExRx blocks
   * iframing (X-Frame-Options), so video comes from YouTube and the ExRx
   * link stays as the written reference.
   */
  videoId: string
}

export interface MuscleGroupSection {
  id: MuscleGroup
  name: string
  focus: string
  exercises: Exercise[]
}

export interface CardioSession {
  id: string
  name: string
  /** Short at-a-glance label, e.g. "Easy jog". */
  what: string
  detail: string
  minutes: number
}

/** Per-dumbbell ceiling. The NÜOBELL 232 tops out at 32 kg in 2 kg steps. */
export const DUMBBELL_MAX_KG = 32
export const DUMBBELL_STEP_KG = 2

/**
 * Exercises grouped by the muscle they target rather than assigned to a
 * fixed weekly schedule — pick whichever group to train each session. Built
 * entirely around adjustable dumbbells, an adjustable bench and resistance
 * bands.
 *
 * Two constraints shape the exercise selection:
 *
 * 1. No barbell means no heavy bilateral loading. The fix is unilateral work
 *    (split squats, single-leg RDLs) — one leg at a time doubles the effective
 *    load without needing heavier dumbbells.
 * 2. No pull-up bar means no vertical pulling, which is the one genuine hole in
 *    a dumbbell-only setup. Band pulldowns and pullovers partially cover it;
 *    exercises carrying an `upgrade` note say what a bar would improve.
 */
const ALL_EXERCISES: Exercise[] = [
  {
        id: 'goblet-squat',
        videoId: 'gCESNsDsbqk',
        name: 'Goblet squat',
        chinese: '高腳杯深蹲',
        group: 'legs',
        equipment: ['dumbbell'],
        sets: 4,
        reps: '10–15',
        restSec: 105,
        loadPerBw: 0.3,
        loadNote: 'one dumbbell, held at the chest',
        position: 'Standing, feet shoulder-width apart',
        cue: 'Chest tall, elbows inside the knees at the bottom.',
        form: [
          'Hold one dumbbell vertically against your chest, cupping the top head, elbows tucked down.',
          'Push your hips back and down, letting the knees travel forward over the toes.',
          'Descend until your thighs are at least parallel — deeper is fine if your back stays neutral.',
          'Drive up through mid-foot. Knees and chest rise together, not the hips first.',
        ],
        swap: 'Two dumbbells at the shoulders once one gets too light.',
        formUrl: 'https://exrx.net/WeightExercises/Kettlebell/KBGobletSquat',
        formUrlExact: false,
      },
      {
        id: 'bulgarian-split',
        videoId: 'SkNsa3eBwLA',
        name: 'Bulgarian split squat',
        chinese: '保加利亞分腿蹲',
        group: 'legs',
        equipment: ['dumbbell', 'bench'],
        sets: 3,
        reps: '10–12 per leg',
        restSec: 105,
        loadPerBw: 0.18,
        loadNote: 'per dumbbell',
        position: 'Standing, rear foot up on a bench behind you',
        cue: 'Most of the weight on the front leg — the back leg is a kickstand.',
        form: [
          'Rear foot on the bench, front foot about two feet ahead.',
          'Drop straight down until the back knee nears the floor.',
          'Drive up through the front heel, keeping the torso upright.',
          'Finish all reps on one leg before switching.',
        ],
        upgrade: 'This is the main squat driver without a barbell — one leg at a time means your 32 kg dumbbells load the working leg as hard as far heavier bilateral work would.',
        formUrl: 'https://exrx.net/WeightExercises/Quadriceps/BWSingleLegSplitSquat',
        formUrlExact: false,
      },
      {
        id: 'db-rdl',
        videoId: 'FQKfr1YDhEk',
        name: 'Dumbbell Romanian deadlift',
        chinese: '啞鈴羅馬尼亞硬舉',
        group: 'legs',
        equipment: ['dumbbell'],
        sets: 3,
        reps: '10–12',
        restSec: 105,
        loadPerBw: 0.35,
        loadNote: 'per dumbbell',
        position: 'Standing, feet hip-width apart',
        cue: 'Hips back, dumbbells close, feel the stretch behind the thigh.',
        form: [
          'Hold a dumbbell in each hand in front of your thighs, knees softly bent.',
          'Push your hips back — do not squat. The dumbbells slide down your legs, staying in contact.',
          'Stop when you feel a strong hamstring stretch, usually around mid-shin.',
          'Drive your hips forward to stand. Squeeze the glutes at the top, do not lean back.',
        ],
        formUrl: 'https://exrx.net/WeightExercises/Hamstrings/DBStrBackStrLegDeadlift',
        formUrlExact: true,
      },
      {
        id: 'db-hip-thrust',
        videoId: '29OfN4ztW_g',
        name: 'Dumbbell hip thrust',
        group: 'legs',
        equipment: ['dumbbell', 'bench'],
        sets: 3,
        reps: '12–15',
        restSec: 90,
        loadPerBw: 0.4,
        loadNote: 'one dumbbell across the hips',
        position: 'Sitting on the floor, upper back against the bench',
        cue: 'Tuck the chin, ribs down, squeeze hard at the top.',
        form: [
          'Upper back against the bench, feet flat and about shoulder-width.',
          'Rest one dumbbell across your hips — a towel or mat under it saves the bruising.',
          'Drive the hips up until your torso is parallel to the floor.',
          'Hold one second at the top, lower under control.',
        ],
        formUrl: 'https://exrx.net/WeightExercises/GluteusMaximus/BBHipThrust',
        formUrlExact: false,
      },
      {
        id: 'nordic-curl',
        videoId: 'fV--eazSoWk',
        name: 'Band-assisted leg curl',
        group: 'legs',
        equipment: ['band'],
        sets: 3,
        reps: '10–15',
        restSec: 75,
        loadNote: 'band tension',
        position: 'Lying face down, or standing',
        cue: 'Slow on the way back, 3 seconds.',
        form: [
          'Anchor the band low behind you and loop it around one ankle.',
          'Lying face down or standing, curl the heel toward your glute against the band.',
          'Control the return slowly — the lengthening half is where hamstrings grow.',
        ],
        upgrade: 'A substitute for the leg curl machine. Hamstrings also get direct work from the RDL, so this is supplementary rather than critical.',
        formUrl: 'https://exrx.net/WeightExercises/Hamstrings/ASInverseLegCurlBands',
        formUrlExact: true,
      },
      {
        id: 'calf-raise',
        videoId: 'ORT4oJ_R8Qs',
        name: 'Single-leg calf raise',
        group: 'legs',
        equipment: ['dumbbell'],
        sets: 3,
        reps: '15–20 per leg',
        restSec: 60,
        loadPerBw: 0.25,
        loadNote: 'one dumbbell, held at your side',
        position: 'Standing on one foot on a step or book',
        cue: 'Full range: deep stretch at the bottom, pause at the top.',
        form: [
          'Stand on one foot with the ball of the foot on a step or book, dumbbell in the same-side hand.',
          'Drop the heel below the step for a full stretch.',
          'Rise to the tallest position and hold one second.',
        ],
        formUrl: 'https://exrx.net/WeightExercises/Gastrocnemius/DBSingleLegCalfRaise',
        formUrlExact: true,
      },
      {
        id: 'plank',
        videoId: 'kL_NJAkCQBg',
        name: 'Plank',
        chinese: '平板支撐',
        group: 'core',
        equipment: ['bodyweight'],
        sets: 3,
        reps: '30–60 sec',
        restSec: 60,
        position: 'Face down, propped on forearms and toes',
        cue: 'Squeeze glutes — that is what stops the hips sagging.',
        form: ['Elbows under shoulders.', 'Body in one line from head to heels.', 'Brace as if about to take a punch.'],
        formUrl: 'https://exrx.net/WeightExercises/RectusAbdominis/BWFrontPlank',
        formUrlExact: true,
      },
      {
        id: 'db-bench',
        videoId: 'VmB1G1K7v94',
        name: 'Dumbbell bench press',
        chinese: '啞鈴臥推',
        group: 'chest',
        equipment: ['dumbbell', 'bench'],
        sets: 4,
        reps: '8–12',
        restSec: 120,
        loadPerBw: 0.3,
        loadNote: 'per dumbbell',
        position: 'Lying on your back on the bench',
        cue: 'Shoulder blades pulled back and down into the bench.',
        form: [
          'Lie back with the dumbbells at chest level, elbows about 45° from your torso — not flared to 90°.',
          'Press up and slightly inward until the dumbbells nearly touch.',
          'Lower under control until you feel a stretch across the chest.',
          'To get heavy dumbbells into position, rest them on your knees and kick back as you lie down.',
        ],
        formUrl: 'https://exrx.net/WeightExercises/PectoralSternal/DBBenchPress',
        formUrlExact: true,
      },
      {
        id: 'db-row',
        videoId: 'pYcpY20QaE8',
        name: 'Single-arm dumbbell row',
        chinese: '單臂啞鈴划船',
        group: 'back',
        equipment: ['dumbbell', 'bench'],
        sets: 4,
        reps: '10–12 per arm',
        restSec: 90,
        loadPerBw: 0.35,
        position: 'One knee and hand on the bench, other foot on the floor',
        cue: 'Pull with the elbow, not the hand.',
        form: [
          'One knee and hand on the bench, back flat and roughly parallel to the floor.',
          'Let the dumbbell hang, then pull it to your hip — not your shoulder.',
          'Squeeze the shoulder blade toward your spine at the top.',
          'Lower all the way down for a full stretch.',
        ],
        upgrade: 'Your heaviest back exercise. Without a pull-up bar this carries most of the back work, so treat it as a main lift, not an accessory.',
        formUrl: 'https://exrx.net/WeightExercises/BackGeneral/DBBentOverRow',
        formUrlExact: true,
      },
      {
        id: 'band-pulldown',
        videoId: 'SkT4rqrmH-M',
        name: 'Band lat pulldown',
        group: 'back',
        equipment: ['band'],
        sets: 3,
        reps: '12–20',
        restSec: 75,
        loadNote: 'band tension',
        position: 'Kneeling, facing the anchor point',
        cue: 'Drive the elbows down toward your ribs.',
        form: [
          'Anchor the band high — a door anchor, or over a solid beam.',
          'Kneel far enough back that the band is under tension at the top.',
          'Pull the handles down to your upper chest, elbows driving down and back.',
          'Control the return until the arms are fully extended overhead.',
        ],
        upgrade: 'A stand-in for vertical pulling. A pull-up bar would replace this outright — bands lose tension exactly where your lats are strongest, so this is the weakest exercise in the programme.',
        formUrl: 'https://exrx.net/WeightExercises/LatissimusDorsi/CBFrontPulldown',
        formUrlExact: false,
      },
      {
        id: 'db-shoulder-press',
        videoId: 'qEwKCR5JCog',
        name: 'Seated dumbbell shoulder press',
        group: 'shoulders',
        equipment: ['dumbbell', 'bench'],
        sets: 3,
        reps: '10–12',
        restSec: 90,
        loadPerBw: 0.18,
        loadNote: 'per dumbbell',
        position: 'Sitting upright on the bench',
        cue: 'Do not let the lower back arch off the bench.',
        form: [
          'Set the bench upright, dumbbells at ear height, palms forward.',
          'Press up until the arms are nearly straight.',
          'Lower under control to ear height.',
        ],
        formUrl: 'https://exrx.net/WeightExercises/DeltoidAnterior/DBShoulderPress',
        formUrlExact: false,
      },
      {
        id: 'lateral-raise',
        videoId: '3VcKaXpzqRo',
        name: 'Lateral raise',
        chinese: '側平舉',
        group: 'shoulders',
        equipment: ['dumbbell'],
        sets: 3,
        reps: '12–20',
        restSec: 60,
        loadPerBw: 0.07,
        loadNote: 'per dumbbell — lighter than you think',
        position: 'Standing, dumbbells at your sides',
        cue: 'Lead with the elbows, stop at shoulder height.',
        form: [
          'Slight bend in the elbows, held throughout.',
          'Raise out to the sides to shoulder height, no higher.',
          'Lower slowly, 2 seconds.',
        ],
        formUrl: 'https://exrx.net/WeightExercises/DeltoidLateral/DBLateralRaise',
        formUrlExact: true,
      },
      {
        id: 'band-face-pull',
        videoId: 'CSP7YpPv3ds',
        name: 'Band face pull',
        group: 'shoulders',
        equipment: ['band'],
        sets: 3,
        reps: '15–20',
        restSec: 60,
        loadNote: 'band tension — light',
        position: 'Standing, facing the anchor point',
        cue: 'Pull toward your forehead, ending in a double-bicep pose.',
        form: [
          'Anchor the band at upper-chest height.',
          'Pull toward your face, separating your hands as you go.',
          'The external rotation at the end is the whole point.',
        ],
        upgrade: 'Bands are genuinely better than cables here — tension rises as you pull, matching where the movement gets easier.',
        formUrl: 'https://exrx.net/WeightExercises/DeltoidPosterior/CBStandingRearDeltRowRope',
        formUrlExact: false,
      },
      {
        id: 'db-deadlift',
        videoId: 'lJ3QwaXNJfw',
        name: 'Dumbbell deadlift',
        chinese: '啞鈴硬舉',
        group: 'legs',
        equipment: ['dumbbell'],
        sets: 4,
        reps: '8–10',
        restSec: 120,
        loadPerBw: 0.4,
        loadNote: 'per dumbbell',
        position: 'Standing, feet hip-width apart',
        cue: 'Push the floor away rather than pulling the weight up.',
        form: [
          'Stand with a dumbbell outside each foot, feet hip-width.',
          'Hinge down and grip them, chest up, back flat.',
          'Take the slack out before you pull — you should feel tension in your lats.',
          'Drive through the floor, standing up in one piece. Hips and shoulders rise together.',
          'Lower under control. Do not round your back to save a rep.',
        ],
        formUrl: 'https://exrx.net/WeightExercises/Quadriceps/DBSquat',
        formUrlExact: false,
      },
      {
        id: 'single-leg-rdl',
        videoId: '84hrdsHgDuQ',
        name: 'Single-leg Romanian deadlift',
        group: 'legs',
        equipment: ['dumbbell'],
        sets: 3,
        reps: '10–12 per leg',
        restSec: 90,
        loadPerBw: 0.22,
        loadNote: 'per dumbbell',
        position: 'Standing on one leg',
        cue: 'Hips square to the floor — do not let the free hip rotate open.',
        form: [
          'Stand on one leg, dumbbell in the opposite hand.',
          'Hinge forward, letting the free leg travel straight back as a counterweight.',
          'Lower until your torso is near parallel and you feel the hamstring stretch.',
          'Return by driving the standing hip forward.',
        ],
        upgrade: 'Loads one hamstring at a time, so 32 kg dumbbells stay challenging long after bilateral RDLs get light.',
        formUrl: 'https://exrx.net/WeightExercises/GluteusMaximus/BWSingleLegStiffLegDeadlift',
        formUrlExact: false,
      },
      {
        id: 'db-step-up',
        videoId: '7AtIjR-QqVA',
        name: 'Dumbbell step-up',
        group: 'legs',
        equipment: ['dumbbell', 'bench'],
        sets: 3,
        reps: '10–12 per leg',
        restSec: 90,
        loadPerBw: 0.2,
        loadNote: 'per dumbbell',
        position: 'Standing in front of the bench',
        cue: 'Drive through the top foot — do not push off the bottom one.',
        form: [
          'Dumbbell in each hand, one foot flat on the bench.',
          'Step up by driving through the bench foot, standing tall at the top.',
          'Lower under control, tapping the floor lightly before the next rep.',
        ],
        formUrl: 'https://exrx.net/WeightExercises/Quadriceps/DBStepUp',
        formUrlExact: true,
      },
      {
        id: 'db-sumo-squat',
        videoId: 'MwNY25e4QEA',
        name: 'Dumbbell sumo squat',
        group: 'legs',
        equipment: ['dumbbell'],
        sets: 3,
        reps: '12–15',
        restSec: 75,
        loadPerBw: 0.4,
        loadNote: 'one dumbbell, held between the legs',
        position: 'Standing, wide stance',
        cue: 'Toes turned out about 30°, knees tracking over them.',
        form: [
          'Wide stance, one dumbbell hanging between your legs.',
          'Squat straight down, keeping the torso upright.',
          'Drive up through the heels, squeezing the glutes at the top.',
        ],
        formUrl: 'https://exrx.net/WeightExercises/Quadriceps/DBSquat',
        formUrlExact: false,
      },
      {
        id: 'lying-leg-raise',
        videoId: '3oIpxsn6FxQ',
        name: 'Lying leg raise',
        group: 'core',
        equipment: ['bodyweight'],
        sets: 3,
        reps: '12–15',
        restSec: 60,
        position: 'Lying on your back',
        cue: 'Curl the pelvis up — do not just swing the legs.',
        form: [
          'Lie on your back, hands under your lower back or gripping something behind your head.',
          'Raise the legs until the hips lift slightly off the floor.',
          'Lower slowly without letting the lower back arch away from the floor.',
        ],
        upgrade: 'A pull-up bar would let you do hanging knee raises, which load the abs considerably harder.',
        formUrl: 'https://exrx.net/WeightExercises/HipFlexors/BWLyingLegRaiseFloor',
        formUrlExact: true,
      },
      {
        id: 'db-ohp',
        videoId: 'bmy7tIopNt4',
        name: 'Standing dumbbell overhead press',
        chinese: '肩上推舉',
        group: 'shoulders',
        equipment: ['dumbbell'],
        sets: 4,
        reps: '8–10',
        restSec: 120,
        loadPerBw: 0.16,
        loadNote: 'per dumbbell',
        position: 'Standing, feet hip-width apart',
        cue: 'Squeeze the glutes so the press does not become a lean-back.',
        form: [
          'Dumbbells at shoulder height, palms forward, feet hip-width.',
          'Brace the core hard — standing means your trunk stabilises the load.',
          'Press straight up until the arms lock out over the shoulders.',
          'Lower under control to shoulder height.',
        ],
        swap: 'Seated on the upright bench if your lower back rounds.',
        formUrl: 'https://exrx.net/WeightExercises/DeltoidAnterior/DBShoulderPress',
        formUrlExact: false,
      },
      {
        id: 'db-pullover',
        videoId: 'Cvsaj2AXevI',
        name: 'Dumbbell pullover',
        group: 'back',
        equipment: ['dumbbell', 'bench'],
        sets: 3,
        reps: '12–15',
        restSec: 90,
        loadPerBw: 0.25,
        loadNote: 'one dumbbell, held with both hands',
        position: 'Lying on your back on the bench',
        cue: 'Keep the elbows slightly bent and fixed — the movement is at the shoulder.',
        form: [
          'Lie on the bench holding one dumbbell over your chest, both hands cupping the top head.',
          'Lower it back behind your head in an arc until you feel a deep stretch through the lats.',
          'Pull it back over your chest using your lats, not your arms.',
        ],
        upgrade: 'The best lat exercise available without a bar, since it loads them in a stretched position. A pull-up would still beat it.',
        formUrl: 'https://exrx.net/WeightExercises/PectoralSternal/DBPullover',
        formUrlExact: true,
      },
      {
        id: 'incline-db-press',
        videoId: '8iPEnn-ltC8',
        name: 'Incline dumbbell press',
        group: 'chest',
        equipment: ['dumbbell', 'bench'],
        sets: 3,
        reps: '10–12',
        restSec: 90,
        loadPerBw: 0.24,
        loadNote: 'per dumbbell',
        position: 'Lying back on an inclined bench',
        cue: 'Bench at 30°, not 45° — higher shifts the work to the shoulders.',
        form: [
          'Set the bench to the second or third notch, dumbbells at upper-chest level.',
          'Press up and slightly together.',
          'Lower until you feel the stretch across the upper chest.',
        ],
        formUrl: 'https://exrx.net/WeightExercises/PectoralClavicular/DBInclineBenchPress',
        formUrlExact: true,
      },
      {
        id: 'chest-supported-row',
        videoId: 'tvk5Fb2K0Ns',
        name: 'Chest-supported dumbbell row',
        group: 'back',
        equipment: ['dumbbell', 'bench'],
        sets: 3,
        reps: '12–15',
        restSec: 90,
        loadPerBw: 0.2,
        loadNote: 'per dumbbell',
        position: 'Lying face down on an inclined bench',
        cue: 'Chest stays glued to the bench — that is what removes the cheating.',
        form: [
          'Set the bench to about 30° incline and lie face down on it.',
          'Let the dumbbells hang straight down.',
          'Row them to your hips, squeezing the shoulder blades together.',
          'Lower fully to a complete stretch.',
        ],
        upgrade: 'Replaces the seated cable row. Removing your legs and lower back from the movement means the back does all the work.',
        formUrl: 'https://exrx.net/WeightExercises/BackGeneral/DBLyingRow',
        formUrlExact: true,
      },
      {
        id: 'db-curl',
        videoId: 'soxrZlIl35U',
        name: 'Incline dumbbell curl',
        group: 'biceps',
        equipment: ['dumbbell', 'bench'],
        sets: 3,
        reps: '10–12',
        restSec: 60,
        loadPerBw: 0.12,
        loadNote: 'per dumbbell',
        position: 'Sitting back on an inclined bench',
        cue: 'Elbows stay behind the torso — that stretch is the point.',
        form: [
          'Sit back on a 45° incline, arms hanging straight down.',
          'Curl without letting the elbows drift forward.',
          'Lower fully to a dead hang.',
        ],
        formUrl: 'https://exrx.net/WeightExercises/Biceps/DBInclineCurl',
        formUrlExact: true,
      },
      {
        id: 'db-skullcrusher',
        videoId: 'ir5PsbniVSc',
        name: 'Dumbbell skullcrusher',
        group: 'triceps',
        equipment: ['dumbbell', 'bench'],
        sets: 3,
        reps: '12–15',
        restSec: 60,
        loadPerBw: 0.1,
        loadNote: 'per dumbbell',
        position: 'Lying on your back on a flat bench',
        cue: 'Elbows point at the ceiling and stay there.',
        form: [
          'Lie on the flat bench, dumbbells over your chest, palms facing each other.',
          'Bend at the elbows only, lowering the dumbbells beside your ears.',
          'Extend back up without letting the upper arms drift.',
        ],
        upgrade: 'Replaces the cable pushdown. Loads the triceps in a stretched position, which cables do not.',
        formUrl: 'https://exrx.net/WeightExercises/Triceps/DBLyingTriExt',
        formUrlExact: true,
      },
]

const MUSCLE_GROUP_META: Record<Exclude<MuscleGroup, 'full'>, { name: string; focus: string }> = {
  chest: { name: 'Chest', focus: 'Horizontal and incline press' },
  back: { name: 'Back', focus: 'Rows and pulling' },
  legs: { name: 'Legs', focus: 'Squat and hinge patterns, quads, hamstrings, glutes and calves' },
  shoulders: { name: 'Shoulders', focus: 'Overhead press and lateral/rear delts' },
  biceps: { name: 'Biceps', focus: 'Elbow flexion' },
  triceps: { name: 'Triceps', focus: 'Elbow extension' },
  core: { name: 'Core', focus: 'Bracing and anti-extension' },
}

const GROUP_ORDER: Exclude<MuscleGroup, 'full'>[] = [
  'chest', 'back', 'shoulders', 'legs', 'biceps', 'triceps', 'core',
]

/** Exercises grouped by target muscle. A `full`-tagged exercise (none currently) would need to be listed explicitly per group, since it can't be bucketed automatically. */
export const MUSCLE_GROUPS: MuscleGroupSection[] = GROUP_ORDER.map((id) => ({
  id,
  name: MUSCLE_GROUP_META[id].name,
  focus: MUSCLE_GROUP_META[id].focus,
  exercises: ALL_EXERCISES.filter((e) => e.group === id),
}))

export const CARDIO_SESSIONS: CardioSession[] = [
  {
    id: 'zone-2',
    name: 'Zone 2 run',
    what: 'Easy jog',
    detail:
      'Conversational pace — you should be able to speak in full sentences. If you cannot, slow down. Most people run their easy days too hard and their hard days too easy.',
    minutes: 40,
  },
  {
    id: 'intervals',
    name: 'Intervals or long run',
    what: 'Alternate weekly',
    detail:
      'Week A — intervals: 10 min easy warm-up, then 6 × (1 min hard / 2 min easy), 8 min cool-down. Week B — long run: 50–60 min at conversational pace. Alternating keeps the aerobic base growing without piling fatigue onto your leg days.',
    minutes: 35,
  },
]

/**
 * Goal changes training, not just diet. In a deficit you keep the load heavy to
 * hold onto muscle but cut total volume, because recovery is worse when
 * underfed; in a surplus you can afford more.
 */
export const GOAL_TRAINING: Record<Goal, { setDelta: number; label: string; note: string }> = {
  cut: {
    setDelta: -1,
    label: 'Reduced volume',
    note: 'One set fewer per exercise. Under-eating blunts recovery, so keep the weight heavy — that is what preserves muscle — and cut the volume instead.',
  },
  recomp: {
    setDelta: 0,
    label: 'Standard volume',
    note: 'The baseline. A small deficit is recoverable at this volume.',
  },
  'lean-bulk': {
    setDelta: 1,
    label: 'Increased volume',
    note: 'One extra set per exercise. Eating in a surplus means you can recover from more work, and more work drives more growth.',
  },
  maintain: {
    setDelta: 0,
    label: 'Standard volume',
    note: 'The baseline — enough to keep progressing without needing a surplus.',
  },
}

/** Activity level shifts how much running sits alongside the lifting. */
export const ACTIVITY_CARDIO: Record<string, { runsPerWeek: number; note: string }> = {
  sedentary: { runsPerWeek: 1, note: 'Start with one easy run a week and build from there.' },
  light: { runsPerWeek: 2, note: 'Two runs a week alongside your lifting sessions.' },
  moderate: { runsPerWeek: 2, note: 'Two runs a week alongside your lifting sessions.' },
  active: { runsPerWeek: 3, note: 'Three runs a week. Watch that leg-training quality does not suffer.' },
  'very-active': {
    runsPerWeek: 3,
    note: 'Three runs a week, and consider a genuine rest day if the lifts start regressing.',
  },
}

/**
 * Resolve a bodyweight-relative starting load into kilograms, rounded to the
 * dumbbell's adjustment step and clamped to its ceiling.
 */
export function resolveLoad(
  ex: Exercise,
  weightKg: number,
  maxKg = DUMBBELL_MAX_KG,
): { text: string; atCeiling: boolean } {
  if (!ex.loadPerBw) return { text: ex.loadNote ?? 'Bodyweight', atCeiling: false }

  const raw = ex.loadPerBw * weightKg
  const stepped = Math.max(
    DUMBBELL_STEP_KG,
    Math.round(raw / DUMBBELL_STEP_KG) * DUMBBELL_STEP_KG,
  )
  const kg = Math.min(stepped, maxKg)
  return {
    text: `${kg} kg${ex.loadNote ? ` (${ex.loadNote})` : ''}`,
    atCeiling: stepped > maxKg,
  }
}

/** Apply the goal's volume adjustment, never dropping below two working sets. */
export function adjustedSets(ex: Exercise, goal: Goal): number {
  return Math.max(2, ex.sets + GOAL_TRAINING[goal].setDelta)
}

/** Seconds a working set itself takes, before rest — a rough estimate used only for session-length guidance. */
const SET_DURATION_SEC = 40

/** Rough time to work through a group of exercises: each set's rest plus a flat working-set estimate. */
export function estimatedMinutes(exercises: Exercise[], goal: Goal): number {
  const totalSeconds = exercises.reduce((a, ex) => {
    const sets = adjustedSets(ex, goal)
    return a + sets * (SET_DURATION_SEC + ex.restSec)
  }, 0)
  return Math.round(totalSeconds / 60)
}

export const PROGRESSION_RULES = [
  {
    title: 'Double progression',
    body: 'Stay at the same weight until you hit the top of the rep range on every set. Then add one step — 2 kg on your dumbbells — and drop back to the bottom of the range.',
  },
  {
    title: 'Leave 1–2 reps in reserve',
    body: 'Stop each set when you could manage one or two more good reps. Training to absolute failure costs more recovery than the extra stimulus is worth.',
  },
  {
    title: 'When you hit 32 kg, change the exercise, not the weight',
    body: 'Your dumbbells cap out. Once an exercise gets easy at the top weight, switch to a harder variation — bilateral to single-leg, flat to incline, or add a 3-second lowering phase. Unilateral work is the main reason this programme stays hard without heavier weights.',
  },
  {
    title: 'Deload every 6–8 weeks',
    body: 'Take one week at roughly 60% of your usual volume. You will come back stronger — adaptation happens when the fatigue clears.',
  },
  {
    title: 'Expect slower progress in a deficit',
    body: 'Recomposition means adding muscle while eating below maintenance. Strength will still climb, just gradually. Holding your lifts steady while bodyweight falls is itself a win.',
  },
]

export const WARMUP = [
  '5 minutes easy cardio — a brisk walk, skipping, or jogging on the spot.',
  'Leg swings, 10 each direction per leg.',
  'Band pull-aparts, 15 — especially before chest, back or shoulders.',
  'Two ramp-up sets of your first exercise: one at ~50% for 8 reps, one at ~75% for 3.',
]

/** Exercises a pull-up bar would add or upgrade, listed for the equipment note. */
export const PULLUP_BAR_UPGRADES = [
  'Pull-ups and chin-ups — the single best back builder, and nothing here fully replaces them',
  'Hanging knee raises, which load the abs far harder than lying raises',
  'Dead hangs for grip and shoulder health',
]
