'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useDailyActivities } from '@/app/(app)/daily-activities/activities-context';
import { DailyActivity, DayOfWeek } from '@/lib/types';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type SavePlanDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Omit<DailyActivity, 'completed'>[];
  defaultDay?: DayOfWeek;
};

const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function SavePlanDialog({ isOpen, onOpenChange, plan, defaultDay }: SavePlanDialogProps) {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(defaultDay || null);
  const { savePlanForDay } = useDailyActivities();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if(isOpen) {
        setSelectedDay(defaultDay || null);
    }
  }, [isOpen, defaultDay])

  const handleSave = () => {
    if (!selectedDay) {
      toast({
        title: 'Error',
        description: 'Please select a day to save the plan.',
        variant: 'destructive',
      });
      return;
    }
    savePlanForDay(selectedDay, plan);
    toast({
      title: 'Plan Saved!',
      description: `Your plan has been saved for ${selectedDay}.`,
    });
    onOpenChange(false);
    router.push('/daily-activities');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Your Plan</DialogTitle>
          <DialogDescription>
            Select which day of the week you would like to save this plan for. This will overwrite any existing plan for that day.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select onValueChange={(value: DayOfWeek) => setSelectedDay(value)} value={selectedDay || undefined}>
            <SelectTrigger>
              <SelectValue placeholder="Select a day" />
            </SelectTrigger>
            <SelectContent>
              {days.map(day => (
                <SelectItem key={day} value={day}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!selectedDay}>Save Plan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
