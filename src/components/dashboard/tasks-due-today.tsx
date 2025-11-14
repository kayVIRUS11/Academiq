
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ListTodo } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { useFirebase } from "@/firebase";
import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';

export function TasksDueToday() {
  const { user } = useAuth();
  const { firestore } = useFirebase();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !firestore) {
        setLoading(false);
        return;
    };
    setLoading(true);

    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const tasksQuery = query(
        collection(firestore, 'users', user.uid, 'tasks'),
        where('dueDate', '>=', today.toISOString().split('T')[0]),
        where('dueDate', '<', tomorrow.toISOString().split('T')[0])
    );
    
    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        setTasks(tasksData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching today's tasks:", error);
        toast({ title: "Error fetching today's tasks", description: error.message, variant: 'destructive' });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore, toast]);


  const handleTaskToggle = async (taskId: string, currentStatus: boolean) => {
    if (!user || !firestore) return;
    const taskDoc = doc(firestore, 'users', user.uid, 'tasks', taskId);
    try {
        await updateDoc(taskDoc, { completed: !currentStatus });
    } catch(error: any) {
        toast({ title: 'Error updating task', description: error.message, variant: 'destructive' });
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
