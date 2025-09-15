'use client';

import { useDailyActivities } from "./activities-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Sparkles, Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { DailyActivity, DayOfWeek } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ActivityDialog } from "./activity-dialog";

const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function DailyPlanView({ day }: { day: DayOfWeek }) {
    const { weeklyActivities, updateActivitiesForDay, addActivity, deleteActivity, toggleActivity } = useDailyActivities();
    const [progress, setProgress] = useState(0);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState<DailyActivity | null>(null);

    const activities = weeklyActivities[day] || [];

    useEffect(() => {
        const completedCount = activities.filter(a => a.completed).length;
        const totalCount = activities.length;
        setProgress(totalCount > 0 ? (completedCount / totalCount) * 100 : 0);
    }, [activities]);

    const handleSaveActivity = (activity: Omit<DailyActivity, 'id' | 'completed' | 'suggestions'>, id?: string) => {
        if (id) { // Editing existing activity
            const updatedActivities = activities.map(act => act.id === id ? {...act, ...activity} : act);
            updateActivitiesForDay(day, updatedActivities);
        } else { // Adding new activity
            addActivity(day, activity);
        }
    }
    
    const handleDelete = (activityId: string) => {
        deleteActivity(day, activityId);
    }
    
    const handleEdit = (activity: DailyActivity) => {
        setEditingActivity(activity);
        setIsDialogOpen(true);
    }

    const handleAddNew = () => {
        setEditingActivity(null);
        setIsDialogOpen(true);
    }
    
    if (activities.length === 0) {
        return (
            <div className="flex flex-col items-center text-center space-y-4 py-16">
                <ClipboardCheck className="w-16 h-16 text-muted-foreground/50"/>
                <h2 className="text-xl font-semibold">No Plan for {day}</h2>
                <p className="text-muted-foreground max-w-sm">
                    You haven't saved a plan for this day yet. Add an activity or use the AI planner to generate one!
                </p>
                <div className="flex gap-4">
                    <Button onClick={handleAddNew}>
                        <Plus className="mr-2"/>
                        Add Activity
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/ai-tools/daily-planner">
                            <Sparkles className="mr-2"/>
                            AI Planner
                        </Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
         <div className="space-y-6">
            <ActivityDialog 
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSave={handleSaveActivity}
                activity={editingActivity}
            />
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>{day}'s Progress</CardTitle>
                        <CardDescription>You've completed {Math.round(progress)}% of your plan.</CardDescription>
                    </div>
                     <Button onClick={handleAddNew}>
                        <Plus className="mr-2"/>
                        Add Activity
                    </Button>
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
                    <div className="space-y-1">
                        {activities.sort((a,b) => a.time.localeCompare(b.time)).map((activity) => (
                            <div key={activity.id} className={cn("flex items-start gap-4 p-3 rounded-lg group", activity.completed && "opacity-60")}>
                                <div className="flex-1 flex items-start gap-4 cursor-pointer" onClick={() => toggleActivity(day, activity.id)}>
                                    <div className={cn("mt-1 flex h-5 w-5 items-center justify-center rounded-sm border border-primary", activity.completed && "bg-primary text-primary-foreground")}>
                                        {activity.completed && <ClipboardCheck className="h-3 w-3"/>}
                                    </div>
                                    
                                    <div className="grid gap-1.5">
                                        <span className={cn("font-semibold", activity.completed && "line-through text-muted-foreground")}>
                                            {activity.activity}
                                        </span>
                                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                                        {activity.suggestions && (
                                            <p className="text-xs italic text-muted-foreground/80">{activity.suggestions}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(activity)}>
                                        <Edit className="h-4 w-4"/>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(activity.id)}>
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}


export default function DailyActivitiesPage() {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as DayOfWeek;
    const defaultTab = days.includes(today) ? today : 'Monday';

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <ClipboardCheck className="w-10 h-10 text-primary"/>
                </div>
                <h1 className="text-4xl font-bold font-headline">Weekly Activities</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                    View, manage, and edit your daily plans for the week. Stay focused and productive!
                </p>
            </div>
            
            <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-7">
                    {days.map(day => (
                        <TabsTrigger key={day} value={day}>{day}</TabsTrigger>
                    ))}
                </TabsList>
                {days.map(day => (
                    <TabsContent key={day} value={day}>
                        <DailyPlanView day={day} />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}
