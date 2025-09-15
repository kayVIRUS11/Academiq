'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Course, TimetableEntry } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { useAuth } from "@/context/auth-context";

export function TodaysSchedule() {
    const { user } = useAuth();
    const coursesQuery = user ? query(collection(db, 'courses'), where('uid', '==', user.uid)) : null;
    const timetableQuery = user ? query(collection(db, 'timetable'), where('uid', '==', user.uid)) : null;

    const [coursesSnapshot, coursesLoading] = useCollection(coursesQuery);
    const [timetableSnapshot, timetableLoading] = useCollection(timetableQuery);

    const loading = coursesLoading || timetableLoading;

    const courses = coursesSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)) || [];
    const timetable = timetableSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimetableEntry)) || [];

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todaysClasses = timetable.filter(entry => entry.day === today);

    const getCourse = (courseId: string) => courses.find(c => c.id === courseId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Calendar />
            <span>Today's Schedule</span>
        </CardTitle>
        <CardDescription>Your classes for {today}.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        ) : todaysClasses.length > 0 ? (
            <div className="space-y-4">
                {todaysClasses.map(entry => {
                    const course = getCourse(entry.courseId);
                    return (
                        <div key={entry.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary">
                            <div className="flex flex-col items-center">
                                <span className="font-semibold text-sm">{entry.startTime}</span>
                                <span className="text-xs text-muted-foreground">{entry.endTime}</span>
                            </div>
                            <div className="h-full w-1 rounded-full" style={{ backgroundColor: course?.color }} />
                            <div>
                                <h4 className="font-semibold text-sm">{course?.name}</h4>
                                <p className="text-xs text-muted-foreground">{entry.location}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No classes scheduled for today. Enjoy your day!</p>
        )}
      </CardContent>
    </Card>
  );
}
