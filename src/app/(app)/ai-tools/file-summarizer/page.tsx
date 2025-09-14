import { FileText } from "lucide-react";
import { FileSummarizer } from "./file-summarizer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FileSummarizerPage() {
  return (
    <div className="space-y-6">
        <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
                <FileText className="w-10 h-10 text-primary"/>
            </div>
            <h1 className="text-4xl font-bold font-headline">AI File Summarizer</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
                Upload your documents (.txt format) and get a concise summary in seconds. Perfect for quick reviews and understanding key points.
            </p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Upload Document</CardTitle>
                <CardDescription>Select a .txt file from your device to begin.</CardDescription>
            </CardHeader>
            <CardContent>
                <FileSummarizer />
            </CardContent>
        </Card>
    </div>
  );
}
