'use client';

import {
  BookCopy,
  Calendar,
  LayoutDashboard,
  ListTodo,
  NotebookText,
  Settings,
  Sparkles,
  Target,
  Timer,
  Donut,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { useSidebar } from './ui/sidebar';
import { Logo } from './logo';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/goals', icon: Target, label: 'Goals' },
  { href: '/tasks', icon: ListTodo, label: 'Tasks' },
  { href: '/courses', icon: BookCopy, label: 'Courses' },
  { href: '/notes', icon: NotebookText, label: 'Notes & Journal' },
  { href: '/study-tracker', icon: Timer, label: 'Study Tracker' },
  { href: '/timetable', icon: Calendar, label: 'Timetable' },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { setOpen } = useSidebar();
  const isMobile = useIsMobile();

  const handleLinkClick = () => {
    setOpen(false);
  };

  const NavLink = ({
    href,
    icon: Icon,
    label,
    isMobile,
  }: {
    href: string;
    icon: React.ElementType;
    label: string;
    isMobile: boolean;
  }) => {
    const isActive =
      href === '/ai-tools'
        ? pathname.startsWith(href)
        : pathname === href;

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
        <Logo />
        {navItems.map((item) => (
          <NavLink {...item} isMobile={isMobile} key={item.href} />
        ))}
        <div className="mt-auto grid gap-6">
            <NavLink href="/ai-tools" icon={Sparkles} label="AI Tools" isMobile={isMobile} />
            <NavLink href="/settings" icon={Settings} label="Settings" isMobile={isMobile} />
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
          <NavLink {...item} isMobile={isMobile} key={item.href} />
        ))}
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <NavLink href="/ai-tools" icon={Sparkles} label="AI Tools" isMobile={isMobile} />
        <NavLink href="/settings" icon={Settings} label="Settings" isMobile={isMobile} />
      </nav>
    </TooltipProvider>
  );
}
