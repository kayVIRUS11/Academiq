'use client';

import { StudyPlanItem } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

type WeeklyPlanContextType = {
  plan: StudyPlanItem[];
  setPlan: (newPlan: Omit<StudyPlanItem, 'id'>[]) => void;
  addPlanItem: (item: Omit<StudyPlanItem, 'id'>) => void;
  updatePlanItem: (id: string, item: Omit<StudyPlanItem, 'id'>) => void;
  deletePlanItem: (id: string) => void;
  loading: boolean;
};

const WeeklyPlanContext = createContext<WeeklyPlanContextType | undefined>(undefined);

export function WeeklyPlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlanState] = useState<StudyPlanItem[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const fetchPlan = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('user_data')
      .select('weekly_plan')
      .eq('uid', user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      toast({ title: 'Error loading weekly plan', description: error.message, variant: 'destructive'});
    } else {
      setPlanState(data?.weekly_plan || []);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const updateSupabase = async (newPlan: StudyPlanItem[]) => {
    if (!user) return;
    const { error } = await supabase
        .from('user_data')
        .upsert({ uid: user.id, weekly_plan: newPlan }, { onConflict: 'uid' });
    if (error) {
        toast({ title: 'Error saving weekly plan', description: error.message, variant: 'destructive'});
    }
  }
  
  const setPlan = (newPlanData: Omit<StudyPlanItem, 'id'>[]) => {
    const newPlanWithIds = newPlanData.map(item => ({...item, id: `${Date.now()}-${Math.random()}`}));
    setPlanState(newPlanWithIds);
    updateSupabase(newPlanWithIds);
  };

  const addPlanItem = (item: Omit<StudyPlanItem, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
    const newPlan = [...plan, newItem];
    setPlanState(newPlan);
    updateSupabase(newPlan);
    toast({ title: 'Study block added!' });
  }

  const updatePlanItem = (id: string, item: Omit<StudyPlanItem, 'id'>) => {
    const newPlan = plan.map(p => p.id === id ? { ...item, id } : p);
    setPlanState(newPlan);
    updateSupabase(newPlan);
    toast({ title: 'Study block updated!' });
  }

  const deletePlanItem = (id: string) => {
    const newPlan = plan.filter(p => p.id !== id);
    setPlanState(newPlan);
    updateSupabase(newPlan);
    toast({ title: 'Study block deleted.' });
  }


  return (
    <WeeklyPlanContext.Provider value={{ plan, setPlan, addPlanItem, updatePlanItem, deletePlanItem, loading }}>
      {children}
    </WeeklyPlanContext.Provider>
  );
}

export function useWeeklyPlan() {
  const context = useContext(WeeklyPlanContext);
  if (context === undefined) {
    throw new Error('useWeeklyPlan must be used within a WeeklyPlanProvider');
  }
  return context;
}
