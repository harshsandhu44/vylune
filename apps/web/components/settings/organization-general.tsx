'use client';

import { useState } from 'react';
import { useOrganizationStore } from '@/stores/organization.store';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export function OrganizationGeneralSettings() {
  const { currentOrganization, isLeader, updateOrganization } = useOrganizationStore();
  const { toast } = useToast();
  const [orgName, setOrgName] = useState(currentOrganization?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const updateOrgMutation = trpc.organization.update.useMutation();

  const handleUpdateName = async () => {
    if (!currentOrganization || !orgName.trim()) return;

    setIsUpdating(true);
    try {
      const updated = await updateOrgMutation.mutateAsync({
        organizationId: currentOrganization.id,
        name: orgName,
      });
      updateOrganization(currentOrganization.id, updated);
      toast({
        title: 'Organization updated',
        description: 'Organization name has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update organization name.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization Name</CardTitle>
          <CardDescription>Update your organization's display name.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                disabled={!isLeader()}
                placeholder="Acme Inc."
              />
              {!isLeader() && (
                <p className="text-xs text-muted-foreground">
                  Only organization leaders can update the name.
                </p>
              )}
            </div>
            {isLeader() && (
              <Button
                onClick={handleUpdateName}
                disabled={!orgName.trim() || orgName === currentOrganization.name || isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update Name'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>View organization information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Organization ID</Label>
            <Input value={currentOrganization.id} disabled />
          </div>
          <div className="space-y-2">
            <Label>Subscription Status</Label>
            <Input
              value={currentOrganization.subscriptionStatus.toUpperCase()}
              disabled
              className="capitalize"
            />
          </div>
          <div className="space-y-2">
            <Label>Total Seats</Label>
            <Input value={currentOrganization.seatCount} disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
