import { useState } from 'react'
import { Play } from 'lucide-react'

/**
 * Lazy YouTube embed: renders only the thumbnail until tapped, so a page of
 * two dozen exercises doesn't load two dozen iframes. The real player loads
 * on demand via the privacy-enhanced youtube-nocookie domain.
 */
export function FormVideo({ videoId, title }: { videoId: string; title: string }) {
  const [playing, setPlaying] = useState(false)

  if (playing) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg border border-border">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={`${title} — form demo`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    )
  }

  return (
    <button
      onClick={() => setPlaying(true)}
      className="group relative block aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted"
      aria-label={`Play form video: ${title}`}
    >
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white transition-colors group-hover:bg-black/75">
          <Play size={20} className="ml-0.5" fill="currentColor" />
        </span>
      </span>
    </button>
  )
}
