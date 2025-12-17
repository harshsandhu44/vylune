'use client';

import { useState } from 'react';
import { useOrganizationStore } from '@/stores/organization.store';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function OrganizationBillingSettings() {
  const { currentOrganization, isLeader, daysRemainingInTrial } = useOrganizationStore();
  const { toast } = useToast();
  const [seatCount, setSeatCount] = useState(currentOrganization?.seatCount || 5);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: seatUsage } = trpc.organization.getSeatUsage.useQuery(
    { organizationId: currentOrganization?.id! },
    { enabled: !!currentOrganization }
  );

  const createCheckoutMutation = trpc.subscription.createCheckout.useMutation();
  const updateSeatsMutation = trpc.subscription.updateSeats.useMutation();

  const handleUpgrade = async () => {
    if (!currentOrganization) return;

    setIsProcessing(true);
    try {
      const result = await createCheckoutMutation.mutateAsync({
        organizationId: currentOrganization.id,
        seatCount,
      });
      window.location.href = result.checkoutUrl;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create checkout session.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  const handleUpdateSeats = async () => {
    if (!currentOrganization) return;

    setIsProcessing(true);
    try {
      await updateSeatsMutation.mutateAsync({
        organizationId: currentOrganization.id,
        newSeatCount: seatCount,
      });
      toast({
        title: 'Seats updated',
        description: 'Your seat count has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update seats.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!currentOrganization) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            No organization selected. Please select or create an organization.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isTrialActive = currentOrganization.subscriptionStatus === 'trial';
  const isSubscribed = currentOrganization.subscriptionStatus === 'active';

  const basePrice = 25;
  const additionalSeats = Math.max(0, seatCount - 5);
  const totalPrice = basePrice + additionalSeats * 10;

  const minSeats = seatUsage?.used || 5;

  return (
    <div className="space-y-6">
      {isTrialActive && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Trial Period Active</AlertTitle>
          <AlertDescription>
            You have {daysRemainingInTrial()} days remaining in your trial. Upgrade now to continue
            using Vylune after your trial ends.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>Manage your subscription and billing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Status</Label>
            <Badge variant={isSubscribed ? 'default' : 'secondary'} className="capitalize">
              {currentOrganization.subscriptionStatus}
            </Badge>
          </div>

          {seatUsage && (
            <div className="flex items-center justify-between">
              <Label>Seats</Label>
              <span className="text-sm">
                {seatUsage.used} / {seatUsage.total} used
              </span>
            </div>
          )}

          {currentOrganization.currentPeriodEnd && isSubscribed && (
            <div className="flex items-center justify-between">
              <Label>Current Period Ends</Label>
              <span className="text-sm">
                {new Date(currentOrganization.currentPeriodEnd).toLocaleDateString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {isLeader() && (
        <Card>
          <CardHeader>
            <CardTitle>{isTrialActive ? 'Upgrade to Paid Plan' : 'Manage Seats'}</CardTitle>
            <CardDescription>
              {isTrialActive
                ? 'Choose your seat count and upgrade to a paid subscription.'
                : 'Update your seat count. You will be charged prorated for the current period.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seatCount">Number of Seats</Label>
              <Input
                id="seatCount"
                type="number"
                min={minSeats}
                value={seatCount}
                onChange={(e) => setSeatCount(parseInt(e.target.value) || minSeats)}
              />
              <p className="text-xs text-muted-foreground">
                Minimum seats: {minSeats} (based on active members)
              </p>
            </div>

            <div className="rounded-lg bg-muted p-4 text-sm">
              <h4 className="font-semibold mb-2">Pricing Breakdown</h4>
              <div className="space-y-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Base plan (5 seats):</span>
                  <span>€{basePrice}</span>
                </div>
                {additionalSeats > 0 && (
                  <div className="flex justify-between">
                    <span>
                      Additional seats ({additionalSeats} × €10):
                    </span>
                    <span>€{additionalSeats * 10}</span>
                  </div>
                )}
                <div className="border-t border-border pt-1 mt-2 flex justify-between font-semibold text-foreground">
                  <span>Total per month:</span>
                  <span>€{totalPrice}</span>
                </div>
              </div>
            </div>

            {isTrialActive && (
              <Button
                onClick={handleUpgrade}
                className="w-full"
                size="lg"
                disabled={seatCount < minSeats || isProcessing}
              >
                {isProcessing ? 'Processing...' : `Upgrade - €${totalPrice}/month`}
              </Button>
            )}

            {isSubscribed && (
              <Button
                onClick={handleUpdateSeats}
                className="w-full"
                disabled={seatCount === currentOrganization.seatCount || seatCount < minSeats || isProcessing}
              >
                {isProcessing ? 'Updating...' : 'Update Seats'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {!isLeader() && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Only organization leaders can manage billing and subscriptions.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
