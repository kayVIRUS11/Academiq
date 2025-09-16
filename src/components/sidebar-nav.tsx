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
  ClipboardCheck,
  CalendarCheck,
  FileText,
  Blocks,
  BookOpen,
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
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/daily-activities', icon: ClipboardCheck, label: 'Daily Activities' },
  { href: '/weekly-plan', icon: CalendarCheck, label: 'Weekly Plan' },
  { href: '/goals', icon: Target, label: 'Goals' },
  { href: '/tasks', icon: ListTodo, label: 'Tasks' },
  { href: '/courses', icon: BookCopy, label: 'Courses' },
  { href: '/notes', icon: NotebookText, label: 'Notes' },
  { href: '/study-tracker', icon: Timer, label: 'Study Tracker' },
  { href: '/timetable', icon: Calendar, label: 'Timetable' },
];

const aiTools = [
    { href: '/ai-tools/daily-planner', icon: CalendarCheck, label: 'Daily Planner' },
    { href: '/ai-tools/file-summarizer', icon: FileText, label: 'File Summarizer' },
    { href: '/ai-tools/flashcards', icon: Blocks, label: 'Flashcard Generator' },
    { href: '/ai-tools/study-guide', icon: BookOpen, label: 'Study Guide' },
];

type SidebarNavProps = {
  isCollapsed?: boolean;
  onLinkClick?: () => void;
};

export function SidebarNav({ isCollapsed = false, onLinkClick }: SidebarNavProps) {
  const pathname = usePathname();

  const NavLink = ({
    href,
    icon: Icon,
    label,
  }: {
    href: string;
    icon: React.ElementType;
    label: string;
  }) => {
    const isActive = pathname.startsWith(href) && (href !== '/dashboard' || pathname === '/dashboard');
    const linkContent = (
        <>
            <Icon className="h-5 w-5 shrink-0" />
            <span className={cn('truncate transition-opacity', isCollapsed && 'opacity-0')}>
                {label}
            </span>
        </>
    );

    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={href}
              onClick={onLinkClick}
              className={cn(
                'flex items-center gap-4 rounded-lg px-3 py-2 transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                isCollapsed && 'justify-center'
              )}
            >
              {linkContent}
            </Link>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right" sideOffset={5}>
              {label}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  };
  

  return (
    <div className="flex h-full flex-col p-4">
        <div className={cn("mb-4 transition-all flex", isCollapsed ? 'justify-center' : 'justify-start')}>
            <Logo isCollapsed={isCollapsed} />
        </div>
        <nav className="grid gap-2 text-base font-medium">
            {navItems.map((item) => <NavLink {...item} key={item.href} />)}
        </nav>
        <hr className="my-4" />
        <nav className="grid gap-2 text-base font-medium">
            <h2 className={cn("px-3 py-2 text-sm font-semibold text-muted-foreground transition-opacity", isCollapsed && "opacity-0")}>
                AI Tools
            </h2>
            {aiTools.map((item) => <NavLink {...item} key={item.href} />)}
        </nav>
        <div className="mt-auto grid gap-2">
            <NavLink href="/settings" icon={User} label="Account" />
        </div>
    </div>
  );
}
