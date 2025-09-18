import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className, isCollapsed }: { className?: string, isCollapsed?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image 
        src="/icons/icon_file.png" 
        alt="Academiq Logo"
        width={36}
        height={36}
        className="shrink-0"
      />
      <span className={cn("text-xl font-bold tracking-tight transition-opacity", isCollapsed ? 'opacity-0 w-0' : 'opacity-100')}>Academiq</span>
    </div>
  );
}
