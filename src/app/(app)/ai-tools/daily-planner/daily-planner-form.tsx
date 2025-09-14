'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { generateDailyPlan, GenerateDailyPlanOutput } from '@/ai/flows/generate-daily-plan';
import { mockTasks, mockTimetable } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SavePlanDialog } from './save-plan-dialog';

export function DailyPlannerForm() {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GenerateDailyPlanOutput['dailyPlan'] | null>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    setGeneratedPlan(null);
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

      setGeneratedPlan(result.dailyPlan);
      
      toast({
        title: 'Plan Generated!',
        description: 'Review your personalized daily plan below.',
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
              Generate Plan
            </>
          )}
        </Button>
      </div>

      {generatedPlan && (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold font-headline">Generated Plan</h3>
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
      {generatedPlan && (
        <SavePlanDialog 
            isOpen={isSaveDialogOpen}
            onOpenChange={setIsSaveDialogOpen}
            plan={generatedPlan}
        />
      )}
    </>
  );
}
