import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NotebookText } from "lucide-react";

export default function NotesPage() {
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                <NotebookText className="w-8 h-8"/>
                Notes & Journal
            </h1>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>A rich text editor for your notes, tagged by course or project.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This feature is under construction. Get ready to take, organize, and summarize your notes with AI-powered tools.</p>
        </CardContent>
      </Card>
    </div>
  );
}
