
'use client';

import React, { useEffect } from 'react';
import { NotesProvider } from '@/app/(app)/notes/notes-context';
import { ActivitiesProvider } from '@/app/(app)/daily-activities/activities-context';
import { FlashcardsProvider } from '@/app/(app)/ai-tools/flashcards/flashcards-context';
import { WeeklyPlanProvider } from '@/app/(app)/weekly-plan/weekly-plan-context';
import { PomodoroProvider } from '@/context/pomodoro-context';
import { CoursesProvider } from './courses-context';
import { Course } from '@/lib/types';
import { SidebarProvider } from '@/hooks/use-sidebar';
import { SidebarLayout } from '@/components/sidebar-layout';
import { InstallPromptProvider } from './install-prompt-context';

export function AppProviders({
  children,
  courses,
}: {
  children: React.ReactNode;
  courses: Course[];
}) {

    useEffect(() => {
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
          navigator.serviceWorker
            .register("/sw.js")
            .then((reg) => console.log("Service Worker registered:", reg))
            .catch((err) => console.error("Service Worker registration failed:", err));
        });
      }
    }, []);
    
  return (
    <InstallPromptProvider>
      <SidebarProvider>
        <CoursesProvider initialCourses={courses}>
            <ActivitiesProvider>
                <NotesProvider>
                    <FlashcardsProvider>
                        <WeeklyPlanProvider>
                            <PomodoroProvider>
                                <SidebarLayout>
                                  {children}
                                </SidebarLayout>
                            </PomodoroProvider>
                        </WeeklyPlanProvider>
                    </FlashcardsProvider>
                </NotesProvider>
            </ActivitiesProvider>
        </CoursesProvider>
      </SidebarProvider>
    </InstallPromptProvider>
  )
}
