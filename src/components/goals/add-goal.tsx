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
import { GoalForm } from './goal-form';
import { Goal } from '@/lib/types';

type AddGoalProps = {
  onAddGoal: (goal: Omit<Goal, 'id' | 'progress'>) => void;
};

export function AddGoal({ onAddGoal }: AddGoalProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = (values: any) => {
    onAddGoal(values);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2" />
          Add Goal
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add a New Goal</SheetTitle>
          <SheetDescription>
            What do you want to achieve? Set a new goal to track your progress.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <GoalForm onSubmit={handleSubmit} submitButtonText="Add Goal" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
