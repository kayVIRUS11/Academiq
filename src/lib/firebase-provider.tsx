'use client';

import { AppRouterCacheProvider } from 'next/dist/client/components/app-router';
import { ThemeProvider } from 'next-themes';
import React, { PropsWithChildren } from 'react';

export function FirebaseProvider({ children }: PropsWithChildren) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
