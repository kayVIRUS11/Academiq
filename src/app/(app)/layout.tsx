import { Header } from '@/components/header';
import { SidebarNav } from '@/components/sidebar-nav';
import { SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';
import { NotesProvider } from './notes/notes-context';
import { ActivitiesProvider } from './daily-activities/activities-context';
import { FlashcardsProvider } from './ai-tools/flashcards/flashcards-context';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ActivitiesProvider>
        <NotesProvider>
          <FlashcardsProvider>
            <div className="flex min-h-screen w-full flex-col bg-background">
                <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
                <SidebarNav />
                </aside>
                <div className="flex flex-col sm:pl-14">
                <Header />
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    {children}
                </main>
                </div>
            </div>
          </FlashcardsProvider>
        </NotesProvider>
      </ActivitiesProvider>
    </SidebarProvider>
  );
}
