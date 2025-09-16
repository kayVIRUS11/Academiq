'use client';

import React from 'react';
import { NotesProvider } from '@/app/(app)/notes/notes-context';
import { ActivitiesProvider } from '@/app/(app)/daily-activities/activities-context';
import { FlashcardsProvider } from '@/app/(app)/ai-tools/flashcards/flashcards-context';
import { WeeklyPlanProvider } from '@/app/(app)/weekly-plan/weekly-plan-context';
import { PomodoroProvider } from '@/context/pomodoro-context';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2, Menu } from 'lucide-react';
import { CoursesProvider } from './courses-context';
import { Course } from '@/lib/types';
import { cn } from '@/lib/utils';
import { SidebarNav } from '@/components/sidebar-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';


function AppShell({ children, courses }: { children: React.ReactNode, courses: Course[]}) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const isMobile = useIsMobile();

    // Centralized state management for the sidebar
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(!isMobile);
    const [isMobileSheetOpen, setIsMobileSheetOpen] = React.useState(false);

    // Effect to handle default sidebar state on viewport change
    React.useEffect(() => {
        setIsSidebarOpen(!isMobile);
    }, [isMobile]);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    }
    
    if (loading || !user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            {/* Desktop Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 h-full flex-col border-r bg-background transition-all duration-300 hidden md:flex",
                isSidebarOpen ? "w-72" : "w-0 p-0 border-none"
            )}>
               <div className={cn("flex h-full max-h-screen flex-col gap-2 p-4", !isSidebarOpen && "hidden")}>
                  <div className="flex-1 overflow-y-auto">
                      <SidebarNav />
                  </div>
               </div>
            </aside>

            <div className={cn(
                "flex flex-col sm:gap-4 sm:py-4 transition-all duration-300", 
                isSidebarOpen ? "md:pl-72" : "md:pl-0"
            )}>
                {/* Header with direct control over sidebar */}
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    {isMobile ? (
                        <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
                            <SheetTrigger asChild>
                                <Button size="icon" variant="outline">
                                    <Menu />
                                    <span className="sr-only">Toggle Menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="sm:max-w-xs pt-12">
                                <SidebarNav onLinkClick={() => setIsMobileSheetOpen(false)} />
                            </SheetContent>
                        </Sheet>
                    ) : (
                        <Button size="icon" variant="outline" onClick={toggleSidebar}>
                            <Menu />
                            <span className="sr-only">Toggle Menu</span>
                        </Button>
                    )}
                </header>

                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 animate-in fade-in-50">
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
    <AppShell courses={courses}>
        {children}
    </AppShell>
  )
}
