'use client';

import { Button } from './ui/button';
import { Menu, PanelLeftClose } from 'lucide-react';
import { useSidebar } from '@/hooks/use-sidebar';
import { cn } from '@/lib/utils';

export function Header() {
  const { isOpen, toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Button size="icon" variant="outline" onClick={toggle}>
        <Menu className="md:hidden" />
        <PanelLeftClose className={cn('hidden md:block transition-transform', !isOpen && 'rotate-180')} />
        <span className="sr-only">Toggle Menu</span>
      </Button>
    </header>
  );
}
