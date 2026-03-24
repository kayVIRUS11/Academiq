
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ListTodo } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { useSupabase } from "@/supabase";
import { toast } from "@/hooks/use-toast";
import { useSupabaseRealtime } from "@/hooks/use-supabase-realtime";

export function TasksDueToday() {
  const { user } = useAuth();
  const { supabase } = useSupabase();
  const { data: allTasks, loading } = useSupabaseRealtime<Task>('tasks', 'created_at', false);


  const handleTaskToggle = async (taskId: string, currentStatus: boolean) => {
    if (!user || !supabase) return;
    try {
        const { error } = await supabase.from('tasks').update({ completed: !currentStatus }).eq('id', taskId);
        if (error) throw error;
    } catch(error: any) {
        toast({ title: 'Error updating task', description: error.message, variant: 'destructive' });
    }
  };

  const tasksDueToday = allTasks.filter(task => {
    if (!task.dueDate) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const taskDateStr = task.dueDate;
    return taskDateStr >= today.toISOString().split('T')[0] && taskDateStr < tomorrow.toISOString().split('T')[0];
  });

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <ListTodo />
            <span>Tasks Due Today</span>
        </CardTitle>
        <CardDescription>
            You have {tasksDueToday.filter(t => !t.completed).length} tasks left for today.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : tasksDueToday.length > 0 ? (
          <div className="space-y-4">
            {tasksDueToday.map(task => (
              <div key={task.id} className="flex items-center space-x-4">
                <Checkbox 
                  id={`task-${task.id}`} 
                  checked={task.completed}
                  onCheckedChange={() => handleTaskToggle(task.id, task.completed)}
                />
                <label
                  htmlFor={`task-${task.id}`}
                  className={cn(
                    "text-sm font-medium leading-none flex-1",
                    task.completed ? "line-through text-muted-foreground" : ""
                  )}
                >
                  {task.title}
                </label>
                <div className="text-xs text-muted-foreground">
                  {task.priority}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No tasks due today. Great job!</p>
        )}
      </CardContent>
    </Card>
  );
}
