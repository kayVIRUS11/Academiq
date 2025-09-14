export type Task = {
  id: string;
  title: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  courseId?: string;
  completed: boolean;
};

export type Goal = {
  id: string;
  title: string;
  type: 'semester' | 'yearly';
  progress: number; // percentage
};

export type Course = {
  id:string;
  name: string;
  courseCode: string;
  instructor?: string;
  color: string;
  units: number;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  courseId?: string;
  createdAt: string;
};

export type TimetableEntry = {
  id: string;
  courseId: string;
  day: DayOfWeek;
  startTime: string; // "HH:mm"
  endTime: string; // "HH.mm"
  location?: string;
};

export type StudySession = {
  id: string;
  courseId: string;
  date: string; // ISO string
  duration: number; // in minutes
  notes?: string;
};

export type DailyActivity = {
    time: string;
    activity: string;
    completed: boolean;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type WeeklyActivities = {
    [key in DayOfWeek]?: DailyActivity[];
}

export type StudyPlanItem = {
  id: string;
  day: DayOfWeek;
  time: string;
  course: string;
  activity: string;
};
