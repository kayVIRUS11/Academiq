'use client';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';
import { useSidebar } from './ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { useIsMobile } from '@/hooks/use-mobile';

export function Header() {
  const { open, setOpen } = useSidebar();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Sheet>
                <SheetTrigger asChild>
                    <Button size="icon" variant="outline">
                        <Menu />
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:max-w-xs pt-12">
                    <SidebarNav />
                </SheetContent>
            </Sheet>
        </header>
    )
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <Button size="icon" variant="outline" onClick={() => setOpen(!open)}>
            <Menu />
            <span className="sr-only">Toggle Menu</span>
        </Button>
    </header>
  );
}
