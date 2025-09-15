
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DailyActivity } from '@/lib/types';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

type ActivityDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (activity: Omit<DailyActivity, 'id' | 'completed' | 'suggestions'>, id?: string) => void;
  activity: DailyActivity | null;
};

export function ActivityDialog({ isOpen, onOpenChange, onSave, activity }: ActivityDialogProps) {
  const [time, setTime] = useState('09:00-10:00');
  const [activityText, setActivityText] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && activity) {
      setTime(activity.time);
      setActivityText(activity.activity);
    } else if (isOpen && !activity) {
      // Reset for new entry
      setTime('09:00-10:00');
      setActivityText('');
    }
  }, [isOpen, activity]);

  const handleSave = () => {
    if (!activityText.trim() || !time) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out both time and activity fields.',
        variant: 'destructive',
      });
      return;
    }
    onSave({ time, activity: activityText }, activity?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{activity ? 'Edit Activity' : 'Add New Activity'}</DialogTitle>
          <DialogDescription>
            Enter the details for your scheduled activity.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="time" className="text-right">
              Time
            </Label>
            <Input
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="e.g., 09:00-10:30"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="activity" className="text-right">
              Activity
            </Label>
            <Input
              id="activity"
              value={activityText}
              onChange={(e) => setActivityText(e.target.value)}
              placeholder="e.g., Review Chemistry notes"
              className="col-span-3"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Activity</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
