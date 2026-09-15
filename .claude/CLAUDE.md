# personal-plan

Frontend React app: a self-adjusting fitness/diet/supplement planner.
All state persists to `localStorage` via zustand `persist`; an optional Supabase
backend (`src/stores/sync.ts`) adds magic-link auth and per-user cross-device sync.

## Stack

| Package | Version | Notes |
|---|---|---|
| react / react-dom | ^19.2 | React 19. No `forwardRef` needed — `ref` is a normal prop. |
| vite | ^8.2 | `@vitejs/plugin-react` |
| typescript | ~6.0 | strict |
| tailwindcss | ^4.3 | **v4 — CSS-first config.** No `tailwind.config.js`. Tokens live in `@theme` inside `src/index.css`. Loaded via `@tailwindcss/vite` plugin, not PostCSS. |
| zustand | ^5.0 | `persist` middleware for localStorage |
| recharts | ^3.10 | charts; `ResponsiveContainer` needs a sized parent |
| lucide-react | ^1.34 | icons |
| vitest | ^4.1 | jsdom env, globals on |
| @supabase/supabase-js | ^2 | optional sync; client is null when `VITE_SUPABASE_*` env vars unset and the app runs local-only |

## Conventions

- `@/` aliases `src/` (set in both `vite.config.ts` and `tsconfig.app.json`).
- Colour tokens are oklch CSS vars in `:root` / `.dark`, exposed to Tailwind through `@theme inline`.
  Use semantic classes (`bg-card`, `text-muted-foreground`), never raw hex.
- `cn()` from `@/lib/utils` merges class names.
- Pure calculation logic lives in `src/lib/*.ts` and is unit-tested; components stay presentational.
