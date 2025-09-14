'use client';

import { useState } from 'react';
import { Timer, BrainCircuit, Loader2, Save } from 'lucide-react';
import { mockStudySessions, mockCourses, mockTimetable } from '@/lib/mock-data';
import { StudySession, TimetableEntry } from '@/lib/types';
import { AddStudySession } from '@/components/study-tracker/add-study-session';
import { StudySessionList } from '@/components/study-tracker/study-session-list';
import { Course } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { generateWeeklyStudyPlan, GenerateWeeklyStudyPlanOutput } from '@/ai/flows/generate-weekly-study-plan';
import { useWeeklyPlan } from '../weekly-plan/weekly-plan-context';
import { useRouter } from 'next/navigation';

export default function StudyTrackerPage() {
  const [sessions, setSessions] = useState<StudySession[]>(mockStudySessions);
  const [courses] = useState<Course[]>(mockCourses);
  const [timetable] = useState<TimetableEntry[]>(mockTimetable);
  const { setPlan } = useWeeklyPlan();
  const router = useRouter();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GenerateWeeklyStudyPlanOutput['weeklyPlan'] | null>(null);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddSession = (newSessionData: Omit<StudySession, 'id'>) => {
    setSessions(prev => [
      ...prev,
      {
        ...newSessionData,
        id: (prev.length + 1).toString(),
      },
    ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleUpdateSession = (updatedSession: StudySession) => {
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const result = await generateWeeklyStudyPlan({
        courses,
        timetable,
      });
      setGeneratedPlan(result.weeklyPlan);
      setIsPlanDialogOpen(true);
      toast({ title: 'Study Plan Generated!', description: 'Review your suggested weekly study schedule.' });
    } catch (error) {
      console.error("Failed to generate weekly study plan:", error);
      toast({ title: 'Generation Failed', description: 'Could not generate the plan. Please try again.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  }

  const handleSavePlan = () => {
    if (!generatedPlan) return;
    const planWithIds = generatedPlan.map((item, index) => ({...item, id: `${Date.now()}-${index}`}));
    setPlan(planWithIds);
    toast({
        title: "Plan Saved!",
        description: "Your new weekly study plan has been saved."
    });
    setIsPlanDialogOpen(false);
    router.push('/weekly-plan');
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <Timer className="w-8 h-8" />
          Study Tracker
        </h1>
        <div className='flex gap-2'>
            <Button variant="outline" onClick={handleGeneratePlan} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 animate-spin" /> : <BrainCircuit className="mr-2" />}
                {isGenerating ? 'Generating...' : 'AI Weekly Study Plan'}
            </Button>
            <AddStudySession courses={courses} onAddSession={handleAddSession} />
        </div>
      </div>

      <StudySessionList
        sessions={sessions}
        courses={courses}
        onUpdateSession={handleUpdateSession}
        onDeleteSession={handleDeleteSession}
      />

      <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Your AI-Generated Weekly Study Plan</DialogTitle>
            <DialogDescription>
                Use this as a guide to plan your study sessions. You can save it to your "Weekly Plan" page to edit and track.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-1">
            {daysOfWeek.map(day => (
                <div key={day} className="p-4 rounded-lg bg-secondary/50 space-y-3">
                    <h3 className="font-bold text-lg">{day}</h3>
                    {generatedPlan?.filter(p => p.day === day).map((planItem, index) => (
                        <div key={index} className="p-3 rounded-md bg-background shadow-sm">
                            <p className="font-semibold text-sm">{planItem.time}</p>
                            <p className="text-sm text-primary font-medium">{planItem.course}</p>
                            <p className="text-xs text-muted-foreground">{planItem.activity}</p>
                        </div>
                    ))}
                    {generatedPlan?.filter(p => p.day === day).length === 0 && (
                        <p className="text-sm text-muted-foreground italic">No study sessions suggested.</p>
                    )}
                </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPlanDialogOpen(false)}>View Without Saving</Button>
            <Button onClick={handleSavePlan}><Save className="mr-2" />Save Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
