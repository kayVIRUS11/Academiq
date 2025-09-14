'use client';

import { StudyPlanItem } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useDocument } from 'react-firebase-hooks/firestore';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type WeeklyPlanContextType = {
  plan: StudyPlanItem[];
  setPlan: (newPlan: StudyPlanItem[]) => void;
  loading: boolean;
};

const WeeklyPlanContext = createContext<WeeklyPlanContextType | undefined>(undefined);

// In a real app, get this from auth
const USER_ID = 'default-user';

export function WeeklyPlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlanState] = useState<StudyPlanItem[]>([]);
  const planRef = doc(db, 'weeklyPlans', USER_ID);
  const [planSnapshot, loading, error] = useDocument(planRef);

  useEffect(() => {
    if (planSnapshot?.exists()) {
      const data = planSnapshot.data();
      setPlanState(data.plan || []);
    }
  }, [planSnapshot]);
  
  const setPlan = async (newPlan: StudyPlanItem[]) => {
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
