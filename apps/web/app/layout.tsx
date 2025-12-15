import type { Metadata } from 'next';
import { Providers } from './providers';
import { RouteGuard } from '@/components/auth/route-guard';
import { configureAmplify } from '@/lib/amplify';
import './globals.css';

configureAmplify();

export const metadata: Metadata = {
  title: 'Vylune - Inventory Management',
  description: 'Modern inventory management system',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@1,2&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <RouteGuard>{children}</RouteGuard>
        </Providers>
      </body>
    </html>
  );
}
