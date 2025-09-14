'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Goal } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";

export function GoalsOverview() {
  const [goalsSnapshot, loading] = useCollection(collection(db, 'goals'));
  const goals = goalsSnapshot?.docs.map(d => ({id: d.id, ...d.data()})) as Goal[] || [];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Target />
            <span>Goals Overview</span>
        </CardTitle>
        <CardDescription>A quick look at your main objectives.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
            <>
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </>
        ) : goals.length > 0 ? (
            goals.slice(0, 3).map(goal => (
                <div key={goal.id}>
                    <div className="flex justify-between items-center mb-1">
                        <h4 className="text-sm font-medium">{goal.title}</h4>
                        <span className="text-sm font-mono text-muted-foreground">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} />
                </div>
            ))
        ) : (
            <p className="text-sm text-muted-foreground text-center">No goals set yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
