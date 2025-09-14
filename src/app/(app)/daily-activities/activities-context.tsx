'use client';

import { DailyActivity, WeeklyActivities, DayOfWeek } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useDocument } from 'react-firebase-hooks/firestore';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type ActivitiesContextType = {
  weeklyActivities: WeeklyActivities;
  loading: boolean;
  savePlanForDay: (day: DayOfWeek, activities: Omit<DailyActivity, 'id' | 'completed'>[]) => void;
  updateActivitiesForDay: (day: DayOfWeek, activities: DailyActivity[]) => void;
};

const ActivitiesContext = createContext<ActivitiesContextType | undefined>(undefined);

// In a real app, you'd get this from auth
const USER_ID = 'default-user';

export function ActivitiesProvider({ children }: { children: ReactNode }) {
  const [weeklyActivities, setWeeklyActivities] = useState<WeeklyActivities>({});
  
  const activitiesRef = doc(db, 'dailyActivities', USER_ID);
  const [activitiesSnapshot, loading, error] = useDocument(activitiesRef);

  useEffect(() => {
    if (activitiesSnapshot?.exists()) {
        setWeeklyActivities(activitiesSnapshot.data() as WeeklyActivities);
    }
  }, [activitiesSnapshot]);

  const savePlanForDay = async (day: DayOfWeek, activities: Omit<DailyActivity, 'id' | 'completed'>[]) => {
    const newActivities: DailyActivity[] = activities.map((a, index) => ({
        ...a, 
        id: `${Date.now()}-${index}`,
        completed: false
    }));

    const newWeeklyActivities = {
      ...weeklyActivities,
      [day]: newActivities,
    };
    
    await setDoc(activitiesRef, newWeeklyActivities);
    setWeeklyActivities(newWeeklyActivities);
  }
  
  const updateActivitiesForDay = async (day: DayOfWeek, activities: DailyActivity[]) => {
    const newWeeklyActivities = {
      ...weeklyActivities,
      [day]: activities,
    };
    await setDoc(activitiesRef, newWeeklyActivities);
    setWeeklyActivities(newWeeklyActivities);
  }

  return (
    <ActivitiesContext.Provider value={{ weeklyActivities, loading, savePlanForDay, updateActivitiesForDay }}>
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
