'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useIsMobile } from './use-mobile';

type SidebarContextType = {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  toggle: () => void;
  isMobile: boolean;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);

  useEffect(() => {
    // Adjust sidebar state when switching between mobile and desktop views
    setIsOpen(!isMobile);
  }, [isMobile]);

  const toggle = () => setIsOpen(prev => !prev);
  const setOpen = (value: boolean) => setIsOpen(value);

  return (
    <SidebarContext.Provider value={{ isOpen, setOpen, toggle, isMobile }}>
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
