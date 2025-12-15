import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-semibold">
              Inventory MVP
            </Link>

            <nav className="hidden items-center gap-4 md:flex">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
              <Link
                href="/products"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Products
              </Link>
              <Link
                href="/settings"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Settings
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* TODO: replace with real user + logout action (Better Auth / Cognito) */}
            <Button variant="outline" size="sm" asChild>
              <Link href="/(auth)/sign-in">Sign out</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <Separator className="mb-6 md:hidden" />
        {children}
      </div>
    </div>
  );
}
