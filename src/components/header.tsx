'use client';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from './ui/button';
import { Donut } from 'lucide-react';
import { useSidebar } from './ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Logo } from './logo';
import { SidebarNav } from './sidebar-nav';

export function Header() {
  const { open, setOpen } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      {isMobile && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline">
              <Donut />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs pt-12">
            <SidebarNav />
          </SheetContent>
        </Sheet>
      )}
    </header>
  );
}
