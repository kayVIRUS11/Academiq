'use client';

import { useSidebar } from '@/hooks/use-sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { SidebarNav } from './sidebar-nav';
import { Sheet, SheetContent } from './ui/sheet';
import { Button } from './ui/button';
import { PanelLeftClose } from 'lucide-react';

export function Sidebar() {
  const { isOpen, setOpen, toggle } = useSidebar();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 pt-12 w-72">
          <SidebarNav onLinkClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 h-full flex-col border-r bg-background transition-all duration-300 ease-in-out hidden md:flex',
        isOpen ? 'w-72' : 'w-20'
      )}
    >
      <div className="flex h-full max-h-screen flex-col">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <SidebarNav isCollapsed={!isOpen} />
        </div>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-center" size="icon" onClick={toggle}>
            <PanelLeftClose className={cn('transition-transform', isOpen && 'rotate-180')} />
          </Button>
        </div>
      </div>
    </aside>
  );
}
