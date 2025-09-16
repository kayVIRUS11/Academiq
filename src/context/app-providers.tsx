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

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
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
    </SidebarProvider>
  );
}
