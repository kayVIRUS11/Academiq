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

export default function TasksPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { courses } = useCourses();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleAddTask = async (newTask: Omit<Task, 'id' | 'completed' | 'uid'>) => {
    if (!user) {
        toast({ title: 'You must be logged in', variant: 'destructive' });
        return;
    }
    const { dueDate, courseId, ...rest } = newTask;
    const { data, error } = await supabase.from('tasks').insert({
        ...rest,
        due_date: dueDate,
        course_id: courseId,
        completed: false,
        uid: user.id,
      }).select();

    if (error) {
      console.error(error);
      toast({ title: 'Error adding task', variant: 'destructive' });
    } else {
      const addedTask = data[0];
      setTasks(prev => [...prev, {...addedTask, dueDate: addedTask.due_date, courseId: addedTask.course_id}]);
      toast({ title: 'Task added!' });
    }
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      const { id, uid, dueDate, courseId, ...taskData } = updatedTask;
      const { data, error } = await supabase.from('tasks').update({ ...taskData, due_date: dueDate, course_id: courseId }).eq('id', id).select();
      if (error) throw error;
      const newTask = data[0];
      setTasks(prev => prev.map(t => t.id === id ? {...newTask, dueDate: newTask.due_date, courseId: newTask.course_id} : t));
      toast({ title: 'Task updated.' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error updating task', description: e.message, variant: 'destructive' });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await supabase.from('tasks').delete().eq('id', taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast({ title: 'Task deleted.' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error deleting task', description: e.message, variant: 'destructive' });
    }
  };
  
  const handleToggleTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      const { data, error } = await supabase.from('tasks').update({ completed: !task.completed }).eq('id', taskId).select();
      if (error) throw error;
      const updatedTask = data[0];
      setTasks(prev => prev.map(t => t.id === taskId ? {...updatedTask, dueDate: updatedTask.due_date, courseId: updatedTask.course_id} : t));
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
          onToggleTask={handleToggleTask}
          courses={courses}
        />
      )}
    </div>
  );
}
