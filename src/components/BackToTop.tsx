import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

/**
 * Floating scroll-to-top button. Hidden near the top of the page; sits above
 * the mobile bottom nav, closer to the corner on desktop where there isn't one.
 */
export function BackToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!show) return null

  return (
    <button
      type="button"
      onClick={() => window.scrollTo(0, 0)}
      aria-label="Back to top"
      className="fixed bottom-20 right-4 z-30 flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-md transition-colors hover:bg-secondary hover:text-foreground lg:bottom-6 lg:right-6"
    >
      <ArrowUp size={17} />
    </button>
  )
}
