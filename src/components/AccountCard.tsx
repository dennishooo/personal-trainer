import { useState } from 'react'
import { CloudOff, CloudUpload, LogOut } from 'lucide-react'
import { signInWithEmail, signInWithGoogle, signOut, useSync } from '@/stores/sync'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

/** Google "G", inline so it follows currentColor sizing without an asset. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.02.15 3.5 2.7.24.03c2.2-2.1 3.5-5.1 3.5-8.6" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2a7.2 7.2 0 0 1-6.8-5l-.14.01-3.7 2.8-.05.13A12 12 0 0 0 12 24" />
      <path fill="#FBBC05" d="M5.2 14.4a7.4 7.4 0 0 1 0-4.7l-.01-.16-3.7-2.9-.12.06a12 12 0 0 0 0 10.7l3.9-3" />
      <path fill="#EB4335" d="M12 4.6c2.3 0 3.9 1 4.8 1.8l3.5-3.4A11.8 11.8 0 0 0 12 0 12 12 0 0 0 1.3 6.7l3.9 3A7.2 7.2 0 0 1 12 4.6" />
    </svg>
  )
}

/**
 * Sign-in and sync status for the Profile page. Magic-link email or Google
 * OAuth — never passwords, so there's nothing to store or leak.
 */
export function AccountCard() {
  const { status, email, error } = useSync()
  const [input, setInput] = useState('')
  const [sent, setSent] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  if (status === 'local-only') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudOff size={16} /> Account & sync
          </CardTitle>
          <CardDescription>
            Sync is not configured in this build, so everything stays in this browser. To enable it,
            set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> — see the
            README.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (status === 'signed-out') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudUpload size={16} /> Account & sync
          </CardTitle>
          <CardDescription>
            Sign in to back up your plan and use it from any device. First sign-in uploads what's
            already in this browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <p className="text-sm">
              Check your email — we sent a sign-in link to <strong>{input}</strong>.
            </p>
          ) : (
            <form
              className="flex flex-wrap gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                void signInWithEmail(input).then((err) => (err ? setSendError(err) : setSent(true)))
              }}
            >
              <input
                type="email"
                required
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email for sign-in link"
                className="h-9 min-w-56 flex-1 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button type="submit" size="sm">
                Email me a sign-in link
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void signInWithGoogle().then((err) => err && setSendError(err))}
              >
                <GoogleMark /> Sign in with Google
              </Button>
            </form>
          )}
          {sendError && <p className="mt-2 text-xs text-destructive">{sendError}</p>}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudUpload size={16} /> Account & sync
          <Badge tone={status === 'error' ? 'destructive' : status === 'syncing' ? 'outline' : 'success'}>
            {status}
          </Badge>
        </CardTitle>
        <CardDescription>
          Signed in as <strong>{email}</strong>. Changes save to your account automatically; this
          device also keeps a local copy.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => void signOut()}>
          <LogOut size={14} className="mr-1.5" /> Sign out
        </Button>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </CardContent>
    </Card>
  )
}
