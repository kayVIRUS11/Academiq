import { BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className, isCollapsed }: { className?: string, isCollapsed?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <BrainCircuit className="h-7 w-7 text-primary shrink-0" />
      <span className={cn("text-xl font-bold tracking-tight transition-opacity", isCollapsed ? 'opacity-0 w-0' : 'opacity-100')}>Academiq</span>
    </div>
  );
}
