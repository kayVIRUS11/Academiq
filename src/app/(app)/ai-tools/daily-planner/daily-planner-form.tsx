'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { generateDailyPlan } from '@/ai/flows/generate-daily-plan';
import { mockTasks, mockTimetable } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';
import { useDailyActivities } from '../../daily-activities/activities-context';

export function DailyPlannerForm() {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { setActivities } = useDailyActivities();

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    try {
      const timetableString = mockTimetable.map(
          (entry) =>
            `${entry.day}: ${entry.startTime}-${entry.endTime} - ${entry.courseId} at ${entry.location}`
        ).join('\n');
      
      const tasksString = mockTasks.filter(t => !t.completed).map(
          (task) =>
            `- ${task.title} (Due: ${new Date(task.dueDate).toLocaleDateString()}, Priority: ${task.priority})`
        ).join('\n');
        
      const result = await generateDailyPlan({
        timetable: timetableString,
        tasks: tasksString,
        desiredDayDescription: description,
      });

      setActivities(result.dailyPlan.map(item => ({ ...item, completed: false })));
      
      toast({
        title: 'Plan Generated!',
        description: 'Your personalized daily plan is ready.',
      });

      router.push('/daily-activities');

    } catch (error) {
      console.error('Error generating plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate plan. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Textarea
        placeholder="e.g., I want to focus on my physics assignment in the morning, take a long lunch break, and do some light reading in the evening. I feel most energetic after my morning coffee."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={6}
        disabled={isLoading}
      />
      <Button onClick={handleGeneratePlan} disabled={isLoading || !description.trim()}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Plan...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate & View Plan
          </>
        )}
      </Button>
    </div>
  );
}
