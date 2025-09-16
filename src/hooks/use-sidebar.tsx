'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useIsMobile } from './use-mobile';

type SidebarContextType = {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  // Default to open on desktop, closed on mobile
  const [isOpen, setIsOpen] = useState(false);

  React.useEffect(() => {
    // This effect runs on the client after hydration
    setIsOpen(!isMobile);
  }, [isMobile]);

  const toggle = () => setIsOpen(prev => !prev);
  const setOpen = (value: boolean) => setIsOpen(value);

  return (
    <SidebarContext.Provider value={{ isOpen, setOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
