
'use client';

import { ListTodo } from 'lucide-react';
import { Task } from '@/lib/types';
import { TaskList } from '@/components/tasks/task-list';
import { AddTask } from '@/components/tasks/add-task';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { useFirebase } from '@/firebase';
import { useState, useEffect, useCallback } from 'react';
import { useCourses } from '@/context/courses-context';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function TasksPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { firestore } = useFirebase();
  const { courses } = useCourses();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !firestore) {
        setLoading(false);
        return;
    };
    setLoading(true);
    const tasksQuery = query(collection(firestore, 'users', user.uid, 'tasks'));
    
    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        setTasks(tasksData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching tasks:", error);
        toast({ title: 'Error fetching tasks', description: error.message, variant: 'destructive' });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore, toast]);

  const handleAddTask = async (newTaskData: Omit<Task, 'id' | 'completed' | 'uid'>) => {
    if (!user || !firestore) {
        toast({ title: 'You must be logged in', variant: 'destructive' });
        return;
    }

    try {
        const tasksCollection = collection(firestore, 'users', user.uid, 'tasks');
        await addDoc(tasksCollection, {
            ...newTaskData,
            completed: false,
            uid: user.id,
        });
        toast({ title: 'Task added!' });
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error adding task', description: error.message, variant: 'destructive' });
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    if (!user || !firestore) return;
    try {
      const { id, ...taskData } = updatedTask;
      const taskDoc = doc(firestore, 'users', user.uid, 'tasks', id);
      await updateDoc(taskDoc, taskData);
      toast({ title: 'Task updated.' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error updating task', description: e.message, variant: 'destructive' });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user || !firestore) return;
    try {
      const taskDoc = doc(firestore, 'users', user.uid, 'tasks', taskId);
      await deleteDoc(taskDoc);
      toast({ title: 'Task deleted.' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error deleting task', description: e.message, variant: 'destructive' });
    }
  };
  
  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    if (!user || !firestore) return;
    try {
      const taskDoc = doc(firestore, 'users', user.uid, 'tasks', taskId);
      await updateDoc(taskDoc, { completed: !currentStatus });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error toggling task', description: e.message, variant: 'destructive' });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <ListTodo className="w-8 h-8" />
          Task Management
        </h1>
        <AddTask onAddTask={handleAddTask} courses={courses} />
      </div>
      
      {loading ? (
        <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        <TaskList 
          tasks={tasks} 
          onUpdateTask={handleUpdateTask} 
          onDeleteTask={handleDeleteTask}
          onToggleTask={(id) => {
            const task = tasks.find(t => t.id === id);
            if (task) handleToggleTask(id, task.completed);
          }}
          courses={courses}
        />
      )}
    </div>
  );
}
