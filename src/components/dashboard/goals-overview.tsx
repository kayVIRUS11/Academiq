import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { mockGoals } from "@/lib/mock-data";
import { Target } from "lucide-react";

export function GoalsOverview() {
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
        {mockGoals.slice(0, 3).map(goal => (
            <div key={goal.id}>
                <div className="flex justify-between items-center mb-1">
                    <h4 className="text-sm font-medium">{goal.title}</h4>
                    <span className="text-sm font-mono text-muted-foreground">{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} />
            </div>
        ))}
      </CardContent>
    </Card>
  );
}
