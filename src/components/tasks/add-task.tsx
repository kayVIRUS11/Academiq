'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Plus } from 'lucide-react';
import { TaskForm } from './task-form';
import { Task } from '@/lib/types';

type AddTaskProps = {
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'uid'>) => void;
};

export function AddTask({ onAddTask }: AddTaskProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = (values: any) => {
    onAddTask({
      ...values,
      dueDate: values.dueDate.toISOString(),
    });
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2" />
          Add Task
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add a New Task</SheetTitle>
          <SheetDescription>
            What do you need to get done? Add a new task to your list.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <TaskForm onSubmit={handleSubmit} submitButtonText="Add Task" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
