'use client';

import { StudyPlanItem, DayOfWeek } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useDocument } from 'react-firebase-hooks/firestore';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

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
  
  const planRef = user ? doc(db, 'weeklyPlans', user.uid) : null;
  const [planSnapshot, loading, error] = useDocument(planRef);

  useEffect(() => {
    if (planSnapshot?.exists()) {
      const data = planSnapshot.data();
      setPlanState(data.plan || []);
    } else {
        setPlanState([]);
    }
  }, [planSnapshot]);

  useEffect(() => {
    if (error) {
        toast({ title: 'Error loading weekly plan', description: error.message, variant: 'destructive'});
    }
  }, [error, toast]);

  const updateFirestore = async (newPlan: StudyPlanItem[]) => {
    if (!planRef) return;
    await setDoc(planRef, { plan: newPlan });
  }
  
  const setPlan = (newPlanData: Omit<StudyPlanItem, 'id'>[]) => {
    const newPlanWithIds = newPlanData.map(item => ({...item, id: `${Date.now()}-${Math.random()}`}));
    setPlanState(newPlanWithIds);
    updateFirestore(newPlanWithIds);
  };

  const addPlanItem = (item: Omit<StudyPlanItem, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
    const newPlan = [...plan, newItem];
    setPlanState(newPlan);
    updateFirestore(newPlan);
    toast({ title: 'Study block added!' });
  }

  const updatePlanItem = (id: string, item: Omit<StudyPlanItem, 'id'>) => {
    const newPlan = plan.map(p => p.id === id ? { ...item, id } : p);
    setPlanState(newPlan);
    updateFirestore(newPlan);
    toast({ title: 'Study block updated!' });
  }

  const deletePlanItem = (id: string) => {
    const newPlan = plan.filter(p => p.id !== id);
    setPlanState(newPlan);
    updateFirestore(newPlan);
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
