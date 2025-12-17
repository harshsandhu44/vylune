'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { OrganizationGeneralSettings } from '@/components/settings/organization-general';
import { OrganizationMembersSettings } from '@/components/settings/organization-members';
import { OrganizationBillingSettings } from '@/components/settings/organization-billing';
import { cn } from '@/lib/utils';

type Tab = 'general' | 'members' | 'billing';

export default function OrganizationSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('general');

  const tabs = [
    { id: 'general' as const, label: 'General' },
    { id: 'members' as const, label: 'Members' },
    { id: 'billing' as const, label: 'Billing' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Organization Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your organization, members, and subscription.
        </p>
      </div>

      <div className="flex space-x-1 border-b">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            className={cn(
              'rounded-none border-b-2 border-transparent px-4 py-2',
              activeTab === tab.id && 'border-primary'
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'general' && <OrganizationGeneralSettings />}
        {activeTab === 'members' && <OrganizationMembersSettings />}
        {activeTab === 'billing' && <OrganizationBillingSettings />}
      </div>
    </div>
  );
}
