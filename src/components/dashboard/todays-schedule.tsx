'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { Course, TimetableEntry } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

export function TodaysSchedule() {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        const [coursesRes, timetableRes] = await Promise.all([
          supabase.from('courses').select('*').eq('uid', user.id),
          supabase.from('timetable').select('*').eq('uid', user.id)
        ]);
    
        if (coursesRes.error) toast({ title: 'Error fetching courses', description: coursesRes.error.message, variant: 'destructive' });
        else setCourses(coursesRes.data.map(c => ({...c, courseCode: c.course_code})) as Course[]);
    
        if (timetableRes.error) toast({ title: 'Error fetching timetable', description: timetableRes.error.message, variant: 'destructive' });
        else setTimetable(timetableRes.data.map(e => ({...e, courseId: e.course_id, startTime: e.start_time, endTime: e.end_time})) as TimetableEntry[]);
        
        setLoading(false);
      }, [user, toast]);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);


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
