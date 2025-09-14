import { Header } from '@/components/header';
import { SidebarNav } from '@/components/sidebar-nav';
import { SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <SidebarNav />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <Header />
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}