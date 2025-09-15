'use client';

import { StudyPlanItem } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useDocument } from 'react-firebase-hooks/firestore';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

type WeeklyPlanContextType = {
  plan: StudyPlanItem[];
  setPlan: (newPlan: StudyPlanItem[]) => void;
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
  
  const setPlan = async (newPlan: StudyPlanItem[]) => {
    if (!planRef) return;
    setPlanState(newPlan);
    await setDoc(planRef, { plan: newPlan });
  };


  return (
    <WeeklyPlanContext.Provider value={{ plan, setPlan, loading }}>
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
