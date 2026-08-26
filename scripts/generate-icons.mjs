/**
 * Regenerates src/components/icons.tsx from the SVGs in src/assets/icons/.
 *
 * Run after adding or removing an icon:  node scripts/generate-icons.mjs
 * Source icons are Tabler (MIT) — see src/assets/icons/LICENSE.
 */
import { readdirSync, readFileSync, writeFileSync } from 'fs'
const dir = 'src/assets/icons'
const files = readdirSync(dir).filter(f => f.endsWith('.svg')).sort()
const toName = f => f.replace('.svg','').split('-').map(p=>p[0].toUpperCase()+p.slice(1)).join('')

const entries = files.map(f => {
  const raw = readFileSync(`${dir}/${f}`,'utf8')
  // Keep only the drawing paths; the wrapper <svg> is supplied by the component.
  const paths = [...raw.matchAll(/<(path|circle|rect|line|polyline)\b([^>]*?)\/>/g)]
    .map(m => m[0])
    .filter(p => !/stroke="none"/.test(p))   // drop Tabler's invisible bounding rect
    .map(p => p.replace(/\s+/g,' ').replace(/stroke-(\w+)="/g,(_,a)=>`stroke${a[0].toUpperCase()+a.slice(1)}="`))
    .join('')
  return `  '${f.replace('.svg','')}': <>${paths}</>,`
}).join('\n')

writeFileSync('src/components/icons.tsx', `import type { CSSProperties, ReactNode } from 'react'

/**
 * Tabler Icons (MIT) — https://tabler.io/icons
 * Copyright (c) 2020-2024 Paweł Kuna
 *
 * Bundled locally rather than fetched so the app has no external asset
 * dependency. All are drawn on the same 24x24 grid with a 2px stroke, which
 * is what keeps them visually consistent with the figures in
 * ExerciseDiagram.tsx.
 */
const PATHS: Record<string, ReactNode> = {
${entries}
}

export type IconName = keyof typeof PATHS

export function Icon({
  name,
  size = 24,
  strokeWidth = 2,
  className,
  style,
}: {
  name: IconName
  size?: number
  strokeWidth?: number
  className?: string
  style?: CSSProperties
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}
`)
console.log('generated', files.length, 'icons')
