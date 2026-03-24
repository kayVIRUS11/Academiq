
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";
import { Goal } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { useSupabase } from "@/supabase";
import { useSupabaseRealtime } from "@/hooks/use-supabase-realtime";

export function GoalsOverview() {
  const { user } = useAuth();
  const { supabase } = useSupabase();
  const { data: goals, loading } = useSupabaseRealtime<Goal>('goals', 'created_at', false);
  
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
