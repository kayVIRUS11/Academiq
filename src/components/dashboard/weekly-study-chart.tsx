'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { ChartTooltipContent, ChartContainer } from "@/components/ui/chart";
import { Timer } from "lucide-react";
import { StudySession } from "@/lib/types";
import { format, startOfWeek, addDays, isWithinInterval } from "date-fns";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { useEffect, useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

export function WeeklyStudyChart() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<StudySession[]>([]);
    
    const weekStartsOn = 1; // Monday
    const today = new Date();
    const startOfWeekDate = startOfWeek(today, { weekStartsOn });
    const endOfWeekDate = addDays(startOfWeekDate, 6);

    const fetchSessions = useCallback(async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from('study-sessions')
            .select('*')
            .eq('uid', user.id);
            // We filter in JS because Supabase date filtering can be tricky with timezones
        
        if (error) {
            toast({ title: 'Error fetching study sessions', description: error.message, variant: 'destructive'});
        } else {
            const weekSessions = (data as StudySession[]).filter(s => isWithinInterval(new Date(s.date), {start: startOfWeekDate, end: endOfWeekDate}));
            setSessions(weekSessions);
        }
    }, [user, startOfWeekDate, endOfWeekDate, toast]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    
    const weeklyData = Array.from({length: 7}).map((_, i) => {
        const day = addDays(startOfWeekDate, i);
        return {
            day: format(day, 'E'),
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
