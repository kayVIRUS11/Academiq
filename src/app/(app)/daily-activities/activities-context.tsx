'use client';

import { DailyActivity } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode } from 'react';

type ActivitiesContextType = {
  activities: DailyActivity[];
  setActivities: React.Dispatch<React.SetStateAction<DailyActivity[]>>;
};

const ActivitiesContext = createContext<ActivitiesContextType | undefined>(undefined);

export function ActivitiesProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<DailyActivity[]>([]);

  return (
    <ActivitiesContext.Provider value={{ activities, setActivities }}>
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
