
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface InstallPromptContextType {
  installPromptEvent: BeforeInstallPromptEvent | null;
  triggerInstallPrompt: () => void;
}

const InstallPromptContext = createContext<InstallPromptContextType | undefined>(undefined);

export function InstallPromptProvider({ children }: { children: ReactNode }) {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const triggerInstallPrompt = () => {
    if (!installPromptEvent) {
      return;
    }
    installPromptEvent.prompt();
    // Wait for the user to respond to the prompt
    installPromptEvent.userChoice.then(() => {
      setInstallPromptEvent(null);
    });
  };

  return (
    <InstallPromptContext.Provider value={{ installPromptEvent, triggerInstallPrompt }}>
      {children}
    </InstallPromptContext.Provider>
  );
}

export function useInstallPrompt() {
  const context = useContext(InstallPromptContext);
  if (context === undefined) {
    throw new Error('useInstallPrompt must be used within an InstallPromptProvider');
  }
  return context;
}
