import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default function StudyGuidePage() {
  return (
    <div className="space-y-6">
        <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
                <BookOpen className="w-10 h-10 text-primary"/>
            </div>
            <h1 className="text-4xl font-bold font-headline">AI Study Guide Generator</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
                Generate a comprehensive study guide for your courses by simply uploading your scheme of work or syllabus.
            </p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>Upload your course syllabus to create a study guide.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">This feature is under construction. Soon, you'll be able to transform your course materials into a structured study plan.</p>
            </CardContent>
        </Card>
    </div>
  );
}
