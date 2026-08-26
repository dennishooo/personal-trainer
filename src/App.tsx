import { useEffect, useState } from 'react'
import { LayoutDashboard, UtensilsCrossed, Pill, Dumbbell, CalendarRange, User, Moon, Sun } from 'lucide-react'
import { useTheme, applyTheme } from '@/stores/theme'
import { Dashboard } from '@/pages/Dashboard'
import { Meals } from '@/pages/Meals'
import { Supplements } from '@/pages/Supplements'
import { Training } from '@/pages/Training'
import { Week } from '@/pages/Week'
import { ProfilePage } from '@/pages/Profile'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'dashboard', label: 'Today', icon: LayoutDashboard, Page: Dashboard },
  { id: 'week', label: 'Week', icon: CalendarRange, Page: Week },
  { id: 'meals', label: 'Meals', icon: UtensilsCrossed, Page: Meals },
  { id: 'training', label: 'Training', icon: Dumbbell, Page: Training },
  { id: 'supplements', label: 'Supplements', icon: Pill, Page: Supplements },
  { id: 'profile', label: 'Profile', icon: User, Page: ProfilePage },
] as const

export default function App() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('dashboard')
  const { dark, toggle } = useTheme()
  const Page = TABS.find((t) => t.id === tab)!.Page

  useEffect(() => {
    applyTheme(dark)
  }, [dark])

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sidebar, desktop ── */}
      <aside className="fixed top-0 left-0 hidden h-full w-56 flex-col border-r border-border bg-card lg:flex">
        <div className="px-5 py-6">
          <div className="text-sm font-bold tracking-tight">Personal Plan</div>
          <div className="text-xs text-muted-foreground">Diet · Training · Supplements</div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                tab === t.id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </nav>
        <div className="p-3">
          <button
            onClick={toggle}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
            {dark ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </aside>

      {/* ── Top bar, mobile ── */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/90 px-4 py-3 backdrop-blur lg:hidden">
        <span className="text-sm font-bold">Personal Plan</span>
        <button onClick={toggle} aria-label="Toggle theme" className="text-muted-foreground hover:text-foreground">
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </header>

      <main className="px-4 pt-6 pb-24 lg:ml-56 lg:px-8 lg:pb-10">
        <div className="mx-auto max-w-5xl">
          <Page />
        </div>
      </main>

      {/* ── Bottom nav, mobile ── */}
      <nav className="fixed right-0 bottom-0 left-0 z-10 flex border-t border-border bg-card/95 backdrop-blur lg:hidden">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
              tab === t.id ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <t.icon size={17} />
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
