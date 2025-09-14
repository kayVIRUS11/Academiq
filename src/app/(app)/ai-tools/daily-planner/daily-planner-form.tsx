'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { generateDailyPlan, GenerateDailyPlanOutput } from '@/ai/flows/generate-daily-plan';
import { mockTasks, mockTimetable } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { SavePlanDialog } from './save-plan-dialog';
import { DayOfWeek } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useWeeklyPlan } from '../../weekly-plan/weekly-plan-context';

const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function DailyPlannerForm() {
  const [description, setDescription] = useState('');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GenerateDailyPlanOutput['dailyPlan'] | null>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const { toast } = useToast();
  const { plan: weeklyPlan } = useWeeklyPlan();

  const handleGeneratePlan = async () => {
    if (!selectedDay) {
        toast({
            title: 'Error',
            description: 'Please select a day to generate a plan for.',
            variant: 'destructive',
        });
        return;
    }

    setIsLoading(true);
    setGeneratedPlan(null);
    try {
      const timetableString = mockTimetable.filter(entry => entry.day === selectedDay).map(
          (entry) =>
            `${entry.day}: ${entry.startTime}-${entry.endTime} - Class for ${entry.courseId} at ${entry.location}`
        ).join('\n') || 'No scheduled classes.';
      
      const tasksForDay = mockTasks.filter(t => !t.completed && new Date(t.dueDate).toLocaleDateString('en-US', { weekday: 'long' }) === selectedDay);

      const tasksString = tasksForDay.map(
          (task) =>
            `- ${task.title} (Due: ${new Date(task.dueDate).toLocaleDateString()}, Priority: ${task.priority})`
        ).join('\n') || 'No tasks due.';

      const scheduledStudyString = weeklyPlan.filter(p => p.day === selectedDay).map(
        (p) => `- ${p.time}: Study ${p.course} (${p.activity})`
      ).join('\n') || 'No specific study blocks scheduled.';
        
      const result = await generateDailyPlan({
        timetable: timetableString,
        tasks: tasksString,
        scheduledStudy: scheduledStudyString,
        desiredDayDescription: description,
      });

      setGeneratedPlan(result.dailyPlan);
      
      toast({
        title: 'Plan Generated!',
        description: `Review your personalized plan for ${selectedDay} below.`,
      });

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
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="day-select">Select a Day</Label>
                <Select onValueChange={(value: DayOfWeek) => setSelectedDay(value)}>
                    <SelectTrigger id="day-select">
                        <SelectValue placeholder="Which day are you planning for?" />
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
        </div>
        <Textarea
          placeholder="e.g., I want to focus on my physics assignment in the morning, take a long lunch break, and do some light reading in the evening. I feel most energetic after my morning coffee."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          disabled={isLoading}
        />
        <Button onClick={handleGeneratePlan} disabled={isLoading || !description.trim() || !selectedDay}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Plan...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Plan
            </>
          )}
        </Button>
      </div>

      {generatedPlan && (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold font-headline">Generated Plan for {selectedDay}</h3>
                <Button variant="outline" onClick={() => setIsSaveDialogOpen(true)}>
                    <Save className="mr-2" />
                    Save Plan
                </Button>
            </div>
            <Card>
                <CardContent className="p-6 space-y-4">
                    {generatedPlan.map((item, index) => (
                        <div key={index} className="flex gap-4 items-start">
                            <div className="font-semibold text-sm text-primary w-28 text-right">{item.time}</div>
                            <div className="flex-1 text-sm">{item.activity}</div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
      )}
      {generatedPlan && selectedDay && (
        <SavePlanDialog 
            isOpen={isSaveDialogOpen}
            onOpenChange={setIsSaveDialogOpen}
            plan={generatedPlan}
            defaultDay={selectedDay}
        />
      )}
    </>
  );
}
