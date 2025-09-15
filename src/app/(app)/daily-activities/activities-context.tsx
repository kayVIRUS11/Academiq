'use client';

import { DailyActivity, WeeklyActivities, DayOfWeek } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useDocument } from 'react-firebase-hooks/firestore';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

type ActivitiesContextType = {
  weeklyActivities: WeeklyActivities;
  loading: boolean;
  savePlanForDay: (day: DayOfWeek, activities: Omit<DailyActivity, 'id' | 'completed'>[]) => void;
  updateActivitiesForDay: (day: DayOfWeek, activities: DailyActivity[]) => void;
};

const ActivitiesContext = createContext<ActivitiesContextType | undefined>(undefined);

export function ActivitiesProvider({ children }: { children: ReactNode }) {
  const [weeklyActivities, setWeeklyActivities] = useState<WeeklyActivities>({});
  const { user } = useAuth();
  const { toast } = useToast();
  
  const activitiesRef = user ? doc(db, 'dailyActivities', user.uid) : null;
  const [activitiesSnapshot, loading, error] = useDocument(activitiesRef);

  useEffect(() => {
    if (activitiesSnapshot?.exists()) {
        setWeeklyActivities(activitiesSnapshot.data() as WeeklyActivities);
    } else {
        setWeeklyActivities({});
    }
  }, [activitiesSnapshot]);

  useEffect(() => {
    if (error) {
        toast({ title: 'Error loading daily plans', description: error.message, variant: 'destructive'});
    }
  }, [error, toast]);

  const savePlanForDay = async (day: DayOfWeek, activities: Omit<DailyActivity, 'id' | 'completed'>[]) => {
    if (!activitiesRef) return;
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
    if (!activitiesRef) return;
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
