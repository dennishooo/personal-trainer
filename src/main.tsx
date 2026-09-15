import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { startSync } from '@/stores/sync'
import './index.css'

startSync()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
