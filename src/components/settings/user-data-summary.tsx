
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNotes } from "@/app/(app)/notes/notes-context";
import { useFlashcards } from "@/app/(app)/ai-tools/flashcards/flashcards-context";
import { useDailyActivities } from "@/app/(app)/daily-activities/activities-context";
import { BookCopy, BrainCircuit, Calendar, ListTodo, NotebookText, Target, ClipboardCheck } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useFirebase } from "@/firebase";
import { useEffect, useState, useCallback } from "react";
import { collection, getCountFromServer } from "firebase/firestore";

export function UserDataSummary() {
    const { user } = useAuth();
    const { firestore } = useFirebase();
    const { notes } = useNotes();
    const { flashcardSets } = useFlashcards();
    const { weeklyActivities } = useDailyActivities();
    
    const [counts, setCounts] = useState({
        courses: 0,
        tasks: 0,
        goals: 0,
        sessions: 0,
    });

    const fetchCounts = useCallback(async () => {
        if (!user || !firestore) return;

        try {
            const [courses, tasks, goals, sessions] = await Promise.all([
                getCountFromServer(collection(firestore, 'users', user.uid, 'courses')),
                getCountFromServer(collection(firestore, 'users', user.uid, 'tasks')),
                getCountFromServer(collection(firestore, 'users', user.uid, 'goals')),
                getCountFromServer(collection(firestore, 'users', user.uid, 'studySessions')),
            ]);

            setCounts({
                courses: courses.data().count,
                tasks: tasks.data().count,
                goals: goals.data().count,
                sessions: sessions.data().count,
            });
        } catch(error) {
            console.error("Error fetching data counts:", error);
        }

    }, [user, firestore]);

    useEffect(() => {
        fetchCounts();
    }, [fetchCounts]);
    
    const stats = [
        { label: "Courses", value: counts.courses, icon: BookCopy },
        { label: "Tasks", value: counts.tasks, icon: ListTodo },
        { label: "Goals", value: counts.goals, icon: Target },
        { label: "Notes", value: notes.length, icon: NotebookText },
        { label: "Study Sessions Logged", value: counts.sessions, icon: Calendar },
        { label: "Flashcard Sets", value: flashcardSets.length, icon: BrainCircuit },
        { label: "Planned Days", value: Object.values(weeklyActivities).filter(day => day && day.length > 0).length, icon: ClipboardCheck },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Data Summary</CardTitle>
                <CardDescription>A quick overview of all your content within the app.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {stats.map(stat => (
                        <div key={stat.label} className="p-4 bg-secondary rounded-lg flex items-center gap-4">
                            <stat.icon className="w-6 h-6 text-primary"/>
                            <div>
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
