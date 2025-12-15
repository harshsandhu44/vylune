import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="min-h-dvh w-full bg-muted/40">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center p-4">
        <div className="mb-6 flex items-center justify-between">
          <Button asChild variant="ghost">
            <Link href="/" className="text-sm font-medium">
              <ArrowLeftIcon /> Back
            </Link>
          </Button>
          <div className="text-sm text-muted-foreground">Vylune</div>
        </div>

        {children}
      </div>
    </div>
  );
}
