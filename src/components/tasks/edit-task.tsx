'use client';

import { Task, Course } from '@/lib/types';
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
  courses: Course[];
};

export function EditTask({ task, isOpen, onOpenChange, onUpdateTask, courses }: EditTaskProps) {
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
          courses={courses}
        />
      </DialogContent>
    </Dialog>
  );
}
