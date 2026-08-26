import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  dark: boolean
  toggle: () => void
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      dark: false,
      toggle: () => set((s) => ({ dark: !s.dark })),
    }),
    { name: 'personal-plan-theme' },
  ),
)

/** Keep the `.dark` class on <html> in sync with the store. */
export function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark)
}
