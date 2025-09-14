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
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Sidebar,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Logo } from './logo';

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

  return (
    <Sidebar>
      <div className="flex flex-col h-full">
        <div className="p-4">
            <Link href="/dashboard">
                <Logo />
            </Link>
        </div>
        <SidebarMenu className="flex-1 p-2">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <>
                    <item.icon />
                    <span>{item.label}</span>
                  </>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <Sparkles className="text-accent-foreground" />
              <span>AI Tools</span>
            </SidebarGroupLabel>
            {aiTools.map((item) => (
               <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    size="sm"
                  >
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarGroup>
        </SidebarMenu>

        <div className="p-2 mt-auto">
            <SidebarMenu>
                <SidebarMenuItem>
                    <Link href="/coming-soon" passHref>
                        <SidebarMenuButton asChild tooltip="More features coming soon!" isActive={pathname === '/coming-soon'}>
                            <>
                                <MoreHorizontal />
                                <span>More coming...</span>
                            </>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <Link href="/settings" passHref>
                        <SidebarMenuButton asChild tooltip="Settings" isActive={pathname === '/settings'}>
                            <>
                                <Settings />
                                <span>Settings</span>
                            </>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </SidebarMenu>
        </div>
      </div>
    </Sidebar>
  );
}
