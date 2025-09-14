import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export default function DailyPlannerPage() {
  return (
    <div className="space-y-6">
        <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
                <CalendarDays className="w-10 h-10 text-primary"/>
            </div>
            <h1 className="text-4xl font-bold font-headline">AI Daily Planner</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
                Let our AI create a detailed, hour-by-hour plan for your day based on your tasks, timetable, and personal goals.
            </p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>Describe your ideal day and let AI handle the planning.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">This feature is under construction. Soon, you'll be able to input your daily constraints and preferences to receive a hyper-personalized schedule.</p>
            </CardContent>
        </Card>
    </div>
  );
}
