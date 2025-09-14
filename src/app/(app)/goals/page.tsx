import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Target } from "lucide-react";

export default function GoalsPage() {
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                <Target className="w-8 h-8"/>
                Goal Tracking
            </h1>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Manage your semester and yearly goals here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This feature is under construction. You'll soon be able to add goals, link sub-tasks, and visualize your progress.</p>
        </CardContent>
      </Card>
    </div>
  );
}
