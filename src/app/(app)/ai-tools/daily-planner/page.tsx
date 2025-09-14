import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { DailyPlannerForm } from "./daily-planner-form";

export default function DailyPlannerPage() {
  return (
    <div className="space-y-6">
        <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
                <CalendarDays className="w-10 h-10 text-primary"/>
            </div>
            <h1 className="text-4xl font-bold font-headline">AI Daily Planner</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
                Let our AI create a detailed, hour-by-hour plan for your day based on your tasks, timetable, and personal goals. Review the generated plan and save it to your calendar.
            </p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Create Your Plan</CardTitle>
                <CardDescription>Select a day and tell the AI what you want to accomplish, your energy levels, and any preferences you have.</CardDescription>
            </CardHeader>
            <CardContent>
                <DailyPlannerForm />
            </CardContent>
        </Card>
    </div>
  );
}
