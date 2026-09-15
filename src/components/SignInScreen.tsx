import { SignInForm } from '@/components/SignInForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/** Full-screen auth gate: the app is unreachable until the user signs in. */
export function SignInScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <header className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Personal Plan</h1>
          <p className="text-sm text-muted-foreground">Diet · Training · Supplements</p>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Your plan, weigh-ins and meal picks are saved to your account and follow you across
              devices. No passwords — we email you a link, or use Google.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignInForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
