'use client';

import { useState, useEffect } from 'react';
import { Task, Course } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, MoreVertical, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditTask } from './edit-task';
import { Checkbox } from '../ui/checkbox';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';

type TaskItemProps = {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
};

const priorityStyles = {
    High: 'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/30',
    Low: 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30',
}

export function TaskItem({ task, onUpdate, onDelete, onToggle }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
        if (!task.courseId || !user) return;
        const { data } = await supabase.from('courses').select('*').eq('id', task.courseId).single();
        if (data) setCourse(data as Course);
    }
    fetchCourse();
  }, [task.courseId, user]);

  const dueDate = new Date(task.dueDate);

  const getDueDateLabel = () => {
    if (isPast(dueDate) && !task.completed) return `Overdue`;
    return `Due in ${formatDistanceToNow(dueDate, { addSuffix: false })}`;
  }

  return (
    <>
      <Card className={cn("transition-all", task.completed && "bg-muted/50")}>
        <CardContent className="p-4 flex items-start gap-4">
          <Checkbox 
            className="mt-1"
            checked={task.completed}
            onCheckedChange={() => onToggle(task.id)}
          />
          <div className="flex-1">
            <p className={cn("font-medium", task.completed && "line-through text-muted-foreground")}>
                {task.title}
            </p>
            <div className="flex items-center gap-2 flex-wrap mt-2">
                <Badge variant="outline" className={cn(priorityStyles[task.priority])}>
                    {task.priority} Priority
                </Badge>
                {course && <Badge variant="secondary">{course.name}</Badge>}
                <p className="text-xs text-muted-foreground">{format(dueDate, 'PPP')}</p>
                {!task.completed && <p className={cn("text-xs", isPast(dueDate) ? "text-red-500" : "text-muted-foreground")}>{getDueDateLabel()}</p>}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setIsEditing(true)}>
                <Edit className="mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onDelete(task.id)} className="text-destructive">
                <Trash className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>
      <EditTask
        task={task}
        isOpen={isEditing}
        onOpenChange={setIsEditing}
        onUpdateTask={onUpdate}
      />
    </>
  );
}
