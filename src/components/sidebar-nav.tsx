'use client';

import {
  BookCopy,
  Calendar,
  LayoutDashboard,
  ListTodo,
  NotebookText,
  User,
  Sparkles,
  Target,
  Timer,
  Donut,
  ChevronDown,
  ClipboardCheck,
  CalendarCheck,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

import { useSidebar } from './ui/sidebar';
import { Logo } from './logo';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/daily-activities', icon: ClipboardCheck, label: 'Daily Activities' },
  { href: '/weekly-plan', icon: CalendarCheck, label: 'Weekly Plan' },
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
  const isMobile = useIsMobile();
  const [isAiToolsOpen, setIsAiToolsOpen] = useState(pathname.startsWith('/ai-tools'));

  const handleLinkClick = () => {
    if (isMobile) {
        setOpen(false);
    }
  };

  const NavLink = ({
    href,
    icon: Icon,
    label,
  }: {
    href: string;
    icon: React.ElementType;
    label: string;
  }) => {
    const isActive = pathname === href;

    if (isMobile) {
      return (
        <Link
          href={href}
          onClick={handleLinkClick}
          className={cn(
            'flex items-center gap-4 px-2.5',
            isActive
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Icon className="h-5 w-5" />
          {label}
        </Link>
      );
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            onClick={handleLinkClick}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="sr-only">{label}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  };

  if (isMobile) {
    return (
      <nav className="grid gap-6 text-lg font-medium">
        <Logo className="mb-4" />
        {navItems.map((item) => (
          <NavLink {...item} key={item.href} />
        ))}
        
        <Collapsible open={isAiToolsOpen} onOpenChange={setIsAiToolsOpen}>
          <CollapsibleTrigger className="w-full">
            <div className={cn(
                "flex items-center justify-between gap-4 px-2.5",
                pathname.startsWith('/ai-tools') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}>
              <div className="flex items-center gap-4">
                <Sparkles className="h-5 w-5" />
                AI Tools
              </div>
              <ChevronDown className={cn("h-5 w-5 transition-transform", isAiToolsOpen && "rotate-180")} />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid gap-4 pl-11 pt-4">
              {aiTools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  onClick={handleLinkClick}
                  className={cn(
                    'text-muted-foreground hover:text-foreground',
                    pathname === tool.href && 'text-foreground'
                  )}
                >
                  {tool.label}
                </Link>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="mt-auto grid gap-6">
            <NavLink href="/settings" icon={User} label="Account" />
        </div>
      </nav>
    );
  }

  return (
    <TooltipProvider>
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/dashboard"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Donut className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">Academiq</span>
        </Link>
        {navItems.map((item) => (
          <NavLink {...item} key={item.href} />
        ))}
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <NavLink href="/ai-tools" icon={Sparkles} label="AI Tools" />
        <NavLink href="/settings" icon={User} label="Account" />
      </nav>
    </TooltipProvider>
  );
}
