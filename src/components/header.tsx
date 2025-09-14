'use client';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from './ui/button';
import { Doughnut, PanelLeft } from 'lucide-react';
import { useSidebar } from './ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Logo } from './logo';

export function Header() {
  const { open, setOpen } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      {isMobile && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline">
              <Doughnut />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs">
            <nav className="grid gap-6 text-lg font-medium">
              <Logo />
            </nav>
          </SheetContent>
        </Sheet>
      )}
    </header>
  );
}