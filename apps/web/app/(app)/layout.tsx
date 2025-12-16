import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';

export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-dvh bg-background">
          <AppHeader />
          <div className="mx-auto max-w-7xl px-4 py-6">
            <Separator className="mb-6 md:hidden" />
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
