
'use client';

import { StudyPlanItem } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode } from 'react';

type WeeklyPlanContextType = {
  plan: StudyPlanItem[];
  setPlan: React.Dispatch<React.SetStateAction<StudyPlanItem[]>>;
};

const WeeklyPlanContext = createContext<WeeklyPlanContextType | undefined>(undefined);

export function WeeklyPlanProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<StudyPlanItem[]>([]);

  return (
    <WeeklyPlanContext.Provider value={{ plan, setPlan }}>
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
