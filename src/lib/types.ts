
export type Task = {
  id: string;
  uid: string;
  title: string;
  dueDate: string; // from due_date
  priority: 'Low' | 'Medium' | 'High';
  courseId?: string; // from course_id
  completed: boolean;
};

export type Goal = {
  id: string;
  uid: string;
  title: string;
  type: 'semester' | 'yearly';
  progress: number; // percentage
};

export type Course = {
  id:string;
  uid: string;
  name: string;
  courseCode: string; // from course_code
  instructor?: string;
  color: string;
  units: number;
};

export type Note = {
  id: string;
  uid: string;
  title: string;
  content: string;
  courseId?: string; // from course_id
  createdAt: string; // from created_at
};

export type TimetableEntry = {
  id: string;
  uid: string;
  courseId: string; // from course_id
  day: DayOfWeek;
  startTime: string; // "HH:mm" from start_time
  endTime: string; // "HH.mm" from end_time
  location?: string;
};

export type StudySession = {
  id: string;
  uid: string;
  courseId: string; // from course_id
  date: string; // ISO string
  duration: number; // in minutes
  notes?: string;
};

export type DailyActivity = {
    id: string;
    time: string;
    activity: string;
    completed: boolean;
    suggestions?: string;
}

export enum DayOfWeek {
    Monday = 'Monday',
    Tuesday = 'Tuesday',
    Wednesday = 'Wednesday',
    Thursday = 'Thursday',
    Friday = 'Friday',
    Saturday = 'Saturday',
    Sunday = 'Sunday'
}


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
