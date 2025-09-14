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
  id: string;
  name: string;
  instructor: string;
  color: string;
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
  day:
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
    | 'Sunday';
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  location?: string;
};
