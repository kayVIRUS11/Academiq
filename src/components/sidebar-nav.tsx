'use client';

import {
  BookCopy,
  Calendar,
  LayoutDashboard,
  ListTodo,
  MoreHorizontal,
  NotebookText,
  Settings,
  Sparkles,
  Target,
  Timer,
  Doughnut,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { Logo } from './logo';
import { useSidebar } from './ui/sidebar';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/goals', icon: Target, label: 'Goals' },
  { href: '/tasks', icon: ListTodo, label: 'Tasks' },
  { href: '/courses', icon: BookCopy, label: 'Courses' },
  { href: '/notes', icon: NotebookText, label: 'Notes & Journal' },
  { href: '/study-tracker', icon: Timer, label: 'Study Tracker' },
  { href: '/timetable', icon: Calendar, label: 'Timetable' },
];

const aiTools = [
  { href: '/ai-tools/daily-planner', label: 'Daily Planner' },
  { href: '/ai-tools/file-summarizer', label: 'File Summarizer' },
  { href: '/ai-tools/flashcards', label: 'Flashcard Generator' },
  { href: '/ai-tools/study-guide', label: 'Study Guide Generator' },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { setOpen } = useSidebar();

  const handleLinkClick = () => {
    setOpen(false);
  };

  const mainNav = (
    <>
      {navItems.map((item) => (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              onClick={handleLinkClick}
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                pathname === item.href
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground'
              } transition-colors hover:text-foreground md:h-8 md:w-8`}
            >
              <item.icon className="h-5 w-5" />
              <span className="sr-only">{item.label}</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      ))}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <TooltipProvider>
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
          <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <Link
              href="/dashboard"
              className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
            >
              <Doughnut className="h-4 w-4 transition-all group-hover:scale-110" />
              <span className="sr-only">Academiq</span>
            </Link>
            {mainNav}
          </nav>
          <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/ai-tools"
                  onClick={handleLinkClick}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    pathname.startsWith('/ai-tools')
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  } transition-colors hover:text-foreground md:h-8 md:w-8`}
                >
                  <Sparkles className="h-5 w-5" />
                  <span className="sr-only">AI Tools</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">AI Tools</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/settings"
                  onClick={handleLinkClick}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    pathname === '/settings'
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  } transition-colors hover:text-foreground md:h-8 md:w-8`}
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </nav>
        </aside>
      </TooltipProvider>

      {/* Mobile Sheet */}
      <div className="sm:hidden">
        <nav className="grid gap-6 text-lg font-medium">
          <Logo />
          {mainNav}
        </nav>
      </div>
    </>
  );
}