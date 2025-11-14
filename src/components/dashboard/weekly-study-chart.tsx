
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { ChartTooltipContent, ChartContainer } from "@/components/ui/chart";
import { Timer } from "lucide-react";
import { StudySession } from "@/lib/types";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { useAuth } from "@/context/auth-context";
import { useFirebase } from "@/firebase";
import { useEffect, useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export function WeeklyStudyChart() {
    const { user } = useAuth();
    const { firestore } = useFirebase();
    const [sessions, setSessions] = useState<StudySession[]>([]);
    
    const weekStartsOn = 1; // Monday
    const today = new Date();
    const startOfWeekDate = startOfWeek(today, { weekStartsOn });
    const endOfWeekDate = endOfWeek(today, { weekStartsOn });

    useEffect(() => {
        if (!user || !firestore) return;
        
        const sessionsQuery = query(
            collection(firestore, 'users', user.uid, 'studySessions'),
            where('date', '>=', startOfWeekDate.toISOString().split('T')[0]),
            where('date', '<=', endOfWeekDate.toISOString().split('T')[0])
        );
        
        const unsubscribe = onSnapshot(sessionsQuery, (snapshot) => {
            const weekSessions = snapshot.docs.map(doc => doc.data() as StudySession);
            setSessions(weekSessions);
        }, (error) => {
            toast({ title: 'Error fetching study sessions', description: error.message, variant: 'destructive'});
        });
        
        return () => unsubscribe();
    }, [user, firestore, startOfWeekDate, endOfWeekDate, toast]);

    
    const weeklyData = Array.from({length: 7}).map((_, i) => {
        const dayDate = new Date(startOfWeekDate);
        dayDate.setDate(dayDate.getDate() + i);
        return {
            day: format(dayDate, 'E'),
            hours: 0,
        }
    });

    sessions.forEach(session => {
        const sessionDate = new Date(session.date);
        const dayIndex = (sessionDate.getDay() - weekStartsOn + 7) % 7;
        if (weeklyData[dayIndex]) {
            weeklyData[dayIndex].hours += session.duration / 60;
        }
    });

    const totalHours = weeklyData.reduce((acc, item) => acc + item.hours, 0);

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Timer />
            Weekly Study Hours
        </CardTitle>
        <CardDescription>You've studied for {totalHours.toFixed(1)} hours this week.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} />
                <Tooltip
                    cursor={{fill: 'hsl(var(--secondary))', radius: 'var(--radius)'}}
                    content={<ChartTooltipContent
                        formatter={(value) => `${Number(value).toFixed(1)} hours`}
                        indicator="dot"
                    />}
                />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
