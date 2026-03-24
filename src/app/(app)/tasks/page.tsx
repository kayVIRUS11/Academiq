
'use client';

import { ListTodo } from 'lucide-react';
import { Task } from '@/lib/types';
import { TaskList } from '@/components/tasks/task-list';
import { AddTask } from '@/components/tasks/add-task';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { useSupabase } from '@/supabase';
import { useCourses } from '@/context/courses-context';
import { useSupabaseRealtime } from '@/hooks/use-supabase-realtime';

export default function TasksPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { supabase } = useSupabase();
  const { courses } = useCourses();
  const { data: tasks, loading } = useSupabaseRealtime<Task>('tasks', 'created_at', false);

  const handleAddTask = async (newTaskData: Omit<Task, 'id' | 'completed' | 'uid'>) => {
    if (!user || !supabase) {
        toast({ title: 'You must be logged in', variant: 'destructive' });
        return;
    }

    try {
        const dataToSave: any = {
            ...newTaskData,
            completed: false,
            uid: user.id
        };

        if (!dataToSave.courseId) {
            delete dataToSave.courseId;
        }

        const { error } = await supabase.from('tasks').insert(dataToSave);
        if (error) throw error;
        
        toast({ title: 'Task added!' });
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error adding task', description: error.message, variant: 'destructive' });
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    if (!user || !supabase) return;
    try {
      const { id, ...taskData } = updatedTask;
      const { error } = await supabase.from('tasks').update(taskData).eq('id', id);
      if (error) throw error;
      toast({ title: 'Task updated.' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error updating task', description: e.message, variant: 'destructive' });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user || !supabase) return;
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      toast({ title: 'Task deleted.' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error deleting task', description: e.message, variant: 'destructive' });
    }
  };
  
  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    if (!user || !supabase) return;
    try {
      const { error } = await supabase.from('tasks').update({ completed: !currentStatus }).eq('id', taskId);
      if (error) throw error;
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
