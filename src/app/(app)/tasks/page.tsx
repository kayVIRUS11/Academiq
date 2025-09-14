'use client';

import { useState } from 'react';
import { ListTodo } from 'lucide-react';
import { mockTasks } from '@/lib/mock-data';
import { Task } from '@/lib/types';
import { TaskList } from '@/components/tasks/task-list';
import { AddTask } from '@/components/tasks/add-task';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  const handleAddTask = (newTask: Omit<Task, 'id' | 'completed'>) => {
    setTasks(prev => [
      ...prev,
      {
        ...newTask,
        id: (prev.length + 1).toString(),
        completed: false,
      },
    ]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };
  
  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <ListTodo className="w-8 h-8" />
          Task Management
        </h1>
        <AddTask onAddTask={handleAddTask} />
      </div>

      <TaskList 
        tasks={tasks} 
        onUpdateTask={handleUpdateTask} 
        onDeleteTask={handleDeleteTask}
        onToggleTask={handleToggleTask}
      />
    </div>
  );
}
