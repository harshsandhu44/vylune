import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Profile and password.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Basic account details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" action="#">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              {/* TODO: populate from session/user (Cognito) */}
              <Input id="email" type="email" defaultValue="owner@example.com" disabled />
            </div>

            <Button type="submit" disabled>
              {/* TODO: enable when editable fields exist + wire to tRPC */}
              Save
            </Button>
          </form>

          <Separator className="my-6" />

          <form className="grid gap-4" action="#">
            <div className="grid gap-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input id="currentPassword" type="password" autoComplete="current-password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input id="newPassword" type="password" autoComplete="new-password" />
            </div>

            <Button type="submit">
              {/* TODO: call auth provider password change flow (Better Auth / Cognito) */}
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
