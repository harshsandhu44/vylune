'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Command, HandbagIcon, LayoutGridIcon } from 'lucide-react';
import { NavMain } from '@/components/app-sidebar/nav-main';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavUser } from './nav-user';
import { OrganizationSwitcher } from '@/components/organization-switcher';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const path = usePathname();

  const navMain = [
    { title: 'Dashboard', url: '/', icon: LayoutGridIcon, isActive: path === '/' },
    { title: 'Products', url: '/products', icon: HandbagIcon, isActive: path === '/products' },
  ];

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Vylune</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="px-2 py-2">
          <OrganizationSwitcher />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
