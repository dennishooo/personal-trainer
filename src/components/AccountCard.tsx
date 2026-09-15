import { CloudOff, CloudUpload, LogOut } from 'lucide-react'
import { signOut, useSync } from '@/stores/sync'
import { SignInForm } from '@/components/SignInForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

/** Account and sync status on the Profile page. Sign-in itself is gated in App. */
export function AccountCard() {
  const { status, email, error } = useSync()

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

  if (status === 'signed-out' || status === 'restoring') {
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
          <SignInForm />
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
