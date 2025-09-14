import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Timer } from "lucide-react";

export default function StudyTrackerPage() {
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                <Timer className="w-8 h-8"/>
                Study Tracker
            </h1>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Log study sessions and visualize your weekly progress.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This feature is under construction. You'll soon be able to log your study time and see detailed analytics on your habits.</p>
        </CardContent>
      </Card>
    </div>
  );
}
