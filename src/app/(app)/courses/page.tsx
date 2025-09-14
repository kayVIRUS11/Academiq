import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookCopy } from "lucide-react";

export default function CoursesPage() {
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                <BookCopy className="w-8 h-8"/>
                Course Management
            </h1>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>Manage your courses, notes, and progress in one place.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This feature is under construction. You will soon be able to add courses and track your progress for each one.</p>
        </CardContent>
      </Card>
    </div>
  );
}
