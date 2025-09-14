import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function FileSummarizerPage() {
  return (
    <div className="space-y-6">
        <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
                <FileText className="w-10 h-10 text-primary"/>
            </div>
            <h1 className="text-4xl font-bold font-headline">AI File Summarizer</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
                Upload your documents (PDF, PPTX, TXT) and get a concise summary in seconds. Perfect for quick reviews and understanding key points.
            </p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>Upload a file to get started.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">This feature is under construction. You will soon be able to upload your files and receive AI-generated summaries that you can save to your notes.</p>
            </CardContent>
        </Card>
    </div>
  );
}
