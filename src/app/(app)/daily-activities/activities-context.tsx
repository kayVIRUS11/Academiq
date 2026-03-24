
'use client';

import { DailyActivity, WeeklyActivities, DayOfWeek } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useSupabase } from '@/supabase';



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
  const { supabase } = useSupabase();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    if (!user || !supabase) {
        setLoading(false);
        return;
    }

    setLoading(true);
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('daily_activities')
            .eq('id', user.id)
            .maybeSingle();

        if (error) throw error;

        if (data && data.daily_activities) {
          const activities = data.daily_activities as Record<string, any>;
          const sanitizedData = Object.keys(activities).reduce((acc, day) => {
              acc[day as DayOfWeek] = activities[day] || [];
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
  }, [user, supabase, toast]);

  useEffect(() => {
    if (user) {
        fetchActivities();
    } else {
        setWeeklyActivities({});
        setLoading(false);
    }
  }, [user, fetchActivities]);

  const updateSupabase = async (newWeeklyActivities: WeeklyActivities) => {
    if (!user || !supabase) return;

    try {
        const { error } = await supabase
            .from('user_profiles')
            .update({ daily_activities: newWeeklyActivities })
            .eq('id', user.id);
            
        if (error) throw error;
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
    updateSupabase(newWeeklyActivities);
  }
  
  const updateActivitiesForDay = (day: DayOfWeek, activities: DailyActivity[]) => {
    const newWeeklyActivities = {
      ...weeklyActivities,
      [day]: activities,
    };
    setWeeklyActivities(newWeeklyActivities);
    updateSupabase(newWeeklyActivities);
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
