'use client';

import React from 'react';
import { NotesProvider } from '@/app/(app)/notes/notes-context';
import { ActivitiesProvider } from '@/app/(app)/daily-activities/activities-context';
import { FlashcardsProvider } from '@/app/(app)/ai-tools/flashcards/flashcards-context';
import { WeeklyPlanProvider } from '@/app/(app)/weekly-plan/weekly-plan-context';
import { PomodoroProvider } from '@/context/pomodoro-context';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import { CoursesProvider } from './courses-context';
import { Course } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/sidebar';
import { SidebarProvider, useSidebar } from '@/hooks/use-sidebar.tsx';
import { Header } from '@/components/header';

function AppShell({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const { isOpen } = useSidebar();
    
    if (loading || !user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <Sidebar />
            <div className={cn(
                "flex flex-col sm:gap-4 sm:py-4 transition-all duration-300 ease-in-out", 
                isOpen ? "md:pl-72" : "md:pl-20"
            )}>
                <Header />
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 animate-in fade-in-50">
                    {children}
                </main>
            </div>
        </div>
    )
}

export function AppProviders({
  children,
  courses,
}: {
  children: React.ReactNode;
  courses: Course[];
}) {
  return (
    <SidebarProvider>
      <CoursesProvider initialCourses={courses}>
          <ActivitiesProvider>
              <NotesProvider>
                  <FlashcardsProvider>
                      <WeeklyPlanProvider>
                          <PomodoroProvider>
                              <AppShell>
                                {children}
                              </AppShell>
                          </PomodoroProvider>
                      </WeeklyPlanProvider>
                  </FlashcardsProvider>
              </NotesProvider>
          </ActivitiesProvider>
      </CoursesProvider>
    </SidebarProvider>
  )
}
