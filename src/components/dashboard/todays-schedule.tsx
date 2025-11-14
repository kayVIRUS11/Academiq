
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { TimetableEntry } from "@/lib/types";
import { useFirebase } from "@/firebase";
import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { useCourses } from "@/context/courses-context";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export function TodaysSchedule() {
    const { user } = useAuth();
    const { firestore } = useFirebase();
    const { courses, loading: coursesLoading } = useCourses();
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    useEffect(() => {
        if (!user || !firestore) {
            setLoading(false);
            return;
        };

        setLoading(true);
        const timetableQuery = query(collection(firestore, 'users', user.uid, 'timeTables'), where('day', '==', today));
    
        const unsubscribe = onSnapshot(timetableQuery, (snapshot) => {
            const todaysEntries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimetableEntry));
            setTimetable(todaysEntries);
            setLoading(false);
        }, (error) => {
            toast({ title: 'Error fetching today\'s schedule', description: error.message, variant: 'destructive' });
            setLoading(false);
        });

        return () => unsubscribe();
      }, [user, firestore, toast, today]);

    const getCourse = (courseId: string) => courses.find(c => c.id === courseId);
    const todaysClasses = timetable;

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
        {loading || coursesLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        ) : todaysClasses.length > 0 ? (
            <div className="space-y-4">
                {todaysClasses.sort((a,b) => a.startTime.localeCompare(b.startTime)).map(entry => {
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
