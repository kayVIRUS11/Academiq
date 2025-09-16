'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";
import { Goal } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { useEffect, useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

export function GoalsOverview() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from('goals').select('*').eq('uid', user.id).limit(3);
    if (error) {
      toast({ title: 'Error fetching goals', description: error.message, variant: 'destructive' });
    } else {
      setGoals(data as Goal[]);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);
  
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
