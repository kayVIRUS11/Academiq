'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useIsMobile } from './use-mobile';

type SidebarContextType = {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  toggle: () => void;
  isMobile: boolean;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false); // For mobile sheet
  const [isCollapsed, setIsCollapsed] = useState(true); // For desktop hover

  const toggle = () => setIsOpen(prev => !prev);
  const setOpen = (value: boolean) => setIsOpen(value);

  return (
    <SidebarContext.Provider value={{ isOpen, setOpen, toggle, isMobile, isCollapsed, setIsCollapsed }}>
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
