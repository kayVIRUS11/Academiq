'use client';

import { useState } from 'react';
import { Timer, BrainCircuit, Loader2, Save } from 'lucide-react';
import { StudySession, TimetableEntry, Course } from '@/lib/types';
import { AddStudySession } from '@/components/study-tracker/add-study-session';
import { StudySessionList } from '@/components/study-tracker/study-session-list';
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
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';

export default function StudyTrackerPage() {
  const { setPlan } = useWeeklyPlan();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const coursesQuery = user ? query(collection(db, 'courses'), where('uid', '==', user.uid)) : null;
  const timetableQuery = user ? query(collection(db, 'timetable'), where('uid', '==', user.uid)) : null;
  const sessionsQuery = user ? query(collection(db, 'study-sessions'), where('uid', '==', user.uid)) : null;

  const [coursesSnapshot, coursesLoading] = useCollection(coursesQuery);
  const [timetableSnapshot, timetableLoading] = useCollection(timetableQuery);
  const [sessionsSnapshot, sessionsLoading] = useCollection(sessionsQuery);
  
  const courses = coursesSnapshot?.docs.map(d => ({id: d.id, ...d.data()})) as Course[] || [];
  const timetable = timetableSnapshot?.docs.map(d => ({id: d.id, ...d.data()})) as TimetableEntry[] || [];
  const sessions = sessionsSnapshot?.docs.map(d => ({id: d.id, ...d.data()})) as StudySession[] || [];
  
  const loading = coursesLoading || timetableLoading || sessionsLoading;

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GenerateWeeklyStudyPlanOutput['weeklyPlan'] | null>(null);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);

  const handleAddSession = async (newSessionData: Omit<StudySession, 'id' | 'uid'>) => {
    if (!user) {
        toast({ title: 'You must be logged in', variant: 'destructive' });
        return;
    }
    try {
        await addDoc(collection(db, 'study-sessions'), { ...newSessionData, uid: user.uid });
        toast({title: 'Session logged!'});
    } catch(e) {
        console.error(e);
        toast({title: 'Error logging session', variant: 'destructive'});
    }
  };

  const handleUpdateSession = async (updatedSession: StudySession) => {
    try {
        const { id, ...data } = updatedSession;
        await updateDoc(doc(db, 'study-sessions', id), data);
        toast({title: 'Session updated.'});
    } catch(e) {
        console.error(e);
        toast({title: 'Error updating session', variant: 'destructive'});
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
        await deleteDoc(doc(db, 'study-sessions', sessionId));
        toast({title: 'Session deleted.'});
    } catch(e) {
        console.error(e);
        toast({title: 'Error deleting session', variant: 'destructive'});
    }
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
            <Button variant="outline" onClick={handleGeneratePlan} disabled={isGenerating || loading}>
                {isGenerating ? <Loader2 className="mr-2 animate-spin" /> : <BrainCircuit className="mr-2" />}
                {isGenerating ? 'Generating...' : 'AI Weekly Study Plan'}
            </Button>
            <AddStudySession courses={courses} onAddSession={handleAddSession} />
        </div>
      </div>

        {loading ? (
            <div className="border rounded-lg p-4 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        ) : (
            <StudySessionList
                sessions={sessions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
                courses={courses}
                onUpdateSession={handleUpdateSession}
                onDeleteSession={handleDeleteSession}
            />
        )}


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
                            <p className="text-primary font-medium">{planItem.course}</p>
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
