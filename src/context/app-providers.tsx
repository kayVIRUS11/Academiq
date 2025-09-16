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
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { CoursesProvider } from './courses-context';
import { Course } from '@/lib/types';
import { Header } from '@/components/header';
import { cn } from '@/lib/utils';


function AppShell({ children, courses }: { children: React.ReactNode, courses: Course[]}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { open, isMobile } = useSidebar();

    React.useEffect(() => {
        if (!loading && !user) {
        router.push('/login');
        }
    }, [user, loading, router]);
    
    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <div className={cn("flex flex-col transition-[padding]", !isMobile && open ? "sm:pl-64" : "sm:pl-14")}>
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
        <AppShell courses={courses}>
            {children}
        </AppShell>
    </SidebarProvider>
  )
}
