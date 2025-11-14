
'use client';

import { Target } from 'lucide-react';
import { Goal } from '@/lib/types';
import { GoalList } from '@/components/goals/goal-list';
import { AddGoal } from '@/components/goals/add-goal';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { useFirebase } from '@/firebase';
import { useState, useEffect, useCallback } from 'react';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function GoalsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { firestore } = useFirebase();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !firestore) {
        setLoading(false);
        return;
    };

    setLoading(true);
    const goalsQuery = query(collection(firestore, 'users', user.uid, 'goals'));

    const unsubscribe = onSnapshot(goalsQuery, (querySnapshot) => {
        const goalsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
        setGoals(goalsData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching goals:", error);
        toast({ title: 'Error fetching goals', description: error.message, variant: 'destructive' });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore, toast]);

  const handleAddGoal = async (newGoal: Omit<Goal, 'id' | 'progress' | 'uid'>) => {
    if (!user || !firestore) {
        toast({ title: 'You must be logged in', variant: 'destructive' });
        return;
    }
    try {
        const goalsCollection = collection(firestore, 'users', user.uid, 'goals');
        await addDoc(goalsCollection, {
            ...newGoal,
            progress: 0,
            uid: user.id,
        });
        toast({ title: 'Goal added!' });
    } catch(error: any) {
      console.error(error);
      toast({ title: 'Error adding goal', description: error.message, variant: 'destructive' });
    }
  };

  const handleUpdateGoal = async (updatedGoal: Goal) => {
    if (!user || !firestore) return;
    try {
      const { id, ...goalData } = updatedGoal;
      const goalDoc = doc(firestore, 'users', user.uid, 'goals', id);
      await updateDoc(goalDoc, goalData);
      toast({ title: 'Goal updated!' });
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error updating goal', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!user || !firestore) return;
    try {
        const goalDoc = doc(firestore, 'users', user.uid, 'goals', goalId);
        await deleteDoc(goalDoc);
        toast({ title: 'Goal deleted!' });
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error deleting goal', description: error.message, variant: 'destructive' });
    }
  };

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
