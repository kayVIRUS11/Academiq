'use client';

import { useSidebar } from '@/hooks/use-sidebar';
import { cn } from '@/lib/utils';
import { SidebarNav } from './sidebar-nav';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Logo } from './logo';

export function Sidebar() {
  const { isOpen, setOpen, isCollapsed, setIsCollapsed, isMobile } = useSidebar();

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-72 flex flex-col">
            <SheetHeader className="p-4 border-b">
                <SheetTitle>
                    <Logo />
                </SheetTitle>
            </SheetHeader>
            <SidebarNav onLinkClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 h-full flex-col border-r bg-background transition-all duration-300 ease-in-out hidden md:flex',
        isCollapsed ? 'w-20' : 'w-72'
      )}
      onMouseEnter={() => !isMobile && setIsCollapsed(false)}
      onMouseLeave={() => !isMobile && setIsCollapsed(true)}
    >
      <div className="flex h-full max-h-screen flex-col">
        <div className="flex h-16 items-center border-b px-4 justify-center">
            <Logo isCollapsed={isCollapsed} />
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <SidebarNav isCollapsed={isCollapsed} />
        </div>
      </div>
    </aside>
  );
}
