
'use client';

import { AppProviders } from '@/context/app-providers';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProviders>
      {children}
    </AppProviders>
  );
}
