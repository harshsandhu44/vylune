'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useOrganizationStore } from '@/stores/organization.store';

export function TrialBanner() {
  const { isTrialActive, daysRemainingInTrial, currentOrganization } = useOrganizationStore();

  if (!currentOrganization || !isTrialActive()) return null;

  const daysLeft = daysRemainingInTrial();
  const isUrgent = daysLeft <= 2;

  return (
    <div className="flex items-center gap-2">
      <p className="text-sm">
        {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
      </p>
      <Button asChild size="sm" variant={isUrgent ? 'outline' : 'secondary'}>
        <Link href="/settings/organization?tab=billing">Upgrade Now</Link>
      </Button>
    </div>
  );
}
