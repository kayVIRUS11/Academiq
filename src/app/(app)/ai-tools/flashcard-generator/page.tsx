
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Blocks } from "lucide-react";
import { FlashcardGenerator } from "./flashcard-generator";

export default function FlashcardGeneratorPage() {
  return (
    <div className="space-y-6">
        <div className="flex flex-col items-center text-center">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
                <Blocks className="w-10 h-10 text-primary"/>
            </div>
            <h1 className="text-4xl font-bold font-headline">AI Flashcard Generator</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
                Upload a document (.txt, .pdf, .pptx) and our AI will automatically create a set of flashcards for you.
            </p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Generate New Flashcards</CardTitle>
                <CardDescription>Select a file from your device to begin.</CardDescription>
            </CardHeader>
            <CardContent>
                <FlashcardGenerator />
            </CardContent>
        </Card>
    </div>
  );
}
