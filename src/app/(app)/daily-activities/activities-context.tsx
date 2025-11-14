
'use client';

import { DailyActivity, WeeklyActivities, DayOfWeek } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';


type ActivitiesContextType = {
  weeklyActivities: WeeklyActivities;
  loading: boolean;
  savePlanForDay: (day: DayOfWeek, activities: Omit<DailyActivity, 'id' | 'completed'>[]) => void;
  updateActivitiesForDay: (day: DayOfWeek, activities: DailyActivity[]) => void;
  addActivity: (day: DayOfWeek, activity: Omit<DailyActivity, 'id' | 'completed' | 'suggestions'>) => void;
  deleteActivity: (day: DayOfWeek, activityId: string) => void;
  toggleActivity: (day: DayOfWeek, activityId: string) => void;
};

const ActivitiesContext = createContext<ActivitiesContextType | undefined>(undefined);

export function ActivitiesProvider({ children }: { children: ReactNode }) {
  const [weeklyActivities, setWeeklyActivities] = useState<WeeklyActivities>({});
  const { user } = useAuth();
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const getDocRef = useCallback(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);


  const fetchActivities = useCallback(async () => {
    const docRef = getDocRef();
    if (!docRef) {
        setLoading(false);
        return;
    }

    setLoading(true);
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const activities = userData.daily_activities || {};
          const sanitizedData = Object.keys(activities).reduce((acc, day) => {
              acc[day as DayOfWeek] = activities[day as DayOfWeek] || [];
              return acc;
          }, {} as WeeklyActivities);
          setWeeklyActivities(sanitizedData);
        } else {
            setWeeklyActivities({});
        }
    } catch(error: any) {
        toast({ title: 'Error loading daily plans', description: error.message, variant: 'destructive'});
    }
    setLoading(false);
  }, [getDocRef, toast]);

  useEffect(() => {
    if (user) {
        fetchActivities();
    } else {
        setWeeklyActivities({});
        setLoading(false);
    }
  }, [user, fetchActivities]);

  const updateFirestore = async (newWeeklyActivities: WeeklyActivities) => {
    const docRef = getDocRef();
    if (!docRef) return;

    try {
        await setDoc(docRef, { daily_activities: newWeeklyActivities }, { merge: true });
    } catch (error: any) {
        toast({ title: 'Error saving daily plan', description: error.message, variant: 'destructive' });
    }
  }

  const savePlanForDay = (day: DayOfWeek, activities: Omit<DailyActivity, 'id' | 'completed'>[]) => {
    const newActivities: DailyActivity[] = activities.map((a, index) => ({
        ...a, 
        id: `${Date.now()}-${index}`,
        completed: false
    }));

    const newWeeklyActivities = {
      ...weeklyActivities,
      [day]: newActivities,
    };
    
    setWeeklyActivities(newWeeklyActivities);
    updateFirestore(newWeeklyActivities);
  }
  
  const updateActivitiesForDay = (day: DayOfWeek, activities: DailyActivity[]) => {
    const newWeeklyActivities = {
      ...weeklyActivities,
      [day]: activities,
    };
    setWeeklyActivities(newWeeklyActivities);
    updateFirestore(newWeeklyActivities);
  }

  const addActivity = (day: DayOfWeek, activity: Omit<DailyActivity, 'id' | 'completed' | 'suggestions'>) => {
    const newActivity: DailyActivity = {
        ...activity,
        id: Date.now().toString(),
        completed: false
    };
    const dayActivities = weeklyActivities[day] || [];
    const newDayActivities = [...dayActivities, newActivity].sort((a, b) => a.time.localeCompare(b.time));
    updateActivitiesForDay(day, newDayActivities);
  };

  const deleteActivity = (day: DayOfWeek, activityId: string) => {
    const dayActivities = weeklyActivities[day] || [];
    const newDayActivities = dayActivities.filter(act => act.id !== activityId);
    updateActivitiesForDay(day, newDayActivities);
  }

  const toggleActivity = (day: DayOfWeek, activityId: string) => {
    const dayActivities = weeklyActivities[day] || [];

    const newDayActivities = dayActivities.map(act => {
        if (act.id === activityId) {
            return { ...act, completed: !act.completed };
        }
        return act;
    });
    
    updateActivitiesForDay(day, newDayActivities);
  }

  return (
    <ActivitiesContext.Provider value={{ weeklyActivities, loading, savePlanForDay, updateActivitiesForDay, addActivity, deleteActivity, toggleActivity }}>
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
