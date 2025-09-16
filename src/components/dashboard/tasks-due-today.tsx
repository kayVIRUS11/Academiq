'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ListTodo } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

export function TasksDueToday() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayISO = today.toISOString().slice(0,10);
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('uid', user.id)
      .eq('dueDate', todayISO);

    if (error) {
        toast({ title: "Error fetching today's tasks", description: error.message, variant: 'destructive' });
    } else {
        setTasks(data as Task[]);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);


  const handleTaskToggle = async (taskId: string, currentStatus: boolean) => {
    const { data, error } = await supabase
        .from('tasks')
        .update({ completed: !currentStatus })
        .eq('id', taskId)
        .select();
    
    if (error) {
        toast({ title: 'Error updating task', description: error.message, variant: 'destructive' });
    } else {
        setTasks(prev => prev.map(t => t.id === taskId ? data[0] as Task : t));
    }
  };

  const tasksDueToday = tasks;

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
