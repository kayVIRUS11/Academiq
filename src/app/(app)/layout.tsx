'use client';

import { Header } from '@/components/header';
import { SidebarNav } from '@/components/sidebar-nav';
import { SidebarProvider } from '@/components/ui/sidebar';
import React, { useEffect } from 'react';
import { NotesProvider } from './notes/notes-context';
import { ActivitiesProvider } from './daily-activities/activities-context';
import { FlashcardsProvider } from './ai-tools/flashcards/flashcards-context';
import { WeeklyPlanProvider } from './weekly-plan/weekly-plan-context';
import { PomodoroProvider } from '@/context/pomodoro-context';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <ActivitiesProvider>
        <NotesProvider>
          <FlashcardsProvider>
            <WeeklyPlanProvider>
              <PomodoroProvider>
                <div className="flex min-h-screen w-full flex-col bg-background">
                    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
                    <SidebarNav />
                    </aside>
                    <div className="flex flex-col sm:pl-14">
                    <Header />
                    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 bg-muted/40">
                        {children}
                    </main>
                    </div>
                </div>
              </PomodoroProvider>
            </WeeklyPlanProvider>
          </FlashcardsProvider>
        </NotesProvider>
      </ActivitiesProvider>
    </SidebarProvider>
  );
}
