'use client';

import { ListTodo } from 'lucide-react';
import { Task } from '@/lib/types';
import { TaskList } from '@/components/tasks/task-list';
import { AddTask } from '@/components/tasks/add-task';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function TasksPage() {
  const { toast } = useToast();
  const [tasksSnapshot, loading, error] = useCollection(collection(db, 'tasks'));

  const tasks: Task[] = loading || !tasksSnapshot
    ? []
    : tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));

  const handleAddTask = async (newTask: Omit<Task, 'id' | 'completed'>) => {
    try {
      await addDoc(collection(db, 'tasks'), {
        ...newTask,
        completed: false,
      });
      toast({ title: 'Task added!' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error adding task', variant: 'destructive' });
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      const { id, ...taskData } = updatedTask;
      await updateDoc(doc(db, 'tasks', id), taskData);
      toast({ title: 'Task updated.' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error updating task', variant: 'destructive' });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      toast({ title: 'Task deleted.' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error deleting task', variant: 'destructive' });
    }
  };
  
  const handleToggleTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      await updateDoc(doc(db, 'tasks', taskId), { completed: !task.completed });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error toggling task', variant: 'destructive' });
    }
  };
  
  if (error) {
    return <p className="text-destructive">Error: {error.message}</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <ListTodo className="w-8 h-8" />
          Task Management
        </h1>
        <AddTask onAddTask={handleAddTask} />
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
          onToggleTask={handleToggleTask}
        />
      )}
    </div>
  );
}
