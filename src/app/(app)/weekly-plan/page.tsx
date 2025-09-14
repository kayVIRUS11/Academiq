'use client';

import { CalendarCheck, Sparkles } from "lucide-react";
import { useWeeklyPlan } from "./weekly-plan-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Course } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WeeklyPlanPage() {
    const { plan, loading } = useWeeklyPlan();
    const [coursesSnapshot, coursesLoading] = useCollection(collection(db, 'courses'));
    const courses = coursesSnapshot?.docs.map(d => ({id: d.id, ...d.data()})) as Course[] || [];

    const getCourseColor = (courseName: string) => {
        return courses.find(c => c.name === courseName)?.color || '#ccc';
    }

    if (loading || coursesLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-24 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        )
    }

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {days.map(day => {
                    const dayPlan = plan.filter(item => item.day === day);
                    return (
                        <Card key={day}>
                            <CardHeader>
                                <CardTitle>{day}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {dayPlan.length > 0 ? (
                                    dayPlan.map(item => (
                                        <div key={item.id} className="p-3 rounded-lg bg-secondary/60">
                                            <p className="font-semibold text-sm">{item.time}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: getCourseColor(item.course)}}/>
                                                <p className="text-primary font-medium text-sm">{item.course}</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">{item.activity}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground italic text-center py-4">No study planned.</p>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    );
}
