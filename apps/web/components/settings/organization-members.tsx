'use client';

import { useState } from 'react';
import { useOrganizationStore } from '@/stores/organization.store';
import { useAuthStore } from '@/stores/auth.store';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Mail } from 'lucide-react';

export function OrganizationMembersSettings() {
  const { currentOrganization, isLeader } = useOrganizationStore();
  const user = useAuthStore((state) => state.user);
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const { data: members, refetch } = trpc.member.list.useQuery(
    { organizationId: currentOrganization?.id! },
    { enabled: !!currentOrganization }
  );

  const inviteMutation = trpc.member.invite.useMutation();
  const removeMutation = trpc.member.remove.useMutation();

  const handleInvite = async () => {
    if (!currentOrganization || !inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      await inviteMutation.mutateAsync({
        organizationId: currentOrganization.id,
        email: inviteEmail,
        role: 'member',
      });
      setInviteEmail('');
      refetch();
      toast({
        title: 'Invitation sent',
        description: `Invitation sent to ${inviteEmail}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send invitation.',
        variant: 'destructive',
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!currentOrganization) return;

    try {
      await removeMutation.mutateAsync({
        organizationId: currentOrganization.id,
        userId,
      });
      refetch();
      toast({
        title: 'Member removed',
        description: 'Member has been removed from the organization.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove member.',
        variant: 'destructive',
      });
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

  const activeMembers = members?.filter((m) => m.status === 'active') || [];
  const pendingMembers = members?.filter((m) => m.status === 'pending') || [];

  return (
    <div className="space-y-6">
      {isLeader() && (
        <Card>
          <CardHeader>
            <CardTitle>Invite Member</CardTitle>
            <CardDescription>Invite a new team member to your organization.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="inviteEmail">Email Address</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="member@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && inviteEmail.trim()) {
                      handleInvite();
                    }
                  }}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleInvite} disabled={!inviteEmail.trim() || isInviting}>
                  {isInviting ? 'Inviting...' : 'Send Invite'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {pendingMembers.length > 0 && isLeader() && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>Members who haven't accepted their invitations yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingMembers.map((member) => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{member.user?.name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active Members</CardTitle>
          <CardDescription>
            {activeMembers.length} of {currentOrganization.seatCount} seats used
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {activeMembers.map((member) => {
              const isCurrentUser = member.userId === user?.id;
              const canRemove = isLeader() && !isCurrentUser && member.role !== 'leader';

              return (
                <div
                  key={member.userId}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">
                      {member.user?.name || 'Unknown'}
                      {isCurrentUser && (
                        <span className="ml-2 text-sm text-muted-foreground">(You)</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={member.role === 'leader' ? 'default' : 'secondary'}>
                      {member.role}
                    </Badge>
                    {canRemove && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(member.userId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
