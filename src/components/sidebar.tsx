'use client';

import { useSidebar } from '@/hooks/use-sidebar';
import { cn } from '@/lib/utils';
import { SidebarNav } from './sidebar-nav';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { PanelLeftClose } from 'lucide-react';
import { Logo } from './logo';

export function Sidebar() {
  const { isOpen, setOpen, toggle, isMobile } = useSidebar();

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 pt-12 w-72">
          <SheetHeader>
            <SheetTitle className="sr-only">Main Menu</SheetTitle>
          </SheetHeader>
          <SidebarNav onLinkClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 h-full flex-col border-r bg-background transition-transform duration-300 ease-in-out hidden md:flex',
        isOpen ? 'translate-x-0 w-72' : '-translate-x-full w-0'
      )}
    >
      <div className="flex h-full max-h-screen flex-col">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className='flex justify-between items-center p-4'>
                <Logo isCollapsed={!isOpen} />
                 <Button variant="ghost" className={cn(isOpen ? 'opacity-100' : 'opacity-0')} size="icon" onClick={toggle}>
                    <PanelLeftClose className={cn('transition-transform', !isOpen && 'rotate-180')} />
                    <span className="sr-only">Toggle Sidebar</span>
                </Button>
            </div>
          <SidebarNav isCollapsed={!isOpen} />
        </div>
      </div>
    </aside>
  );
}
