'use client';

import React from 'react';
import { NotesProvider } from '@/app/(app)/notes/notes-context';
import { ActivitiesProvider } from '@/app/(app)/daily-activities/activities-context';
import { FlashcardsProvider } from '@/app/(app)/ai-tools/flashcards/flashcards-context';
import { WeeklyPlanProvider } from '@/app/(app)/weekly-plan/weekly-plan-context';
import { PomodoroProvider } from '@/context/pomodoro-context';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { CoursesProvider } from './courses-context';
import { Course } from '@/lib/types';
import { Header } from '@/components/header';
import { SidebarNav } from '@/components/sidebar-nav';

export function AppProviders({
  children,
  courses,
}: {
  children: React.ReactNode;
  courses: Course[];
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const appShell = (
    <SidebarProvider>
        <div className="flex min-h-screen w-full flex-col bg-background">
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
            <SidebarNav />
            </aside>
            <div className="flex flex-col sm:pl-14">
            <Header />
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 bg-muted/40 animate-in fade-in-50">
                {loading || !user ? (
                    <div className="flex h-[calc(100vh-theme(space.20))] items-center justify-center">
                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    </div>
                ) : (
                    <CoursesProvider initialCourses={courses}>
                        <ActivitiesProvider>
                            <NotesProvider>
                                <FlashcardsProvider>
                                    <WeeklyPlanProvider>
                                        <PomodoroProvider>
                                            {children}
                                        </PomodoroProvider>
                                    </WeeklyPlanProvider>
                                </FlashcardsProvider>
                            </NotesProvider>
                        </ActivitiesProvider>
                    </CoursesProvider>
                )}
            </main>
            </div>
        </div>
    </SidebarProvider>
  )


  return appShell;
}
