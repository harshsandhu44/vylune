'use client';

import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react';
import { useOrganizationStore } from '@/stores/organization.store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function OrganizationSwitcher() {
  const router = useRouter();
  const { currentOrganization, organizations, setCurrentOrganization } = useOrganizationStore();

  const handleOrganizationSwitch = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId);
    if (org) {
      setCurrentOrganization(org, null);
    }
  };

  const handleCreateOrganization = () => {
    router.push('/onboarding');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between" role="combobox">
          <span className="truncate">{currentOrganization?.name || 'Select organization'}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[250px]" align="start">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => handleOrganizationSwitch(org.id)}
            className="cursor-pointer"
          >
            <Check
              className={cn(
                'mr-2 h-4 w-4',
                currentOrganization?.id === org.id ? 'opacity-100' : 'opacity-0'
              )}
            />
            <span className="truncate">{org.name}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCreateOrganization} className="cursor-pointer">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
