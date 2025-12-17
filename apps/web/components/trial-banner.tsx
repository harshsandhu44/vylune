'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useOrganizationStore } from '@/stores/organization.store';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

export function TrialBanner() {
  const router = useRouter();
  const { isTrialActive, daysRemainingInTrial, currentOrganization } = useOrganizationStore();

  if (!currentOrganization || !isTrialActive()) return null;

  const daysLeft = daysRemainingInTrial();
  const isUrgent = daysLeft <= 2;

  const handleUpgrade = () => {
    router.push('/settings/organization?tab=billing');
  };

  return (
    <Alert variant={isUrgent ? 'destructive' : 'default'} className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Trial Period</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining in your trial
        </span>
        <Button size="sm" variant={isUrgent ? 'outline' : 'default'} onClick={handleUpgrade}>
          Upgrade Now
        </Button>
      </AlertDescription>
    </Alert>
  );
}
