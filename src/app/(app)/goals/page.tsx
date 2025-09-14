'use client';

import { useState } from 'react';
import { Target } from 'lucide-react';
import { mockGoals } from '@/lib/mock-data';
import { Goal } from '@/lib/types';
import { GoalList } from '@/components/goals/goal-list';
import { AddGoal } from '@/components/goals/add-goal';
import { Button } from '@/components/ui/button';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);

  const handleAddGoal = (newGoal: Omit<Goal, 'id' | 'progress'>) => {
    setGoals(prev => [
      ...prev,
      {
        ...newGoal,
        id: (prev.length + 1).toString(),
        progress: 0,
      },
    ]);
  };

  const handleUpdateGoal = (updatedGoal: Goal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };
  
  const [showAddSheet, setShowAddSheet] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <Target className="w-8 h-8" />
          Goal Tracking
        </h1>
        <AddGoal onAddGoal={handleAddGoal} />
      </div>

      <GoalList goals={goals} onUpdateGoal={handleUpdateGoal} onDeleteGoal={handleDeleteGoal} />
    </div>
  );
}
