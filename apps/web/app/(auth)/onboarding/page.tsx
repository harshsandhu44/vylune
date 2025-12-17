'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { useOrganizationStore } from '@/stores/organization.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Sparkles } from 'lucide-react';

type Step = 'welcome' | 'create-org' | 'trial-activated';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('welcome');
  const [orgName, setOrgName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const createOrgMutation = trpc.organization.create.useMutation();
  const { setCurrentOrganization } = useOrganizationStore();

  const handleCreateOrganization = async () => {
    if (!orgName.trim()) return;

    setIsCreating(true);
    try {
      const org = await createOrgMutation.mutateAsync({ name: orgName });
      setCurrentOrganization(org, {
        role: 'leader',
        status: 'active',
        organizationId: org.id,
        userId: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      setStep('trial-activated');
    } catch (error) {
      console.error('Failed to create organization:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleComplete = () => {
    router.push('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {step === 'welcome' && (
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome to Vylune</CardTitle>
            <CardDescription>
              Let's set up your organization to get started with inventory management
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setStep('create-org')} className="w-full" size="lg">
              Get Started
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 'create-org' && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create Your Organization</CardTitle>
            <CardDescription>
              Choose a name for your organization. You can change this later in settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                placeholder="Acme Inc."
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && orgName.trim()) {
                    handleCreateOrganization();
                  }
                }}
                autoFocus
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setStep('welcome')} className="flex-1">
              Back
            </Button>
            <Button
              onClick={handleCreateOrganization}
              className="flex-1"
              disabled={!orgName.trim() || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Organization'}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 'trial-activated' && (
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Trial Activated!</CardTitle>
            <CardDescription>
              Your 7-day trial has started. Enjoy full access to all features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 text-sm">
              <h4 className="font-semibold mb-2">What's included:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 5 team seats (including you as leader)</li>
                <li>• Full inventory management</li>
                <li>• Stock movement tracking</li>
                <li>• Team collaboration</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleComplete} className="w-full" size="lg">
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
