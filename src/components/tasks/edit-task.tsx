'use client';

import { Task } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { TaskForm } from './task-form';

type EditTaskProps = {
  task: Task;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTask: (task: Task) => void;
};

export function EditTask({ task, isOpen, onOpenChange, onUpdateTask }: EditTaskProps) {
  const handleSubmit = (values: any) => {
    onUpdateTask({ 
      ...task, 
      ...values,
      dueDate: values.dueDate.toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the details of your task.
          </DialogDescription>
        </DialogHeader>
        <TaskForm
          onSubmit={handleSubmit}
          defaultValues={{...task, dueDate: new Date(task.dueDate)}}
          submitButtonText="Save Changes"
        />
      </DialogContent>
    </Dialog>
  );
}
