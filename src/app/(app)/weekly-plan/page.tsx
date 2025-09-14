
'use client';

import { CalendarCheck, Sparkles } from "lucide-react";
import { useWeeklyPlan } from "./weekly-plan-context";
import { mockCourses } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeSlots = Array.from({ length: 13 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`); // 8am to 8pm

export default function WeeklyPlanPage() {
    const { plan, setPlan } = useWeeklyPlan();

    const getCourse = (courseName: string) => mockCourses.find(c => c.name === courseName);

    const timeToPosition = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        return (hours - 8) * 60 + minutes;
    };
    
    const getEntryStyle = (startTime: string, endTime: string, courseName: string) => {
        const start = timeToPosition(startTime);
        const end = timeToPosition(endTime);
        const course = getCourse(courseName);

        // Calculate duration, ensuring a minimum height for visibility
        const duration = Math.max(end - start, 30);
    
        return {
          top: `${(start / (13 * 60)) * 100}%`,
          height: `${(duration / (13 * 60)) * 100}%`,
          backgroundColor: course?.color || '#ccc',
        };
    };

    if (plan.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <CalendarCheck className="w-16 h-16 text-muted-foreground/50"/>
                <h2 className="text-2xl font-bold font-headline">No Weekly Study Plan Found</h2>
                <p className="text-muted-foreground max-w-sm">
                    You haven't generated a weekly study plan yet. Use the AI planner in the Study Tracker to create one.
                </p>
                <Link href="/study-tracker">
                    <Button>
                        <Sparkles className="mr-2"/>
                        Generate a Plan
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <CalendarCheck className="w-10 h-10 text-primary"/>
                </div>
                <h1 className="text-4xl font-bold font-headline">Your Weekly Study Plan</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                    This is your AI-generated study schedule. Adjust as needed and stick to it for maximum productivity.
                </p>
            </div>

            <Card className="p-4 overflow-x-auto">
                <div className="flex min-w-[900px]">
                {/* Time column */}
                <div className="w-16 flex-shrink-0">
                    {/* Top-left empty cell */}
                    <div className="h-10 border-b"></div>
                    {/* Time slots */}
                    {timeSlots.map((time) => (
                        <div key={time} className="h-16 relative border-t">
                            <div className="text-xs text-muted-foreground absolute -top-[9px] right-2">{time}</div>
                        </div>
                    ))}
                </div>

                {/* Schedule Grid */}
                <div className="flex-grow grid grid-cols-7">
                    {/* Day headers */}
                    {days.map(day => (
                        <div key={day} className="text-center font-semibold py-2 border-b border-l h-10">
                        <h3>{day}</h3>
                        </div>
                    ))}

                    {/* Day columns */}
                    {days.map(day => (
                        <div key={day} className="relative border-l">
                            {/* Grid lines */}
                            {timeSlots.map((time) => (
                                <div key={time} className="h-16 border-t"></div>
                            ))}
                            
                            {/* Entries */}
                            <div className="absolute inset-0">
                                {plan
                                .filter(item => item.day === day)
                                .map(item => {
                                    const [startTime, endTime] = item.time.split(' - ');
                                    const course = getCourse(item.course);
                                    return (
                                        <div
                                            key={item.id}
                                            className={cn(
                                                "absolute w-full text-left p-2 rounded-lg text-white overflow-hidden",
                                                "opacity-80 border"
                                            )}
                                            style={getEntryStyle(startTime, endTime, item.course)}
                                        >
                                            <p className="font-bold text-xs leading-tight">{item.course}</p>
                                            <p className="text-xs leading-tight">{item.time}</p>
                                            <p className="text-xs leading-tight truncate">{item.activity}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                </div>
            </Card>
        </div>
    );
}
