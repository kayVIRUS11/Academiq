
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Timer, BrainCircuit, Loader2, Save } from 'lucide-react';
import { StudySession, TimetableEntry, Course, StudyPlanItem } from '@/lib/types';
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
import { generateWeeklyStudyPlan } from '@/ai/flows/generate-weekly-study-plan';
import { useWeeklyPlan } from '../weekly-plan/weekly-plan-context';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { mergeWeeklyPlans } from '@/ai/flows/merge-weekly-study-plan';
import { useFirebase } from '@/firebase';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useCourses } from '@/context/courses-context';

export default function StudyTrackerPage() {
  const { plan: existingPlan, setPlan } = useWeeklyPlan();
  const { courses } = useCourses();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { firestore } = useFirebase();

  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if(!user || !firestore) {
      setLoading(false);
      return;
    };
    setLoading(true);
    
    const timetableQuery = query(collection(firestore, 'users', user.uid, 'timeTables'));
    const sessionsQuery = query(collection(firestore, 'users', user.uid, 'studySessions'));

    const unsubTimetable = onSnapshot(timetableQuery, (snapshot) => {
        setTimetable(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimetableEntry)));
    }, (error) => toast({ title: 'Error fetching timetable', variant: 'destructive' }));

    const unsubSessions = onSnapshot(sessionsQuery, (snapshot) => {
        setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StudySession)));
        setLoading(false);
    }, (error) => {
        toast({ title: 'Error fetching sessions', variant: 'destructive' });
        setLoading(false);
    });

    return () => {
        unsubTimetable();
        unsubSessions();
    };

  }, [user, firestore, toast]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<Omit<StudyPlanItem, 'id'>[] | null>(null);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);

  const handleAddSession = async (newSessionData: Omit<StudySession, 'id' | 'uid'>) => {
    if (!user || !firestore) {
        toast({ title: 'You must be logged in', variant: 'destructive' });
        return;
    }
    try {
        const sessionsCollection = collection(firestore, 'users', user.uid, 'studySessions');
        await addDoc(sessionsCollection, { ...newSessionData, uid: user.id });
        toast({title: 'Session logged!'});
    } catch(e: any) {
        console.error(e);
        toast({title: 'Error logging session', description: e.message, variant: 'destructive'});
    }
  };

  const handleUpdateSession = async (updatedSession: StudySession) => {
    if (!user || !firestore) return;
    try {
        const { id, ...data } = updatedSession;
        const sessionDoc = doc(firestore, 'users', user.uid, 'studySessions', id);
        await updateDoc(sessionDoc, data);
        toast({title: 'Session updated.'});
    } catch(e: any) {
        console.error(e);
        toast({title: 'Error updating session', description: e.message, variant: 'destructive'});
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!user || !firestore) return;
    try {
        const sessionDoc = doc(firestore, 'users', user.uid, 'studySessions', sessionId);
        await deleteDoc(sessionDoc);
        toast({title: 'Session deleted.'});
    } catch(e: any) {
        console.error(e);
        toast({title: 'Error deleting session', description: e.message, variant: 'destructive'});
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

  const handleSavePlan = (replace: boolean) => {
    if (!generatedPlan) return;
    
    if (!replace && existingPlan.length > 0) {
      handleMerge();
      return;
    }

    setPlan(generatedPlan);
    toast({
        title: "Plan Saved!",
        description: "Your new weekly study plan has been saved."
    });
    setIsPlanDialogOpen(false);
    router.push('/weekly-plan');
  }

  const handleMerge = async () => {
    if (!generatedPlan) return;
    setIsMerging(true);
    try {
      const result = await mergeWeeklyPlans({
        existingPlan,
        newPlan: generatedPlan.map(p => ({...p, id: ''})) // satisfy schema, id is not used in prompt
      });

      setPlan(result.mergedPlan);
      toast({
        title: "Plan Merged!",
        description: "Your weekly study plan has been updated."
      });
      setIsPlanDialogOpen(false);
      router.push('/weekly-plan');
    } catch (error) {
      console.error("Failed to merge weekly plans:", error);
      toast({ title: 'Merge Failed', description: 'Could not merge the plans. Please try again.', variant: 'destructive' });
    } finally {
      setIsMerging(false);
    }
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
                Review the suggested schedule. You can save it as a new plan or merge it with your existing one.
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
            {existingPlan && existingPlan.length > 0 ? (
                <div className="flex w-full justify-end gap-2">
                    <Button variant="ghost" onClick={() => setIsPlanDialogOpen(false)}>Cancel</Button>
                    <Button variant="secondary" onClick={handleMerge} disabled={isMerging}>
                        {isMerging && <Loader2 className="mr-2 animate-spin" />}
                        Merge with Existing
                    </Button>
                    <Button onClick={() => handleSavePlan(true)} disabled={isMerging}>
                      <Save className="mr-2"/>
                      Replace Existing
                    </Button>
                </div>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setIsPlanDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => handleSavePlan(true)}><Save className="mr-2" />Save Plan</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
