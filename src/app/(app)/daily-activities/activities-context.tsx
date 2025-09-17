
'use client';

import { DailyActivity, WeeklyActivities, DayOfWeek } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

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
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('user_data')
      .select('daily_activities')
      .eq('uid', user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      toast({ title: 'Error loading daily plans', description: error.message, variant: 'destructive'});
    } else {
      const activities = data?.daily_activities || {};
      const sanitizedData = Object.keys(activities).reduce((acc, day) => {
            acc[day as DayOfWeek] = activities[day as DayOfWeek] || [];
            return acc;
        }, {} as WeeklyActivities);
      setWeeklyActivities(sanitizedData);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const updateSupabase = async (newWeeklyActivities: WeeklyActivities) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_data')
      .upsert({ uid: user.id, daily_activities: newWeeklyActivities }, { onConflict: 'uid' });
    if (error) {
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
