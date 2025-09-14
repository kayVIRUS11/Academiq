'use client';

import { ThemeProvider } from 'next-themes';
import React, { PropsWithChildren } from 'react';

export function FirebaseProvider({ children }: PropsWithChildren) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
