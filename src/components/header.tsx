'use client';

import { Button } from './ui/button';
import { Menu } from 'lucide-react';
import { useSidebar } from '@/hooks/use-sidebar';

export function Header() {
  const { setOpen } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Button size="icon" variant="outline" onClick={() => setOpen(true)} className="md:hidden">
        <Menu />
        <span className="sr-only">Open Menu</span>
      </Button>
    </header>
  );
}
