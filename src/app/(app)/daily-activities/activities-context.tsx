'use client';

import { DailyActivity, WeeklyActivities, DayOfWeek } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useDocument } from 'react-firebase-hooks/firestore';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { logStudySession } from '@/lib/study-session-helpers';

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
  const { toast } = useToast();
  
  const activitiesRef = user ? doc(db, 'dailyActivities', user.uid) : null;
  const [activitiesSnapshot, loading, error] = useDocument(activitiesRef);

  useEffect(() => {
    if (activitiesSnapshot?.exists()) {
        const data = activitiesSnapshot.data();
        // Ensure all days have an array, even if empty, to prevent rendering issues.
        const sanitizedData = Object.keys(data).reduce((acc, day) => {
            acc[day as DayOfWeek] = data[day as DayOfWeek] || [];
            return acc;
        }, {} as WeeklyActivities)
        setWeeklyActivities(sanitizedData);
    } else {
        setWeeklyActivities({});
    }
  }, [activitiesSnapshot]);

  useEffect(() => {
    if (error) {
        toast({ title: 'Error loading daily plans', description: error.message, variant: 'destructive'});
    }
  }, [error, toast]);

  const updateFirestore = async (newWeeklyActivities: WeeklyActivities) => {
    if (!activitiesRef) return;
    await setDoc(activitiesRef, newWeeklyActivities, { merge: true });
    setWeeklyActivities(newWeeklyActivities);
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
    
    updateFirestore(newWeeklyActivities);
  }
  
  const updateActivitiesForDay = (day: DayOfWeek, activities: DailyActivity[]) => {
    const newWeeklyActivities = {
      ...weeklyActivities,
      [day]: activities,
    };
    updateFirestore(newWeeklyActivities);
  }

  const addActivity = (day: DayOfWeek, activity: Omit<DailyActivity, 'id' | 'completed' | 'suggestions'>) => {
    const newActivity: DailyActivity = {
        ...activity,
        id: Date.now().toString(),
        completed: false
    };
    const dayActivities = weeklyActivities[day] || [];
    const newDayActivities = [...dayActivities, newActivity];
    updateActivitiesForDay(day, newDayActivities);
  };

  const deleteActivity = (day: DayOfWeek, activityId: string) => {
    const dayActivities = weeklyActivities[day] || [];
    const newDayActivities = dayActivities.filter(act => act.id !== activityId);
    updateActivitiesForDay(day, newDayActivities);
  }
  
  const handleAutomaticLogging = async (activity: DailyActivity) => {
    if (!user || !activity.activity.toLowerCase().includes('study')) return;
    
    try {
        const courseNameMatch = activity.activity.match(/study\s+(.*?)(?:\s\(.+?\))?$/i);
        if (!courseNameMatch || !courseNameMatch[1]) {
            console.warn(`Could not parse course name from activity: "${activity.activity}"`);
            return;
        }
        let courseName = courseNameMatch[1].trim();
        
        const timeParts = activity.time.split('-').map(t => t.trim());
        if (timeParts.length !== 2) {
             console.warn(`Could not parse time range from activity: "${activity.time}"`);
            return;
        };

        const [startH, startM] = timeParts[0].split(':').map(Number);
        const [endH, endM] = timeParts[1].split(':').map(Number);

        if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) {
            console.warn(`Could not parse hours/minutes from time range: "${activity.time}"`);
            return;
        }

        const startDate = new Date();
        startDate.setHours(startH, startM, 0, 0);

        const endDate = new Date();
        endDate.setHours(endH, endM, 0, 0);
        
        const durationInMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);

        if (durationInMinutes <= 0) {
            console.warn(`Calculated duration is not positive: ${durationInMinutes}`);
            return;
        };

        const loggedSession = await logStudySession(user.uid, courseName, durationInMinutes, activity.suggestions);

        if (loggedSession) {
            toast({
                title: 'Study Session Logged!',
                description: `${courseName} session of ${durationInMinutes} minutes added to your tracker.`,
            });
        }

    } catch (e) {
        console.error("Failed to automatically log study session:", e);
        toast({
            title: "Logging Failed",
            description: "Could not automatically log the study session.",
            variant: "destructive"
        });
    }
  }


  const toggleActivity = (day: DayOfWeek, activityId: string) => {
    const dayActivities = weeklyActivities[day] || [];
    let toggledActivity: DailyActivity | undefined;

    const newDayActivities = dayActivities.map(act => {
        if (act.id === activityId) {
            toggledActivity = { ...act, completed: !act.completed };
            return toggledActivity;
        }
        return act;
    });

    if (toggledActivity && toggledActivity.completed) {
       handleAutomaticLogging(toggledActivity);
    }
    
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
