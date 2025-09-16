'use client';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from './ui/button';
import { Donut, Menu } from 'lucide-react';
import { useSidebar } from './ui/sidebar';
import { SidebarNav } from './sidebar-nav';

export function Header() {
  const { open, setOpen } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <Button size="icon" variant="outline" onClick={() => setOpen(!open)}>
            <Menu />
            <span className="sr-only">Toggle Menu</span>
        </Button>
    </header>
  );
}
