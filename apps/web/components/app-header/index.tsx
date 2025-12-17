'use client';

import Link from 'next/link';
import { CommandIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { TrialBanner } from '@/components/trial-banner';
import { Button } from '@/components/ui/button';

export function AppHeader() {
  const { state, openMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <Separator orientation="vertical" className="data-[orientation=vertical]:h-4" />
          {(state === 'collapsed' || !openMobile) && (
            <Button asChild variant="link" size="sm">
              <Link href="/">
                <CommandIcon className="size-4" />
                <span className="truncate font-medium">Vylune</span>
              </Link>
            </Button>
          )}
        </div>
        <TrialBanner />
      </div>
    </header>
  );
}
