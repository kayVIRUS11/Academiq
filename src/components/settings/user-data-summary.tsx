'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNotes } from "@/app/(app)/notes/notes-context";
import { useFlashcards } from "@/app/(app)/ai-tools/flashcards/flashcards-context";
import { useDailyActivities } from "@/app/(app)/daily-activities/activities-context";
import { BookCopy, BrainCircuit, Calendar, ListTodo, NotebookText, Target, ClipboardCheck } from "lucide-react";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/auth-context";

export function UserDataSummary() {
    const { user } = useAuth();
    const { notes } = useNotes();
    const { flashcardSets } = useFlashcards();
    const { weeklyActivities } = useDailyActivities();
    
    const coursesQuery = user ? query(collection(db, 'courses'), where('uid', '==', user.uid)) : null;
    const tasksQuery = user ? query(collection(db, 'tasks'), where('uid', '==', user.uid)) : null;
    const goalsQuery = user ? query(collection(db, 'goals'), where('uid', '==', user.uid)) : null;
    const sessionsQuery = user ? query(collection(db, 'study-sessions'), where('uid', '==', user.uid)) : null;

    const [courses] = useCollection(coursesQuery);
    const [tasks] = useCollection(tasksQuery);
    const [goals] = useCollection(goalsQuery);
    const [sessions] = useCollection(sessionsQuery);
    
    const stats = [
        { label: "Courses", value: courses?.docs.length || 0, icon: BookCopy },
        { label: "Tasks", value: tasks?.docs.length || 0, icon: ListTodo },
        { label: "Goals", value: goals?.docs.length || 0, icon: Target },
        { label: "Notes", value: notes.length, icon: NotebookText },
        { label: "Study Sessions Logged", value: sessions?.docs.length || 0, icon: Calendar },
        { label: "Flashcard Sets", value: flashcardSets.length, icon: BrainCircuit },
        { label: "Planned Days", value: Object.keys(weeklyActivities).length, icon: ClipboardCheck },
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
