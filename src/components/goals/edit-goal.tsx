'use client';

import { Goal } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { GoalForm } from './goal-form';

type EditGoalProps = {
  goal: Goal;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateGoal: (goal: Goal) => void;
};

export function EditGoal({ goal, isOpen, onOpenChange, onUpdateGoal }: EditGoalProps) {
  const handleSubmit = (values: any) => {
    onUpdateGoal({ ...goal, ...values });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Goal</DialogTitle>
          <DialogDescription>
            Update the details of your goal.
          </DialogDescription>
        </DialogHeader>
        <GoalForm
          onSubmit={handleSubmit}
          defaultValues={goal}
          submitButtonText="Save Changes"
        />
      </DialogContent>
    </Dialog>
  );
}
