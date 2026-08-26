import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  // GitHub Pages serves this from /personal-trainer/, not the domain root, so
  // asset URLs need the repo name prefixed. Local dev stays at '/'.
  base: process.env.GITHUB_PAGES ? '/personal-trainer/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': new URL('./src', import.meta.url).pathname } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    coverage: { provider: 'v8', reporter: ['text', 'lcov'] },
  },
})
