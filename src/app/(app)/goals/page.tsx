
'use client';

import { Target } from 'lucide-react';
import { Goal } from '@/lib/types';
import { GoalList } from '@/components/goals/goal-list';
import { AddGoal } from '@/components/goals/add-goal';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { useSupabase } from '@/supabase';
import { useSupabaseRealtime } from '@/hooks/use-supabase-realtime';

export default function GoalsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { supabase } = useSupabase();
  const { data: goals, loading } = useSupabaseRealtime<Goal>('goals', 'created_at', false);

  const handleAddGoal = async (newGoal: Omit<Goal, 'id' | 'progress' | 'uid'>) => {
    if (!user || !supabase) {
        toast({ title: 'You must be logged in', variant: 'destructive' });
        return;
    }
    try {
        const { error } = await supabase.from('goals').insert({
            ...newGoal,
            progress: 0,
            uid: user.id
        });
        if (error) throw error;
        toast({ title: 'Goal added!' });
    } catch(error: any) {
      console.error(error);
      toast({ title: 'Error adding goal', description: error.message, variant: 'destructive' });
    }
  };

  const handleUpdateGoal = async (updatedGoal: Goal) => {
    if (!user || !supabase) return;
    try {
      const { id, ...goalData } = updatedGoal;
      const { error } = await supabase.from('goals').update(goalData).eq('id', id);
      if (error) throw error;
      toast({ title: 'Goal updated!' });
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Error updating goal', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!user || !supabase) return;
    try {
        const { error } = await supabase.from('goals').delete().eq('id', goalId);
        if (error) throw error;
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
