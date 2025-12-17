'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { useOrganizationStore } from '@/stores/organization.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { currentOrganization, updateOrganization } = useOrganizationStore();
  const [isActivated, setIsActivated] = useState(false);

  const { data: updatedOrg, isLoading } = trpc.organization.get.useQuery(
    { organizationId: currentOrganization?.id! },
    {
      enabled: !!currentOrganization && !isActivated,
      refetchInterval: 2000, // Poll every 2 seconds
    }
  );

  useEffect(() => {
    if (updatedOrg && updatedOrg.subscriptionStatus === 'active') {
      setIsActivated(true);
      updateOrganization(updatedOrg.id, updatedOrg);

      // Redirect to billing settings after 3 seconds
      setTimeout(() => {
        router.push('/settings/organization?tab=billing');
      }, 3000);
    }
  }, [updatedOrg, updateOrganization, router]);

  const handleGoToBilling = () => {
    router.push('/settings/organization?tab=billing');
  };

  const handleGoToDashboard = () => {
    router.push('/');
  };

  if (isLoading && !updatedOrg) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {isActivated ? (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Payment Successful!</CardTitle>
              <CardDescription>
                Your subscription has been activated. Redirecting to billing settings...
              </CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl">Processing Payment...</CardTitle>
              <CardDescription>
                We're activating your subscription. This may take a few moments.
              </CardDescription>
            </>
          )}
        </CardHeader>
        {isActivated && (
          <CardContent className="space-y-2">
            <Button onClick={handleGoToBilling} className="w-full">
              Go to Billing Settings
            </Button>
            <Button onClick={handleGoToDashboard} variant="outline" className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        )}
        {!isActivated && (
          <CardContent>
            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground text-center">
              Please don't close this page. You'll be redirected automatically once your subscription
              is active.
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
