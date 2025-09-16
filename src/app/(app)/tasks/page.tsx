
'use client';

import { ListTodo } from 'lucide-react';
import { Task } from '@/lib/types';
import { TaskList } from '@/components/tasks/task-list';
import { AddTask } from '@/components/tasks/add-task';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback } from 'react';
import { useCourses } from '@/context/courses-context';
import { useOnlineStatus } from '@/hooks/use-online-status';
import { queueRequest } from '@/lib/offline-sync';

export default function TasksPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { courses } = useCourses();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const isOnline = useOnlineStatus();

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from('tasks').select('*').eq('uid', user.id);
    if (error) {
      toast({ title: 'Error fetching tasks', description: error.message, variant: 'destructive' });
    } else {
      setTasks(data.map(t => ({...t, dueDate: t.due_date, courseId: t.course_id })));
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = async (newTaskData: Omit<Task, 'id' | 'completed' | 'uid'>) => {
    if (!user) {
        toast({ title: 'You must be logged in', variant: 'destructive' });
        return;
    }
    const tempId = `temp-${Date.now()}`;
    const newTask: Task = {
        ...newTaskData,
        id: tempId,
        uid: user.id,
        completed: false
    };

    setTasks(prev => [...prev, newTask]);
    toast({ title: 'Task added!' });

    if (!isOnline) {
        const { dueDate, courseId, ...rest } = newTaskData;
        const body = { ...rest, due_date: dueDate, course_id: courseId, uid: user.id, completed: false };
        await queueRequest(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/tasks`,
            'POST',
            body,
            { 
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal',
            }
        );
        return;
    }

    const { dueDate, courseId, ...rest } = newTaskData;
    const { error } = await supabase.from('tasks').insert({
        ...rest,
        due_date: dueDate,
        course_id: courseId,
        completed: false,
        uid: user.id,
      });

    if (error) {
      console.error(error);
      toast({ title: 'Error adding task', variant: 'destructive' });
      // Revert optimistic update
      setTasks(prev => prev.filter(t => t.id !== tempId));
    } else {
      // Re-fetch to get the real ID, or ideally get it from response
      fetchTasks();
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    const originalTasks = [...tasks];
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));

    if (!isOnline) {
        const { id, uid, dueDate, courseId, ...taskData } = updatedTask;
        const body = { ...taskData, due_date: dueDate, course_id: courseId };
        await queueRequest(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/tasks?id=eq.${id}`,
            'PUT',
            body,
            { 
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal',
            }
        );
        toast({ title: 'Task updated locally.' });
        return;
    }

    try {
      const { id, uid, dueDate, courseId, ...taskData } = updatedTask;
      const { error } = await supabase.from('tasks').update({ ...taskData, due_date: dueDate, course_id: courseId }).eq('id', id);
      if (error) throw error;
      toast({ title: 'Task updated.' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error updating task', description: e.message, variant: 'destructive' });
      setTasks(originalTasks); // Revert
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const originalTasks = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== taskId));

    if (!isOnline) {
        await queueRequest(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/tasks?id=eq.${taskId}`,
            'DELETE',
            {},
            { 
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
            }
        );
        toast({ title: 'Task deleted locally.' });
        return;
    }

    try {
      await supabase.from('tasks').delete().eq('id', taskId);
      toast({ title: 'Task deleted.' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error deleting task', description: e.message, variant: 'destructive' });
      setTasks(originalTasks); // Revert
    }
  };
  
  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
     const originalTasks = [...tasks];
     setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !currentStatus } : t));

     if(!isOnline) {
        await queueRequest(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/tasks?id=eq.${taskId}`,
            'PUT',
            { completed: !currentStatus },
            { 
                'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal',
            }
        );
        return;
     }

    try {
      const { error } = await supabase.from('tasks').update({ completed: !currentStatus }).eq('id', taskId);
      if (error) throw error;
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error toggling task', description: e.message, variant: 'destructive' });
      setTasks(originalTasks); // Revert
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
