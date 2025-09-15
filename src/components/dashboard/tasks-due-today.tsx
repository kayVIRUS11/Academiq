'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ListTodo } from "lucide-react";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, doc, updateDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "../ui/skeleton";
import { useAuth } from "@/context/auth-context";

export function TasksDueToday() {
  const { user } = useAuth();
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const tasksQuery = user ? query(collection(db, 'tasks'), where('uid', '==', user.uid)) : null;
  const [tasksSnapshot, loading] = useCollection(tasksQuery);
  
  const tasksDueToday = tasksSnapshot?.docs.map(doc => ({id: doc.id, ...doc.data()}) as Task)
    .filter(task => {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0,0,0,0);
        return dueDate.getTime() === today.getTime();
    }) || [];

  const handleTaskToggle = async (taskId: string, currentStatus: boolean) => {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, { completed: !currentStatus });
  };

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
