'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { mockWeeklyStudyData } from "@/lib/mock-data";
import { ChartTooltipContent, ChartContainer } from "@/components/ui/chart";
import { Timer } from "lucide-react";

export function WeeklyStudyChart() {
    const totalHours = mockWeeklyStudyData.reduce((acc, item) => acc + item.hours, 0);

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
            <BarChart data={mockWeeklyStudyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} />
                <Tooltip
                    cursor={{fill: 'hsl(var(--secondary))', radius: 'var(--radius)'}}
                    content={<ChartTooltipContent
                        formatter={(value) => `${value} hours`}
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
