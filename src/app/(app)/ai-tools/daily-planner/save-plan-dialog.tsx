
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
import { mergeDailyPlans } from '@/ai/flows/merge-daily-plans';
import { Loader2 } from 'lucide-react';

type SavePlanDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Omit<DailyActivity, 'id' | 'completed'>[];
  defaultDay?: DayOfWeek;
};

const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function SavePlanDialog({ isOpen, onOpenChange, plan, defaultDay }: SavePlanDialogProps) {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(defaultDay || null);
  const { weeklyActivities, savePlanForDay } = useDailyActivities();
  const { toast } = useToast();
  const router = useRouter();
  const [isMerging, setIsMerging] = useState(false);

  useEffect(() => {
    if(isOpen) {
        setSelectedDay(defaultDay || null);
    }
  }, [isOpen, defaultDay])

  const existingPlan = selectedDay ? weeklyActivities[selectedDay] : undefined;

  const handleSave = (shouldReplace: boolean) => {
    if (!selectedDay) {
      toast({ title: 'Error', description: 'Please select a day.', variant: 'destructive' });
      return;
    }

    if (existingPlan && !shouldReplace) {
        // This case should be handled by the merge button, but as a fallback.
        handleMerge();
        return;
    }

    savePlanForDay(selectedDay, plan);
    toast({
      title: 'Plan Saved!',
      description: `Your new plan has been saved for ${selectedDay}.`,
    });
    onOpenChange(false);
    router.push('/daily-activities');
  };

  const handleMerge = async () => {
    if (!selectedDay || !existingPlan) return;
    
    setIsMerging(true);
    try {
        const result = await mergeDailyPlans({
            existingPlan,
            newPlan: plan,
        });

        savePlanForDay(selectedDay, result.mergedPlan);
        toast({
            title: 'Plan Merged!',
            description: `Your plans for ${selectedDay} have been intelligently merged.`,
        });
        onOpenChange(false);
        router.push('/daily-activities');

    } catch (error) {
        console.error("Failed to merge plans:", error);
        toast({
            title: 'Merge Failed',
            description: 'Could not merge plans. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsMerging(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Your Plan</DialogTitle>
          <DialogDescription>
            {existingPlan && existingPlan.length > 0
                ? `A plan already exists for ${selectedDay}. How would you like to save this new plan?`
                : "Select which day of the week you would like to save this plan for."
            }
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select onValueChange={(value: DayOfWeek) => setSelectedDay(value)} value={selectedDay || undefined}>
            <SelectTrigger disabled={!!(existingPlan && existingPlan.length > 0)}>
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
          {existingPlan && existingPlan.length > 0 ? (
            <div className="flex gap-2">
                <Button variant="secondary" onClick={handleMerge} disabled={isMerging}>
                    {isMerging && <Loader2 className="mr-2 animate-spin" />}
                    {isMerging ? 'Merging...' : 'Merge with Existing'}
                </Button>
                <Button onClick={() => handleSave(true)} disabled={!selectedDay || isMerging}>Replace Existing</Button>
            </div>
          ) : (
            <Button onClick={() => handleSave(true)} disabled={!selectedDay}>Save Plan</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
