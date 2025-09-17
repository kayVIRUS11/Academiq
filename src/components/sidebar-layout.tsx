'use client';

import React from 'react';
import { Sidebar } from './sidebar';
import { useSidebar } from '@/hooks/use-sidebar';
import { cn } from '@/lib/utils';
import { Header } from './header';

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed, isMobile } = useSidebar();

  return (
    <div className="min-h-screen w-full bg-muted/40">
        <Sidebar />
        <div 
            className={cn(
                "flex flex-col sm:gap-4 sm:py-4 transition-all duration-300 ease-in-out",
                !isMobile && (isCollapsed ? "sm:pl-20" : "sm:pl-72")
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
