/**
 * The plate model — a portioning heuristic for meals you have not weighed,
 * which is every lunch you eat out. Halves the plate to vegetables, quarters
 * to protein and carbohydrate.
 */
export function PlateModel({ size = 220 }: { size?: number }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label="Plate portioning model">
      <circle cx="100" cy="100" r="86" fill="var(--card)" stroke="var(--border)" strokeWidth="3" />
      <circle cx="100" cy="100" r="78" fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 4" />

      {/* left half — vegetables */}
      <path d="M 100 22 A 78 78 0 0 0 100 178 Z" fill="var(--success)" opacity="0.22" />
      {/* top right quarter — protein */}
      <path d="M 100 22 A 78 78 0 0 1 178 100 L 100 100 Z" fill="var(--protein)" opacity="0.25" />
      {/* bottom right quarter — carbs */}
      <path d="M 178 100 A 78 78 0 0 1 100 178 L 100 100 Z" fill="var(--carb)" opacity="0.25" />

      <line x1="100" y1="22" x2="100" y2="178" stroke="var(--border)" strokeWidth="2" />
      <line x1="100" y1="100" x2="178" y2="100" stroke="var(--border)" strokeWidth="2" />

      <text x="58" y="96" textAnchor="middle" className="fill-foreground" fontSize="13" fontWeight="600">½ plate</text>
      <text x="58" y="112" textAnchor="middle" className="fill-muted-foreground" fontSize="10">Vegetables</text>

      <text x="140" y="58" textAnchor="middle" className="fill-foreground" fontSize="12" fontWeight="600">¼</text>
      <text x="140" y="72" textAnchor="middle" className="fill-muted-foreground" fontSize="10">Protein</text>

      <text x="140" y="134" textAnchor="middle" className="fill-foreground" fontSize="12" fontWeight="600">¼</text>
      <text x="140" y="148" textAnchor="middle" className="fill-muted-foreground" fontSize="10">Carbs</text>
    </svg>
  )
}
