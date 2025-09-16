'use client';

import { Target } from 'lucide-react';
import { Goal } from '@/lib/types';
import { GoalList } from '@/components/goals/goal-list';
import { AddGoal } from '@/components/goals/add-goal';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback } from 'react';

export default function GoalsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from('goals').select('*').eq('uid', user.id);
    if (error) {
      toast({ title: 'Error fetching goals', description: error.message, variant: 'destructive' });
    } else {
      setGoals(data as Goal[]);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleAddGoal = async (newGoal: Omit<Goal, 'id' | 'progress' | 'uid'>) => {
    if (!user) {
        toast({ title: 'You must be logged in', variant: 'destructive' });
        return;
    }
    const { data, error } = await supabase.from('goals').insert({
        ...newGoal,
        progress: 0,
        uid: user.id,
      }).select();
    if (error) {
      console.error(error);
      toast({ title: 'Error adding goal', variant: 'destructive' });
    } else {
      setGoals(prev => [...prev, data[0]]);
      toast({ title: 'Goal added!' });
    }
  };

  const handleUpdateGoal = async (updatedGoal: Goal) => {
    try {
      const { id, ...goalData } = updatedGoal;
      const { data, error } = await supabase.from('goals').update(goalData).eq('id', id).select();
      if (error) throw error;
      setGoals(prev => prev.map(g => g.id === id ? data[0] : g));
      toast({ title: 'Goal updated!' });
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error updating goal', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await supabase.from('goals').delete().eq('id', goalId);
      setGoals(prev => prev.filter(g => g.id !== goalId));
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
