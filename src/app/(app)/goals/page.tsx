'use client';

import { Target } from 'lucide-react';
import { Goal } from '@/lib/types';
import { GoalList } from '@/components/goals/goal-list';
import { AddGoal } from '@/components/goals/add-goal';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';

export default function GoalsPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const goalsQuery = user ? query(collection(db, 'goals'), where('uid', '==', user.uid)) : null;
  const [goalsSnapshot, loading, error] = useCollection(goalsQuery);

  const goals: Goal[] = loading || !goalsSnapshot
    ? []
    : goalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));

  const handleAddGoal = async (newGoal: Omit<Goal, 'id' | 'progress' | 'uid'>) => {
    if (!user) {
        toast({ title: 'You must be logged in', variant: 'destructive' });
        return;
    }
    try {
      await addDoc(collection(db, 'goals'), {
        ...newGoal,
        progress: 0,
        uid: user.uid,
      });
      toast({ title: 'Goal added!' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error adding goal', variant: 'destructive' });
    }
  };

  const handleUpdateGoal = async (updatedGoal: Goal) => {
    try {
      const goalRef = doc(db, 'goals', updatedGoal.id);
      const { id, ...goalData } = updatedGoal;
      await updateDoc(goalRef, goalData);
      toast({ title: 'Goal updated!' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error updating goal', variant: 'destructive' });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteDoc(doc(db, 'goals', goalId));
      toast({ title: 'Goal deleted!' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error deleting goal', variant: 'destructive' });
    }
  };

  if (error) {
    return <p className="text-destructive">Error: {error.message}</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <Target className="w-8 h-8" />
          Goal Tracking
        </h1>
        <AddGoal onAddGoal={handleAddGoal} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <GoalList goals={goals} onUpdateGoal={handleUpdateGoal} onDeleteGoal={handleDeleteGoal} />
      )}
    </div>
  );
}
