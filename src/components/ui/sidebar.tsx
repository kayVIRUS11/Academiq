'use client';

import { useIsMobile } from '@/hooks/use-mobile';
import * as React from 'react';

type SidebarContext = {
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile: boolean;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return context;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);

  const contextValue = React.useMemo(
    () => ({
      open,
      setOpen,
      isMobile,
    }),
    [open, setOpen, isMobile]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
}