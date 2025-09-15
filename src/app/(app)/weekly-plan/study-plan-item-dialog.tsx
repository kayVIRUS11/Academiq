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
import { Course, DayOfWeek, StudyPlanItem } from '@/lib/types';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';


type StudyPlanItemDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: Omit<StudyPlanItem, 'id'>, id?: string) => void;
  item: StudyPlanItem | null;
  courses: Course[];
  defaultDay: DayOfWeek;
};

const days: DayOfWeek[] = [DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday, DayOfWeek.Sunday];

export function StudyPlanItemDialog({ isOpen, onOpenChange, onSave, item, courses, defaultDay }: StudyPlanItemDialogProps) {
  const [time, setTime] = useState('14:00-16:00');
  const [activity, setActivity] = useState('');
  const [courseName, setCourseName] = useState('');
  const [day, setDay] = useState<DayOfWeek>(defaultDay);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setTime(item.time);
        setActivity(item.activity);
        setCourseName(item.course);
        setDay(item.day);
      } else {
        // Reset for new entry
        setTime('14:00-16:00');
        setActivity('');
        setCourseName('');
        setDay(defaultDay);
      }
    }
  }, [isOpen, item, defaultDay]);

  const handleSave = () => {
    if (!activity.trim() || !time.trim() || !courseName.trim() || !day) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out all fields.',
        variant: 'destructive',
      });
      return;
    }
    onSave({ time, activity, course: courseName, day }, item?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Study Block' : 'Add New Study Block'}</DialogTitle>
          <DialogDescription>
            Enter the details for your study session.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="day">Day</Label>
                <Select onValueChange={(value: DayOfWeek) => setDay(value)} value={day}>
                    <SelectTrigger id="day">
                        <SelectValue placeholder="Select a day" />
                    </SelectTrigger>
                    <SelectContent>
                    {days.map(d => (
                        <SelectItem key={d} value={d}>
                        {d}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                    id="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g., 14:00 - 16:00"
                />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Select onValueChange={setCourseName} value={courseName}>
                <SelectTrigger id="course">
                    <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                {courses.map(c => (
                    <SelectItem key={c.id} value={c.name}>
                    {c.name}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity">Activity</Label>
            <Textarea
              id="activity"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="e.g., Review lecture notes, work on problem set 3"
            />
          </div>

        </div>
        <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Block</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
