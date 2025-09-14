import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function TimetablePage() {
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                <Calendar className="w-8 h-8"/>
                Class Timetable
            </h1>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Manage your class schedule with ease.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This feature is under construction. Soon you will be able to add your courses and visualize your weekly timetable.</p>
        </CardContent>
      </Card>
    </div>
  );
}
