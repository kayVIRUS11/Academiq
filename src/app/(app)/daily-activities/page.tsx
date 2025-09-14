'use client';

import { useDailyActivities } from "./activities-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

export default function DailyActivitiesPage() {
    const { activities, setActivities } = useDailyActivities();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const completedCount = activities.filter(a => a.completed).length;
        const totalCount = activities.length;
        setProgress(totalCount > 0 ? (completedCount / totalCount) * 100 : 0);
    }, [activities]);

    const handleToggleActivity = (index: number) => {
        const newActivities = [...activities];
        newActivities[index].completed = !newActivities[index].completed;
        setActivities(newActivities);
    }
    
    if (activities.length === 0) {
        return (
            <div className="flex flex-col items-center text-center space-y-6">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <ClipboardCheck className="w-10 h-10 text-primary"/>
                </div>
                <h1 className="text-4xl font-bold font-headline">Your Daily Plan</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                    You haven't generated a plan for today yet.
                </p>
                <Link href="/ai-tools/daily-planner">
                    <Button>
                        <Sparkles className="mr-2"/>
                        Create a Plan with AI
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <ClipboardCheck className="w-10 h-10 text-primary"/>
                </div>
                <h1 className="text-4xl font-bold font-headline">Today's Activities</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                    Here's your personalized plan. Stay focused and productive!
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Progress</CardTitle>
                    <CardDescription>You've completed {Math.round(progress)}% of your plan.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Progress value={progress} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Your Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {activities.map((activity, index) => (
                            <div key={index} className={cn("flex items-start gap-4 p-4 rounded-lg", activity.completed ? "bg-secondary" : "bg-transparent")}>
                                <Checkbox 
                                    id={`activity-${index}`}
                                    className="mt-1"
                                    checked={activity.completed}
                                    onCheckedChange={() => handleToggleActivity(index)}
                                />
                                <div className="grid gap-1.5">
                                    <label htmlFor={`activity-${index}`} className={cn("font-semibold cursor-pointer", activity.completed && "line-through text-muted-foreground")}>
                                        {activity.activity}
                                    </label>
                                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
