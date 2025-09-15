'use client';

import { CalendarCheck, Sparkles, Plus, Edit2, Trash2 } from "lucide-react";
import { useWeeklyPlan } from "./weekly-plan-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Course, StudyPlanItem, DayOfWeek } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { useState } from "react";
import { StudyPlanItemDialog } from "./study-plan-item-dialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

const days: DayOfWeek[] = [DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday, DayOfWeek.Sunday];

export default function WeeklyPlanPage() {
    const { plan, loading, addPlanItem, updatePlanItem, deletePlanItem } = useWeeklyPlan();
    const { user } = useAuth();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<StudyPlanItem | null>(null);
    const [dialogDay, setDialogDay] = useState<DayOfWeek>(DayOfWeek.Monday);

    const coursesQuery = user ? query(collection(db, 'courses'), where('uid', '==', user.uid)) : null;
    const [coursesSnapshot, coursesLoading] = useCollection(coursesQuery);
    const courses = coursesSnapshot?.docs.map(d => ({id: d.id, ...d.data()})) as Course[] || [];

    const getCourseColor = (courseName: string) => {
        return courses.find(c => c.name === courseName)?.color || '#ccc';
    }

    const handleAddNew = (day: DayOfWeek) => {
        setEditingItem(null);
        setDialogDay(day);
        setIsDialogOpen(true);
    }
    
    const handleEdit = (item: StudyPlanItem) => {
        setEditingItem(item);
        setDialogDay(item.day);
        setIsDialogOpen(true);
    }
    
    const handleSaveItem = (item: Omit<StudyPlanItem, 'id'>, id?: string) => {
        if(id) {
            updatePlanItem(id, item);
        } else {
            addPlanItem(item);
        }
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
                    You haven't generated or created a weekly study plan yet.
                </p>
                 <div className="flex items-center gap-4">
                    <Button onClick={() => handleAddNew(DayOfWeek.Monday)}>
                        <Plus className="mr-2"/>
                        Create a Plan
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/study-tracker">
                            <Sparkles className="mr-2"/>
                            Generate with AI
                        </Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <StudyPlanItemDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSave={handleSaveItem}
                item={editingItem}
                courses={courses}
                defaultDay={dialogDay}
            />

            <div className="flex flex-col items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <CalendarCheck className="w-10 h-10 text-primary"/>
                </div>
                <h1 className="text-4xl font-bold font-headline">Your Weekly Study Plan</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                    This is your study schedule. Adjust as needed and stick to it for maximum productivity.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {days.map(day => {
                    const dayPlan = plan.filter(item => item.day === day).sort((a, b) => a.time.localeCompare(b.time));
                    return (
                        <Card key={day}>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>{day}</CardTitle>
                                <Button size="icon" variant="ghost" onClick={() => handleAddNew(day)}>
                                    <Plus className="w-5 h-5"/>
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {dayPlan.length > 0 ? (
                                    dayPlan.map(item => (
                                        <div key={item.id} className="p-3 rounded-lg bg-secondary/60 group relative">
                                            <p className="font-semibold text-sm">{item.time}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: getCourseColor(item.course)}}/>
                                                <p className="text-primary font-medium text-sm">{item.course}</p>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">{item.activity}</p>
                                            
                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(item)}>
                                                    <Edit2 className="h-4 w-4"/>
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                                            <Trash2 className="h-4 w-4"/>
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>This will permanently delete this study block.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => deletePlanItem(item.id)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <button onClick={() => handleAddNew(day)} className="w-full text-center py-4 border-2 border-dashed rounded-lg hover:border-primary transition-colors">
                                        <p className="text-sm text-muted-foreground italic">No study planned. Click to add.</p>
                                    </button>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    );
}
