'use client';

import { DailyActivity, WeeklyActivities, DayOfWeek } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode } from 'react';

type ActivitiesContextType = {
  weeklyActivities: WeeklyActivities;
  setWeeklyActivities: React.Dispatch<React.SetStateAction<WeeklyActivities>>;
  savePlanForDay: (day: DayOfWeek, activities: Omit<DailyActivity, 'completed'>[]) => void;
};

const ActivitiesContext = createContext<ActivitiesContextType | undefined>(undefined);

export function ActivitiesProvider({ children }: { children: ReactNode }) {
  const [weeklyActivities, setWeeklyActivities] = useState<WeeklyActivities>({});

  const savePlanForDay = (day: DayOfWeek, activities: Omit<DailyActivity, 'completed'>[]) => {
    const newActivities = activities.map(a => ({...a, completed: false}));
    setWeeklyActivities(prev => ({
      ...prev,
      [day]: newActivities,
    }));
  }

  return (
    <ActivitiesContext.Provider value={{ weeklyActivities, setWeeklyActivities, savePlanForDay }}>
      {children}
    </ActivitiesContext.Provider>
  );
}

export function useDailyActivities() {
  const context = useContext(ActivitiesContext);
  if (context === undefined) {
    throw new Error('useDailyActivities must be used within a ActivitiesProvider');
  }
  return context;
}
