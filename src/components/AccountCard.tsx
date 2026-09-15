import { useState } from 'react'
import { CloudOff, CloudUpload, LogOut } from 'lucide-react'
import { signInWithEmail, signOut, useSync } from '@/stores/sync'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

/**
 * Sign-in and sync status for the Profile page. Magic-link email auth only —
 * no passwords to store or leak.
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
