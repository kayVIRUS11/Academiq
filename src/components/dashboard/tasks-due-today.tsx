'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { mockTasks } from "@/lib/mock-data";
import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ListTodo } from "lucide-react";
import { useState } from "react";

export function TasksDueToday() {
  const today = new Date().toISOString().split('T')[0];
  const [tasks, setTasks] = useState<Task[]>(mockTasks.filter(task => task.dueDate.startsWith(today)));

  const handleTaskToggle = (taskId: string) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <ListTodo />
            <span>Tasks Due Today</span>
        </CardTitle>
        <CardDescription>
            You have {tasks.filter(t => !t.completed).length} tasks left for today.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tasks.length > 0 ? (
          <div className="space-y-4">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center space-x-4">
                <Checkbox 
                  id={`task-${task.id}`} 
                  checked={task.completed}
                  onCheckedChange={() => handleTaskToggle(task.id)}
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
