# Personal Plan

A self-adjusting diet, training and supplement planner. Purely frontend — everything
lives in `localStorage`, nothing is sent anywhere.

```bash
npm install
npm run dev
```

## What it does

The whole app derives from four inputs: **date of birth, height, current weight, goal**.
Change any one and every number recalculates — calories, macros, meal portions, supplement
doses, and starting loads in the gym.

| Page | What's there |
|---|---|
| **Today** | Calorie and macro targets, BMI against Asian-Pacific cut-offs, the trend verdict, weight logging and chart |
| **Week** | Seven days of meals and training, plus a consolidated shopping list |
| **Meals** | 27 recipes with scaled portions and step-by-step method; ordering guides for eating out |
| **Training** | 4-day upper/lower split with two runs, form breakdowns, stick-figure diagrams |
| **Supplements** | Evidence-tiered list with HK sourcing and monthly cost, grouped into a daily schedule |
| **Profile** | Inputs, goal, activity level, and a full breakdown of how each number was derived |

## How the plan adjusts

Scale weight is noisy, so nothing reacts to a single reading:

1. Weigh-ins are smoothed with an **exponentially-weighted moving average**.
2. The trend is the **least-squares slope** over a 21-day window, in kg/week — a regression,
   so one bad reading at either end can't dominate.
3. That trend is compared against the target rate for your goal.
4. If they diverge, a calorie nudge is suggested — **capped at ±250 kcal** so the plan drifts
   rather than lurches. You choose whether to apply it.

Nothing is suggested until there are at least 4 weigh-ins spanning 14 days.

Age matters too: BMR falls with age via Mifflin–St Jeor, and the protein target *rises*
after 40 to offset anabolic resistance.

The app also flags when the **goal itself** should change — once BMI enters the healthy band,
sitting in a deficit stops being useful.

## Architecture

```
src/
  lib/          nutrition.ts, adjust.ts   ← all calculation, unit-tested
  data/         meals, supplements, training  ← content, no logic
  stores/       zustand + persist middleware
  components/   ui primitives, illustrations (hand-drawn SVG)
  pages/        one per tab
```

Calculation logic is deliberately separated from presentation so it can be tested
directly. 55 tests cover the engines and the store.

```bash
npm run test        # vitest
npm run type-check
npm run build
```

## A note on the content

Targets are estimates from population-level equations. Individual metabolism varies by
roughly ±10%, which is exactly why the app adjusts from your logged data rather than
trusting the initial calculation.

Supplements are tiered by **evidence quality**, not popularity — `core` items have
randomised-trial support, `optional` ones are flagged as thin. Food first; supplements
close gaps.

None of this is medical advice.
