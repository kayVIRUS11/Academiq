'use client';

import React from 'react';
import { Sidebar } from './sidebar';
import { useSidebar } from '@/hooks/use-sidebar';
import { cn } from '@/lib/utils';
import { Header } from './header';

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { isOpen, isMobile } = useSidebar();

  if (isMobile) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Sidebar />
        <div className="flex flex-col">
            <Header />
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 animate-in fade-in-50">
                {children}
            </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <Sidebar />
        <div 
            className={cn(
                "flex flex-col sm:gap-4 sm:py-4 transition-[margin-left] duration-300 ease-in-out",
                isOpen ? "md:ml-72" : "md:ml-0"
            )}
        >
            <Header />
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 animate-in fade-in-50">
                {children}
            </main>
        </div>
    </div>
  );
}
