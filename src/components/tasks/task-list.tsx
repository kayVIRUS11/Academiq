'use client';

import { Task } from '@/lib/types';
import { TaskItem } from './task-item';
import { TaskFilters, FilterState } from './task-filters';
import { useState } from 'react';
import { Card, CardContent } from '../ui/card';

type TaskListProps = {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string) => void;
};

export function TaskList({ tasks, onUpdateTask, onDeleteTask, onToggleTask }: TaskListProps) {
  const [filters, setFilters] = useState<FilterState>({
    status: 'pending',
    priority: 'all',
    course: 'all',
  });

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const filteredTasks = tasks.filter(task => {
    if (filters.status === 'completed' && !task.completed) return false;
    if (filters.status === 'pending' && task.completed) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (filters.course !== 'all' && task.courseId !== filters.course) return false;
    return true;
  }).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className="space-y-4">
      <TaskFilters filters={filters} onFilterChange={handleFilterChange} />
      
      {filteredTasks.length > 0 ? (
        <div className="space-y-4">
          {filteredTasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onUpdate={onUpdateTask} 
              onDelete={onDeleteTask}
              onToggle={onToggleTask}
            />
          ))}
        </div>
      ) : (
        <Card>
            <CardContent className="p-8">
                <p className="text-center text-muted-foreground">No tasks match your current filters. Well done!</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
