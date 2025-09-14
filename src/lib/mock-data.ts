import { Course, Goal, Task, TimetableEntry } from './types';

export const mockCourses: Course[] = [
  { id: '1', name: 'Advanced Calculus', instructor: 'Dr. Evelyn Reed', color: 'bg-blue-200' },
  { id: '2', name: 'Quantum Physics', instructor: 'Dr. Alistair Finch', color: 'bg-purple-200' },
  { id: '3', name: 'Organic Chemistry', instructor: 'Dr. Lena Petrova', color: 'bg-green-200' },
];

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Complete Problem Set 3',
    dueDate: new Date(new Date().setDate(new Date().getDate())).toISOString(),
    priority: 'High',
    courseId: '1',
    completed: false,
  },
  {
    id: '2',
    title: 'Read Chapter 5 of textbook',
    dueDate: new Date(new Date().setDate(new Date().getDate())).toISOString(),
    priority: 'Medium',
    courseId: '2',
    completed: false,
  },
  {
    id: '3',
    title: 'Prepare for lab session',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    priority: 'High',
    courseId: '3',
    completed: false,
  },
  {
    id: '4',
    title: 'Review lecture notes',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    priority: 'Low',
    courseId: '1',
    completed: true,
  },
];

export const mockGoals: Goal[] = [
    { id: '1', title: 'Achieve a 3.8 GPA this semester', type: 'semester', progress: 60 },
    { id: '2', title: 'Publish a research paper', type: 'yearly', progress: 25 },
    { id: '3', title: 'Master React state management', type: 'semester', progress: 80 },
];

export const mockTimetable: TimetableEntry[] = [
    {
        id: '1',
        courseId: '1',
        day: new Date().toLocaleDateString('en-US', { weekday: 'long' }) as TimetableEntry['day'],
        startTime: '09:00',
        endTime: '10:30',
        location: 'Room 301'
    },
    {
        id: '2',
        courseId: '2',
        day: new Date().toLocaleDateString('en-US', { weekday: 'long' }) as TimetableEntry['day'],
        startTime: '11:00',
        endTime: '12:30',
        location: 'Physics Lab'
    }
]

export const mockWeeklyStudyData = [
    { day: 'Mon', hours: 2 },
    { day: 'Tue', hours: 3.5 },
    { day: 'Wed', hours: 1.5 },
    { day: 'Thu', hours: 4 },
    { day: 'Fri', hours: 2.5 },
    { day: 'Sat', hours: 5 },
    { day: 'Sun', hours: 1 },
]

export const motivationalQuotes = [
    "The secret to getting ahead is getting started.",
    "Believe you can and you're halfway there.",
    "The expert in anything was once a beginner.",
    "The only way to do great work is to love what you do.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts."
];
